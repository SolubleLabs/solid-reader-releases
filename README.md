# SolId Reader

**Thai ID smart-card bridge helper** — reads Thai national ID cards on your PC and exposes the data on a local HTTP API (loopback only).

Download installers and binaries from [Releases](https://github.com/SolubleLabs/solid-reader-releases/releases). Version info and checksums are in `update.json` on each release.

**Source / development:** [SolubleLabs/solid-reader](https://github.com/SolubleLabs/solid-reader)

## Download

| Platform | File |
|----------|------|
| Windows | `SolId-Reader-Setup.exe` |
| macOS (Apple Silicon) | `SolidReader-darwin-arm64.zip` |
| macOS (Intel) | `SolidReader-darwin-x64.zip` |
| Linux (x64) | `SolidReader-linux-x64-gnu.zip` |

## Requirements

- Smart card reader with PC/SC drivers
- Thai ID card

## Usage

1. Install or run the app for your platform. The bridge listens on port **18310**.
2. **Windows / Linux:** `http://127.0.0.1:18310`
3. **macOS (packaged app):** `https://localhost:18310` (local HTTPS for Safari). On Windows, use `127.0.0.1` with **http**, not `https://localhost`.
4. **Auth:** send header `x-solid-reader-token: <secret>` on every request. Default secret is `my-shared-secret`. Override with env `SHARED_SECRET`.

## Quick JSON test

With the app running, insert a card in the reader, then run:

```ts
fetch("http://127.0.0.1:18310/read-id", {
  headers: { "x-solid-reader-token": "my-shared-secret" },
})
  .then((r) => r.json())
  .then((j) => console.log(JSON.stringify(j, null, 2)));
```

```bash
node -e "fetch('http://127.0.0.1:18310/read-id',{headers:{'x-solid-reader-token':'my-shared-secret'}}).then(r=>r.json()).then(j=>console.log(JSON.stringify(j,null,2)))"
```

On macOS HTTPS builds, use `https://localhost:18310` in the URL instead.

## Card read API

All routes below require header `x-solid-reader-token: <secret>`.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ping` | GET | Plain text health (`pong`) |
| `/health` | GET | JSON health `{ "ok": true }` |
| `/read-id` | GET | Read card (waits for insertion) |

**Success:**

```json
{ "success": true, "data": { "citizenID": "...", "fullNameTH": "...", "photoAsBase64Uri": "data:image/..." } }
```

`data` also includes `fullNameEN`, `dateOfBirth`, `gender`, `address`, and other card fields.

**Failure:**

```json
{ "success": false, "error": "message", "code": "ERROR_CODE" }
```

| Code | HTTP status | Meaning |
|------|-------------|---------|
| `NO_READER` | 503 | No reader detected in time |
| `NO_CARD` | 408 | No card inserted in time |
| `CARD_ERROR` | 500 | Read / PC/SC error |

## Web app integration

From a page in the browser (same machine as the reader):

```js
const BASE =
  navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome")
    ? "https://localhost:18310"
    : "http://127.0.0.1:18310";
const SECRET = "my-shared-secret";

const readRes = await fetch(`${BASE}/read-id`, {
  headers: { "x-solid-reader-token": SECRET },
});
const json = await readRes.json();
if (!json.success) {
  console.error("Read failed:", json.error, json.code);
} else {
  const cardData = json.data;
}
```

HTTPS sites calling the bridge on Chromium need Private Network Access; the bridge allows that. Safari on macOS needs the HTTPS loopback URL above.

See `examples/thai-id-reader` for a minimal Next.js example that uses the same header auth.

## Print bridge (optional)

Same process also exposes local printing for EMR apps (same `x-solid-reader-token` header):

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/printers` | GET | List printers |
| `/print/pdf` | POST | Print a PDF from a URL |

Example print body:

```json
{
  "pdfUrl": "https://your-server/label/123.pdf",
  "printerName": "My_Printer",
  "copies": 1,
  "paperSize": "80x50mm",
  "orientation": "landscape"
}
```

## License

ISC © Soluble Labs
