import { onScopeDispose } from "vue";
import { usePanel } from "./panel";

/**
 * Listens to a Panel event until the calling component or effect scope is disposed.
 *
 * @remarks
 * Outside a component or effect scope, such as in an async callback, the listener is never removed.
 *
 * @example
 * ```ts
 * usePanelEvent("content.publish", () => loadRating())
 * ```
 */
export function usePanelEvent(
  event: string,
  listener: (...args: any[]) => void,
): void {
  const panel = usePanel();

  panel.events.on(event, listener);
  onScopeDispose(() => panel.events.off(event, listener), true);
}
