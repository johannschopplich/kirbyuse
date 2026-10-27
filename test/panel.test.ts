import type { Panel } from "kirby-types";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";
import {
  providePanel,
  setActivePanel,
  usePanel,
} from "../src/composables/panel";

const activePanel = { title: "active" } as unknown as Panel;
const providedPanel = { title: "provided" } as unknown as Panel;

afterEach(() => {
  setActivePanel(undefined);
  vi.unstubAllGlobals();
});

describe("usePanel", () => {
  it("returns window.panel when nothing is provided or active", () => {
    const panel = { title: "window" } as unknown as Panel;
    vi.stubGlobal("window", { panel });

    expect(usePanel()).toBe(panel);
  });

  it("returns the active panel over window.panel", () => {
    vi.stubGlobal("window", { panel: { title: "window" } });
    setActivePanel(activePanel);

    expect(usePanel()).toBe(activePanel);
  });

  it("returns the active panel a second kirbyuse copy sets", async () => {
    vi.resetModules();
    const otherCopy = await import("../src/composables/panel");
    otherCopy.setActivePanel(activePanel);

    expect(usePanel()).toBe(activePanel);
  });

  it("returns the provided panel over the active one in a descendant's setup", async () => {
    setActivePanel(activePanel);
    let resolvedPanel: Panel | undefined;

    const Child = defineComponent({
      setup() {
        resolvedPanel = usePanel();
        return () => null;
      },
    });
    const Parent = defineComponent({
      setup() {
        providePanel(providedPanel);
        return () => h(Child);
      },
    });

    await renderToString(createSSRApp(Parent));

    expect(resolvedPanel).toBe(providedPanel);
  });

  it("returns the active panel in a component tree that provides none", async () => {
    setActivePanel(activePanel);
    let resolvedPanel: Panel | undefined;

    const Component = defineComponent({
      setup() {
        resolvedPanel = usePanel();
        return () => null;
      },
    });

    await renderToString(createSSRApp(Component));

    expect(resolvedPanel).toBe(activePanel);
  });
});
