import type { PanelContent } from "kirby-types";
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

  if (_isKirby5 && !("diff" in panel.content)) {
    throw new Error(
      "This plugin requires Kirby 5.0.0-rc.1 or higher. Please update your Kirby installation.",
    );
  }

  const currentContent = _isKirby5
    ? computed<Record<string, any>>(() => panel.content.version("changes"))
    : computed<Record<string, any>>(() => store.getters["content/values"]());
  const contentChanges = _isKirby5
    ? computed<Record<string, any>>(() => panel.content.diff())
    : computed<Record<string, any>>(() => store.getters["content/changes"]());
  const hasChanges = _isKirby5
    ? computed<boolean>(() => panel.content.hasDiff())
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
   * Updates the form values of the current view.
   *
   * @remarks
   * In Kirby 5, the native `window.panel.content.update()` method immediately saves the changes to the backend storage. This can be prevented by passing `false` as the second argument.
   * In Kirby 4, content changes are only stored in the Vuex store and do not need to be saved explicitly.
   */
  const update = async (values?: Record<string, any>, save = true) => {
    if (!_isKirby5 && values) {
      for (const [key, value] of Object.entries(values)) {
        store.dispatch("content/update", [key, value]);
      }
    }

    const viewContent = content.merge(values);

    if (save) {
      await content.save(viewContent);
    }
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
