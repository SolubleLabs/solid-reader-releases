import {
  clearLocalBridgeCachedBaseUrl,
  isLocalBridgeUnreachableError,
  pingLocalBridgeWithTimeout,
} from "./local-bridge-client";

export const SOLID_READER_LAUNCH_URI = "solid-reader://launch";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function tryLaunchSolidReader(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.location.assign(SOLID_READER_LAUNCH_URI);
}

export async function waitForLocalBridgePong(options: {
  maxWaitMs: number;
  pollDelayMs?: number;
  pingTimeoutMs?: number;
}): Promise<boolean> {
  const { maxWaitMs, pollDelayMs = 1_000, pingTimeoutMs = 2_500 } = options;
  const deadline = Date.now() + maxWaitMs;

  while (Date.now() < deadline) {
    try {
      const response = await pingLocalBridgeWithTimeout(
        Math.min(pingTimeoutMs, Math.max(500, deadline - Date.now())),
      );
      if (response.ok && (await response.text()).trim() === "pong") {
        return true;
      }
    } catch (error) {
      if (!isLocalBridgeUnreachableError(error)) {
        console.warn("[solid-reader-recovery] Unexpected ping failure", error);
      }
    }

    clearLocalBridgeCachedBaseUrl();
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      break;
    }
    await sleep(Math.min(pollDelayMs, remainingMs));
  }

  return false;
}
