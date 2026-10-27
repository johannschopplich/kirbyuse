import type { Panel } from "kirby-types";
import type { InjectionKey } from "vue";
import { hasInjectionContext, inject, provide } from "vue";

const panelKey: InjectionKey<Panel> = Symbol.for("kirbyuse.panel");
const activePanelStore = globalThis as unknown as Record<
  symbol,
  Panel | undefined
>;

/**
 * Sets the Panel `usePanel()` returns where no provided one reaches the call; `undefined` restores `window.panel`.
 */
export function setActivePanel(panel: Panel | undefined): void {
  activePanelStore[panelKey] = panel;
}

export function providePanel(panel: Panel): void {
  provide(panelKey, panel);
}

/**
 * Returns the reactive Kirby Panel object.
 *
 * @remarks
 * A provided Panel reaches only code that runs in a component's `setup()` or lifecycle hooks, so call `usePanel()` in `setup()` and keep the result.
 */
export function usePanel(): Panel {
  return (
    (hasInjectionContext() && inject(panelKey, undefined)) ||
    activePanelStore[panelKey] ||
    globalThis.window?.panel
  );
}
