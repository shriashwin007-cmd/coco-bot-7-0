"""
COCO BOT 7.0 — real model training on PlantVillage (no Kaggle account needed).

Pipeline
--------
1. Download PlantVillage via TensorFlow Datasets (no auth, ~1 GB).
2. Write a stratified on-disk subset to backend/data/plant_village_subset/
   (<=450 train + <=80 val images per class, 38 classes).
3. Transfer-learn MobileNetV2 (frozen base -> train head, then unfreeze top).
4. Evaluate on the held-out split, print honest accuracy.
5. Export backend/leaf_disease_model.onnx + backend/labels.txt + backend/metrics.json.

Preprocessing contract (backend/main.py replicates this EXACTLY in NumPy):
  RGB uint8 [0,255] -> resize to IMG x IMG (bilinear) -> x / 127.5 - 1.

Run (Windows, from backend/):
  .\\.venv-train\\Scripts\\python train_model.py

Training takes ~1-3 h on CPU; run it and leave the machine on.
"""

from __future__ import annotations

import json
import os
import random

import numpy as np
import tensorflow as tf
import tensorflow_datasets as tfds

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data", "plant_village_subset")
MODEL_KERAS = os.path.join(BASE_DIR, "leaf_disease_model.keras")
MODEL_ONNX = os.path.join(BASE_DIR, "leaf_disease_model.onnx")
LABELS_TXT = os.path.join(BASE_DIR, "labels.txt")
METRICS_JSON = os.path.join(BASE_DIR, "metrics.json")

IMG = 192
BATCH = 32
PER_CLASS_TRAIN = 450
PER_CLASS_VAL = 80
EPOCHS_HEAD = 10
EPOCHS_FINE = 5
SEED = 7


def pretty(name: str) -> str:
    return name.replace("___", " — ").replace("__", " ").replace("_", " ")


def build_subset() -> tuple[list[str], int]:
    """One decode pass over TFDS; write stratified JPEG folders. Returns (labels, n_train)."""
    if os.path.exists(os.path.join(DATA_DIR, "train")):
        labels = sorted(os.listdir(os.path.join(DATA_DIR, "train")))
        n = sum(len(files) for _, _, files in os.walk(os.path.join(DATA_DIR, "train")))
        print(f"Subset already on disk: {len(labels)} classes, {n} train images.")
        return labels, n

    print("Downloading PlantVillage via TFDS (one-time, ~1 GB)...")
    ds, info = tfds.load("plant_village", split="train", with_info=True, as_supervised=False)
    raw_labels: list[str] = info.features["label"].names
    print(f"TFDS ready: {info.splits['train'].num_examples} images, {len(raw_labels)} classes.")

    buckets: dict[int, list[np.ndarray]] = {i: [] for i in range(len(raw_labels))}
    for ex in tfds.as_numpy(ds):
        buckets[int(ex["label"])].append(ex["image"])

    rng = random.Random(SEED)
    labels = [pretty(n) for n in raw_labels]
    n_train = 0
    for idx, raw in enumerate(raw_labels):
        imgs = buckets[idx]
        rng.shuffle(imgs)
        train_imgs = imgs[:PER_CLASS_TRAIN]
        val_imgs = imgs[PER_CLASS_TRAIN:PER_CLASS_TRAIN + PER_CLASS_VAL]
        for split, subset in (("train", train_imgs), ("validation", val_imgs)):
            d = os.path.join(DATA_DIR, split, raw)
            os.makedirs(d, exist_ok=True)
            for j, img in enumerate(subset):
                tf.keras.utils.save_img(os.path.join(d, f"{j:04d}.jpg"), img)
        n_train += len(train_imgs)
        print(f"  {raw}: {len(train_imgs)} train / {len(val_imgs)} val")

    with open(LABELS_TXT, "w", encoding="utf-8") as f:
        f.write("\n".join(labels) + "\n")
    print(f"Subset written to {DATA_DIR}; labels -> {LABELS_TXT}")
    return labels, n_train


def make_datasets() -> tuple[tf.data.Dataset, tf.data.Dataset, int]:
    train_ds = tf.keras.utils.image_dataset_from_directory(
        os.path.join(DATA_DIR, "train"),
        image_size=(IMG, IMG),
        batch_size=BATCH,
        shuffle=True,
        seed=SEED,
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        os.path.join(DATA_DIR, "validation"),
        image_size=(IMG, IMG),
        batch_size=BATCH,
        shuffle=False,
    )
    n_classes = len(train_ds.class_names)
    # image_dataset_from_directory sorts folders alphabetically; TFDS label ids
    # are already alphabetical, so index order matches labels.txt. Verify:
    raw_sorted = sorted(os.listdir(os.path.join(DATA_DIR, "train")))
    assert [pretty(r) for r in raw_sorted] == open(LABELS_TXT, encoding="utf-8").read().splitlines(), \
        "Label order mismatch between folders and labels.txt!"
    train_ds = train_ds.prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.prefetch(tf.data.AUTOTUNE)
    return train_ds, val_ds, n_classes


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
    labels, n_train = build_subset()
    train_ds, val_ds, n_classes = make_datasets()
    print(f"Classes: {n_classes}, train images capped at ~{n_train}")

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

    loss, acc = model.evaluate(val_ds)
    print(f"\nHELD-OUT VALIDATION ACCURACY: {acc:.4f} (loss {loss:.4f})")

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
        "model": "MobileNetV2 transfer learning on PlantVillage subset",
        "image_size": IMG,
        "classes": n_classes,
        "labels_file": "labels.txt",
        "validation_accuracy": round(float(acc), 4),
        "validation_loss": round(float(loss), 4),
        "note": "Accuracy measured on the held-out stratified split, not training data.",
    }
    with open(METRICS_JSON, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print("Metrics ->", METRICS_JSON)
    print("DONE. Backend will pick up leaf_disease_model.onnx + labels.txt automatically.")


if __name__ == "__main__":
    main()
