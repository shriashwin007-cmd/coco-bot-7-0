"""COCO BOT 7.0 — POST test images to the local /analyze endpoint and validate the contract.

Run while the backend is up:
    python -m uvicorn main:app --host 127.0.0.1 --port 8000
    python test_analyze.py   (from the backend/ folder)
"""

import json
import urllib.request

BOUNDARY = "TESTBOUNDARY123"


def post_image(path: str) -> dict:
    with open(path, "rb") as f:
        data = f.read()
    ext = path.rsplit(".", 1)[-1].lower()
    ctype = "image/jpeg" if ext in ("jpg", "jpeg") else f"image/{ext}"
    body = (
        f"--{BOUNDARY}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{path}"\r\n'
        f"Content-Type: {ctype}\r\n\r\n"
    ).encode() + data + f"\r\n--{BOUNDARY}--\r\n".encode()
    req = urllib.request.Request(
        "http://127.0.0.1:8000/analyze",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={BOUNDARY}"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read().decode())


REQUIRED_KEYS = {
    "predicted_label",
    "status",
    "model_score",
    "score_description",
    "explanation",
    "recommended_next_step",
    "metrics",
    "analysis_source",
    "model_info",
}

for name in ("test-leaf-healthy.png", "test-leaf-stressed.png"):
    print(f"=== {name} ===", flush=True)
    result = post_image(name)
    missing = REQUIRED_KEYS - set(result)
    assert not missing, f"Missing keys: {missing}"
    assert result["status"] in ("healthy", "needs_inspection"), result["status"]
    assert result["analysis_source"] == "REAL AI"
    print(f"  status={result['status']} score={result['model_score']} label={result['predicted_label']}")

print("Contract OK: all required keys present, labels within supported set.")
