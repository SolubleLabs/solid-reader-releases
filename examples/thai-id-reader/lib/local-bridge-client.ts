const DEFAULT_BASE_URLS = [
  "https://localhost:18310",
  "http://127.0.0.1:18310",
] as const;

const DEFAULT_SECRET = "my-shared-secret";

let cachedBaseUrl: string | null = null;

export class LocalBridgeUnreachableError extends Error {
  readonly code = "LOCAL_BRIDGE_UNREACHABLE" as const;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "LocalBridgeUnreachableError";
  }
}

export function isLocalBridgeUnreachableError(
  error: unknown,
): error is LocalBridgeUnreachableError {
  return (
    error instanceof LocalBridgeUnreachableError ||
    (error instanceof Error && error.name === "LocalBridgeUnreachableError")
  );
}

function getSecret(): string {
  const configured = process.env.NEXT_PUBLIC_PRINT_BRIDGE_SECRET;
  return configured?.trim() ? configured.trim() : DEFAULT_SECRET;
}

function getBaseUrls(): string[] {
  const configured = process.env.NEXT_PUBLIC_PRINT_BRIDGE_BASE_URL;
  if (configured?.trim()) {
    return [configured.trim()];
  }

  if (cachedBaseUrl) {
    return [
      cachedBaseUrl,
      ...DEFAULT_BASE_URLS.filter((baseUrl) => baseUrl !== cachedBaseUrl),
    ];
  }

  return [...DEFAULT_BASE_URLS];
}

function buildBridgeUrl(baseUrl: string, path: string): string {
  const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  url.searchParams.set("secret", getSecret());
  return url.toString();
}

export function clearLocalBridgeCachedBaseUrl(): void {
  cachedBaseUrl = null;
}

export async function fetchLocalBridge(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  let lastError: unknown = null;

  for (const baseUrl of getBaseUrls()) {
    try {
      const response = await fetch(buildBridgeUrl(baseUrl, path), init);
      cachedBaseUrl = baseUrl;
      return response;
    } catch (error) {
      lastError = error;
    }
  }

  throw new LocalBridgeUnreachableError(
    "Cannot reach SolId Reader. Start SolId Reader and try again.",
    { cause: lastError },
  );
}

function isAbortLikeError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function mergeAbortSignals(signals: AbortSignal[]): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const registrations: Array<{ signal: AbortSignal; handler: () => void }> = [];

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return { signal: controller.signal, cleanup: () => undefined };
    }

    const handler = (): void => controller.abort(signal.reason);
    signal.addEventListener("abort", handler, { once: true });
    registrations.push({ signal, handler });
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      for (const { signal, handler } of registrations) {
        signal.removeEventListener("abort", handler);
      }
    },
  };
}

export async function pingLocalBridge(init?: RequestInit): Promise<Response> {
  return fetchLocalBridge("/ping", init);
}

export async function pingLocalBridgeWithTimeout(
  timeoutMs: number,
  init?: RequestInit,
): Promise<Response> {
  const timeoutController = new AbortController();
  const timeoutId = window.setTimeout(() => timeoutController.abort(), timeoutMs);
  let cleanup: (() => void) | undefined;

  try {
    const outerSignal = init?.signal ?? undefined;
    const signal =
      outerSignal != null
        ? mergeAbortSignals([outerSignal, timeoutController.signal])
        : null;
    cleanup = signal?.cleanup;

    return await pingLocalBridge({
      ...init,
      signal: signal?.signal ?? timeoutController.signal,
    });
  } catch (error) {
    if (isAbortLikeError(error)) {
      throw new LocalBridgeUnreachableError("Local bridge ping timed out.", {
        cause: error,
      });
    }

    throw error;
  } finally {
    cleanup?.();
    window.clearTimeout(timeoutId);
  }
}

export async function readThaiIdCard(): Promise<Response> {
  return fetchLocalBridge("/read-id");
}
