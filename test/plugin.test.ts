import { describe, expect, it } from "vitest";
import { registerPluginAssets } from "../src/utils/plugin";

describe("registerPluginAssets", () => {
  it("throws synchronously for a non-array", () => {
    expect(() => registerPluginAssets({} as never)).toThrow(TypeError);
  });
});
