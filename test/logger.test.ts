import { afterEach, describe, expect, it, vi } from "vitest";
import { createLogger } from "../src/utils/logger";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createLogger", () => {
  it("sends warn to console.warn", () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});

    createLogger("plugin").warn("Deprecated");

    expect(consoleWarn).toHaveBeenCalledOnce();
  });
});
