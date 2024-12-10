import type { PanelContent } from "../types/panel";
import { computed } from "..";
import { isKirby5 } from "./compatibility";
import { usePanel } from "./panel";
import { useStore } from "./store";

/**
 * Reactive getters and methods to work with content of the current view.
 *
 * @remarks
 * This composable follows the Kirby 5 content API while staying compatible with Kirby 4 (falling back to the Vuex store of Kirby 4).
 */

export function useContent() {
  const panel = usePanel();
  const store = useStore();
  const _isKirby5 = isKirby5();

  const currentContent = _isKirby5
    ? computed<Record<string, any>>(() => panel.view.props.content)
    : computed<Record<string, any>>(() => store.getters["content/values"]());
  const contentChanges = _isKirby5
    ? computed<Record<string, any>>(() => panel.content.changes())
    : computed<Record<string, any>>(() => store.getters["content/changes"]());
  const hasChanges = _isKirby5
    ? computed<boolean>(() => Object.keys(contentChanges.value).length > 0)
    : computed<boolean>(() => store.getters["content/hasChanges"]());
  const content = _isKirby5
    ? panel.content
    : new Proxy({} as PanelContent, {
        get() {
          return () => {
            // `window.panel.content` is not available in Kirby 4
          };
        },
      });

  /**
   * Updates the form values of the current view without saving them.
   */
  const update = (
    values?: Record<string, any>,
  ): Record<string, any> | undefined => {
    if (!_isKirby5 && values) {
      for (const [key, value] of Object.entries(values)) {
        store.dispatch("content/update", [key, value]);
      }
    }

    return content.merge(values);
  };

  return {
    // Properties
    content,
    // Reactive getters
    currentContent,
    contentChanges,
    hasChanges,
    // Methods
    update,
  };
}
