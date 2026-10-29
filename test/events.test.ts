import type { Panel } from "kirby-types";
import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
import { usePanelEvent } from "../src/composables/events";
import { setActivePanel } from "../src/composables/panel";

type Listener = (...args: any[]) => void;

function createPanel() {
  const listenersByEvent = new Map<string, Set<Listener>>();

  return {
    events: {
      on: (event: string, listener: Listener) => {
        if (!listenersByEvent.has(event))
          listenersByEvent.set(event, new Set());
        listenersByEvent.get(event)!.add(listener);
      },
      off: (event: string, listener: Listener) => {
        listenersByEvent.get(event)?.delete(listener);
      },
      emit: (event: string, payload?: unknown) => {
        for (const listener of listenersByEvent.get(event) ?? []) {
          listener(payload);
        }
      },
    },
  } as unknown as Panel;
}

afterEach(() => {
  setActivePanel(undefined);
  vi.restoreAllMocks();
});

describe("usePanelEvent", () => {
  it("stops listening when its effect scope stops", () => {
    const panel = createPanel();
    setActivePanel(panel);
    const payloads: unknown[] = [];
    const scope = effectScope();

    scope.run(() =>
      usePanelEvent("view.save", (payload) => payloads.push(payload)),
    );
    panel.events.emit("view.save", "first");
    scope.stop();
    panel.events.emit("view.save", "second");

    expect(payloads).toEqual(["first"]);
  });

  it("registers outside an effect scope without a Vue warning", () => {
    setActivePanel(createPanel());
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    usePanelEvent("view.save", () => {});

    expect(warn).not.toHaveBeenCalled();
  });
});
