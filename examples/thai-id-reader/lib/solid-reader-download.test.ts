import { describe, expect, it } from "vitest";
import {
  SOLID_READER_MAC_ARM64_ZIP,
  SOLID_READER_MAC_X64_ZIP,
  SOLID_READER_WINDOWS_SETUP_FILE,
  getSolidReaderDownloadOptions,
} from "./solid-reader-download";

describe("getSolidReaderDownloadOptions", () => {
  it("uses the latest Windows installer asset", () => {
    expect(getSolidReaderDownloadOptions("windows")).toEqual([
      {
        label: "Download for Windows",
        fileName: SOLID_READER_WINDOWS_SETUP_FILE,
        directDownloadUrl:
          "https://github.com/SolubleLabs/solid-reader-releases/releases/latest/download/SolId-Reader-Setup.exe",
      },
    ]);
  });

  it("offers both Mac zip assets", () => {
    const options = getSolidReaderDownloadOptions("mac");

    expect(options).toHaveLength(2);
    expect(options.map((option) => option.fileName)).toEqual([
      SOLID_READER_MAC_ARM64_ZIP,
      SOLID_READER_MAC_X64_ZIP,
    ]);
    expect(options.map((option) => option.directDownloadUrl)).toEqual([
      "https://github.com/SolubleLabs/solid-reader-releases/releases/latest/download/SolidReader-darwin-arm64.zip",
      "https://github.com/SolubleLabs/solid-reader-releases/releases/latest/download/SolidReader-darwin-x64.zip",
    ]);
  });

  it("does not expose a releases page fallback for unknown OS", () => {
    expect(getSolidReaderDownloadOptions("unknown")).toEqual([]);
  });
});
