# SolId Reader

Thai ID smart-card reader for PC/SC-compatible devices. Reads Thai national ID cards and exposes data via an HTTP API.

## Download

| Platform | File |
|----------|------|
| Windows | `ThaiIDBridge-{version}.exe` |
| macOS | `ThaiIDBridge-{version}` |

Download from [Releases](https://github.com/SolubleLabs/solid-reader-releases) or use `update.json` for version info and checksums.

## Requirements

- Smart card reader with PC/SC drivers
- Thai ID card

## Usage

- **Windows:** Run the installer or executable. Server listens on port **18310**.
- **Auth:** Add `?secret=...` to all API requests. Set `SHARED_SECRET` env var to change the default.

### API

| Endpoint | Method |
|----------|--------|
| `/ping?secret=...` | Health check |
| `/read-id?secret=...` | Read card |

## License

ISC © Soluble Labs
