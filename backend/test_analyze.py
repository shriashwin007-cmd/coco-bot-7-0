"""POST test images to the local /analyze endpoint and print results."""

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
    with urllib.request.urlopen(req, timeout=600) as resp:
        return json.loads(resp.read().decode())


for name in ("test-littered.jpg", "test-clean.jpg"):
    print(f"=== {name} ===", flush=True)
    result = post_image(name)
    print(json.dumps(result, indent=2), flush=True)
