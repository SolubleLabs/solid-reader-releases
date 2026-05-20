import { describe, expect, it } from "vitest";
import { SOLID_READER_LAUNCH_URI } from "./solid-reader-recovery";

describe("SOLID_READER_LAUNCH_URI", () => {
  it("matches the desktop app custom protocol", () => {
    expect(SOLID_READER_LAUNCH_URI).toBe("solid-reader://launch");
  });
});
