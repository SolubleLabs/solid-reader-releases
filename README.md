# SolId Reader

Reads Thai national ID cards via a PC/SC reader and returns JSON on `http://127.0.0.1:18310` (macOS app: `https://localhost:18310`).

[Download releases](https://github.com/SolubleLabs/solid-reader-releases/releases) · checksums in `update.json`

## Download

| Platform | File |
|----------|------|
| Windows | `SolId-Reader-Setup.exe` |
| macOS (Apple Silicon) | `SolidReader-darwin-arm64.zip` |
| macOS (Intel) | `SolidReader-darwin-x64.zip` |
| Linux (x64) | `SolidReader-linux-x64-gnu.zip` |

## Requirements

- PC/SC smart card reader + drivers
- Thai ID card

## How to use

1. Run the installer or app. Bridge listens on port **18310**.
2. Add `?secret=my-shared-secret` to requests (change via `SHARED_SECRET` env).
3. Insert the card in the reader, then call **`GET /read-id`**.

**Node (quick test)** — insert card, then:

```ts
fetch("http://127.0.0.1:18310/read-id?secret=my-shared-secret")
  .then((r) => r.json())
  .then((j) => console.log(JSON.stringify(j, null, 2)));
```

```bash
node -e "fetch('http://127.0.0.1:18310/read-id?secret=my-shared-secret').then(r=>r.json()).then(j=>console.log(JSON.stringify(j,null,2)))"
```

**Browser** (same machine as the reader):

```js
const base =
  navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome")
    ? "https://localhost:18310"
    : "http://127.0.0.1:18310";

const res = await fetch(`${base}/read-id?secret=my-shared-secret`);
const json = await res.json();
if (json.success) {
  const card = json.data; // citizenID, fullNameTH, fullNameEN, address, photoAsBase64Uri, ...
}
```

On Windows use `http://127.0.0.1:18310`, not `https://localhost`.

## License

ISC © Soluble Labs
