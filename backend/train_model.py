"""
COCO BOT 7.0 — real model training on PlantVillage (no Kaggle account needed).

Pipeline
--------
1. Download PlantVillage from HuggingFace (BrandonFors mirror, train+test splits).
2. Write a stratified on-disk subset to backend/data/plant_village_subset/
   (<=450 train + <=80 val images per class, 38 classes) plus a capped
   independent test split (<=100/class).
3. Transfer-learn MobileNetV2 (frozen base -> train head, then unfreeze top).
4. Evaluate on the held-out split AND the independent test split; print honest accuracy.
5. Export backend/leaf_disease_model.onnx + backend/labels.txt + backend/metrics.json.

Preprocessing contract (backend/main.py replicates this EXACTLY in NumPy):
  RGB uint8 [0,255] -> resize to IMG x IMG (bilinear) -> x / 127.5 - 1.

Run (Windows, from backend/):
  .\\.venv-train\\Scripts\\python train_model.py

Slow connections: the dataset download (~1 GB) can take an hour by itself.
Training takes another ~1-2 h on CPU. Leave the machine on.
"""

from __future__ import annotations

import json
import os
import random

import numpy as np
import tensorflow as tf
from datasets import load_dataset

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data", "plant_village_subset")
MODEL_KERAS = os.path.join(BASE_DIR, "leaf_disease_model.keras")
MODEL_ONNX = os.path.join(BASE_DIR, "leaf_disease_model.onnx")
LABELS_TXT = os.path.join(BASE_DIR, "labels.txt")
METRICS_JSON = os.path.join(BASE_DIR, "metrics.json")

HF_DATASET = "BrandonFors/Plant-Diseases-PlantVillage-Dataset"
HF_CONFIG = "default"

IMG = 192
BATCH = 32
PER_CLASS_TRAIN = 450
PER_CLASS_VAL = 80
PER_CLASS_TEST = 100
EPOCHS_HEAD = 10
EPOCHS_FINE = 5
SEED = 7


def pretty(name: str) -> str:
    return name.replace("___", " — ").replace("__", " ").replace("_", " ")


def write_split(hf_split: str, out_name: str, per_class_cap: int) -> dict[str, int]:
    """Decode one HF split once; write stratified JPEG folders. Returns counts."""
    print(f"Loading HF split '{hf_split}' (downloads on first run)...")
    ds = load_dataset(HF_DATASET, HF_CONFIG, split=hf_split)
    buckets: dict[int, list] = {}
    for ex in ds:
        buckets.setdefault(int(ex["label"]), []).append(ex["image"])
    counts: dict[str, int] = {}
    for label_id, imgs in sorted(buckets.items()):
        # Per-class seed: identical order every run, independent of class order,
        # so the validation slice below can skip exactly these train images.
        random.Random(f"{SEED}-{label_id}").shuffle(imgs)
        chosen = imgs[:per_class_cap]
        raw = ds.features["label"].int2str(label_id)
        d = os.path.join(DATA_DIR, out_name, raw)
        os.makedirs(d, exist_ok=True)
        for j, img in enumerate(chosen):
            img.convert("RGB").save(os.path.join(d, f"{j:04d}.jpg"), "JPEG", quality=92)
        counts[raw] = len(chosen)
    print(f"  {out_name}: {sum(counts.values())} images across {len(counts)} classes")
    return counts


def build_subset() -> list[str]:
    """Write stratified train/val/test folders + labels.txt (sorted folder order)."""
    if os.path.exists(os.path.join(DATA_DIR, "train")):
        labels = open(LABELS_TXT, encoding="utf-8").read().splitlines()
        print(f"Subset already on disk: {len(labels)} classes.")
        return labels

    write_split("train", "train", PER_CLASS_TRAIN)
    # Held-out val comes from the same train split (different images per class).
    # Re-read buckets cheaply: take the NEXT images after the train cap.
    print("Loading HF train split again for the held-out validation slice...")
    ds = load_dataset(HF_DATASET, HF_CONFIG, split="train")
    buckets: dict[int, list] = {}
    for ex in ds:
        buckets.setdefault(int(ex["label"]), []).append(ex["image"])
    for label_id, imgs in sorted(buckets.items()):
        random.Random(f"{SEED}-{label_id}").shuffle(imgs)  # same order as write_split
        chosen = imgs[PER_CLASS_TRAIN:PER_CLASS_TRAIN + PER_CLASS_VAL]
        raw = ds.features["label"].int2str(label_id)
        d = os.path.join(DATA_DIR, "validation", raw)
        os.makedirs(d, exist_ok=True)
        for j, img in enumerate(chosen):
            img.convert("RGB").save(os.path.join(d, f"{j:04d}.jpg"), "JPEG", quality=92)
    del ds

    write_split("test", "test_hf", PER_CLASS_TEST)

    # labels.txt MUST follow image_dataset_from_directory's sorted-folder order.
    ordered = sorted(os.listdir(os.path.join(DATA_DIR, "train")))
    labels = [pretty(r) for r in ordered]
    with open(LABELS_TXT, "w", encoding="utf-8") as f:
        f.write("\n".join(labels) + "\n")
    print(f"labels.txt written ({len(labels)} classes, sorted folder order).")
    return labels


def make_datasets() -> tuple[tf.data.Dataset, tf.data.Dataset, tf.data.Dataset, int]:
    def _load(sub: str, shuffle: bool) -> tf.data.Dataset:
        ds = tf.keras.utils.image_dataset_from_directory(
            os.path.join(DATA_DIR, sub),
            image_size=(IMG, IMG),
            batch_size=BATCH,
            shuffle=shuffle,
            seed=SEED,
        )
        return ds

    train_raw = _load("train", True)
    ordered_labels = [pretty(c) for c in train_raw.class_names]
    assert ordered_labels == open(LABELS_TXT, encoding="utf-8").read().splitlines(), \
        "Label order mismatch between folders and labels.txt!"

    train_ds = train_raw.prefetch(tf.data.AUTOTUNE)
    val_ds = _load("validation", False).prefetch(tf.data.AUTOTUNE)
    test_ds = _load("test_hf", False).prefetch(tf.data.AUTOTUNE)
    return train_ds, val_ds, test_ds, len(ordered_labels)


def build_model(n_classes: int) -> tuple[tf.keras.Model, tf.keras.Model]:
    # NOTE: Rescaling(1/127.5, offset=-1) is exactly MobileNetV2's
    # preprocess_input (mode 'tf') and is ONNX-serializable (Lambda is not).
    inputs = tf.keras.Input(shape=(IMG, IMG, 3))
    x = tf.keras.layers.Rescaling(1.0 / 127.5, offset=-1)(inputs)
    x = tf.keras.layers.RandomFlip("horizontal")(x)
    x = tf.keras.layers.RandomRotation(0.08)(x)
    x = tf.keras.layers.RandomZoom(0.12)(x)
    base = tf.keras.applications.MobileNetV2(
        input_shape=(IMG, IMG, 3), include_top=False, weights="imagenet", pooling="avg"
    )
    base.trainable = False
    x = base(x, training=False)
    x = tf.keras.layers.Dropout(0.25)(x)
    outputs = tf.keras.layers.Dense(n_classes, activation="softmax")(x)
    model = tf.keras.Model(inputs, outputs)
    return model, base


def main() -> None:
    tf.random.set_seed(SEED)
    np.random.seed(SEED)
    build_subset()
    train_ds, val_ds, test_ds, n_classes = make_datasets()
    print(f"Classes: {n_classes}")

    model, base = build_model(n_classes)

    print("Phase 1: train classifier head (base frozen)...")
    model.compile(optimizer=tf.keras.optimizers.Adam(1e-3),
                  loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    model.fit(train_ds, validation_data=val_ds, epochs=EPOCHS_HEAD)

    print("Phase 2: fine-tune top of base...")
    base.trainable = True
    for layer in base.layers[:-40]:
        layer.trainable = False
    model.compile(optimizer=tf.keras.optimizers.Adam(1e-5),
                  loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    model.fit(train_ds, validation_data=val_ds, epochs=EPOCHS_FINE)

    val_loss, val_acc = model.evaluate(val_ds)
    test_loss, test_acc = model.evaluate(test_ds)
    print(f"\nHELD-OUT VAL ACCURACY:  {val_acc:.4f} (loss {val_loss:.4f})")
    print(f"INDEPENDENT TEST ACCURACY: {test_acc:.4f} (loss {test_loss:.4f})")

    model.save(MODEL_KERAS)
    print(f"Saved {MODEL_KERAS}")

    print("Converting to ONNX...")
    import tf2onnx
    spec = (tf.TensorSpec((None, IMG, IMG, 3), tf.float32, name="input"),)
    model_proto, _ = tf2onnx.convert.from_keras(model, input_signature=spec, opset=17)
    with open(MODEL_ONNX, "wb") as f:
        f.write(model_proto.SerializeToString())
    print(f"Saved {MODEL_ONNX} ({os.path.getsize(MODEL_ONNX) / 1e6:.1f} MB)")

    metrics = {
        "model": "MobileNetV2 transfer learning on PlantVillage (HF mirror)",
        "dataset": HF_DATASET,
        "image_size": IMG,
        "classes": n_classes,
        "labels_file": "labels.txt",
        "validation_accuracy": round(float(val_acc), 4),
        "independent_test_accuracy": round(float(test_acc), 4),
        "note": "Accuracy measured on held-out data, never on training data.",
    }
    with open(METRICS_JSON, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print("Metrics ->", METRICS_JSON)
    print("DONE. Backend will pick up leaf_disease_model.onnx + labels.txt automatically.")


if __name__ == "__main__":
    main()
