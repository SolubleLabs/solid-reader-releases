const SOLID_READER_LATEST_DOWNLOAD_BASE =
  "https://github.com/SolubleLabs/solid-reader-releases/releases/latest/download/";

export const SOLID_READER_WINDOWS_SETUP_FILE = "SolId-Reader-Setup.exe";
export const SOLID_READER_MAC_ARM64_ZIP = "SolidReader-darwin-arm64.zip";
export const SOLID_READER_MAC_X64_ZIP = "SolidReader-darwin-x64.zip";

export type SolidReaderPlatformKind =
  | "windows"
  | "mac"
  | "unknown";

export interface SolidReaderDownloadOption {
  label: string;
  fileName: string;
  directDownloadUrl: string;
}

function buildLatestDownloadUrl(fileName: string): string {
  return `${SOLID_READER_LATEST_DOWNLOAD_BASE}${fileName}`;
}

export function detectSolidReaderPlatform(): SolidReaderPlatformKind {
  if (typeof navigator === "undefined") {
    return "unknown";
  }

  const platform = navigator.platform ?? "";
  const userAgent = navigator.userAgent ?? "";

  if (/Win/i.test(platform) || /Windows/i.test(userAgent)) {
    return "windows";
  }

  if (/Mac/i.test(platform)) {
    return "mac";
  }

  return "unknown";
}

export function getSolidReaderDownloadOptions(
  platform: SolidReaderPlatformKind = detectSolidReaderPlatform(),
): SolidReaderDownloadOption[] {
  if (platform === "windows") {
    return [
      {
        label: "Download for Windows",
        fileName: SOLID_READER_WINDOWS_SETUP_FILE,
        directDownloadUrl: buildLatestDownloadUrl(SOLID_READER_WINDOWS_SETUP_FILE),
      },
    ];
  }

  if (platform === "mac") {
    return [
      {
        label: "Download for Mac (Apple Silicon)",
        fileName: SOLID_READER_MAC_ARM64_ZIP,
        directDownloadUrl: buildLatestDownloadUrl(SOLID_READER_MAC_ARM64_ZIP),
      },
      {
        label: "Download for Mac (Intel)",
        fileName: SOLID_READER_MAC_X64_ZIP,
        directDownloadUrl: buildLatestDownloadUrl(SOLID_READER_MAC_X64_ZIP),
      },
    ];
  }

  return [];
}
