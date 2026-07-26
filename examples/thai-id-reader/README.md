# Minimal Thai ID Reader Example

Standalone Next.js app that reads a Thai national ID card through SolId Reader's local bridge.

## Run

```bash
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` if you need to change the bridge secret or force a bridge URL.

`NEXT_PUBLIC_PRINT_BRIDGE_SECRET` must match SolId Reader's `SHARED_SECRET`. The example sends it as the `x-solid-reader-token` request header (not as a `?secret=` query param).

SolId Reader must be running on the same machine as the browser, with a PC/SC reader connected and a Thai ID card inserted.

## License

Apache-2.0. See `LICENSE`.
