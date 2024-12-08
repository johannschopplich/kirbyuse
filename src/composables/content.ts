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
    ? computed(() => panel.view.props.content)
    : computed(() => store.getters["content/values"]());
  const contentChanges = _isKirby5
    ? computed(() => panel.content.changes())
    : computed(() => store.getters["content/changes"]());
  const hasChanges = _isKirby5
    ? computed(() => store.getters["content/hasChanges"]())
    : computed(() => Object.keys(contentChanges.value).length > 0);

  const content = _isKirby5 ? panel.content : ({} as PanelContent);

  /**
   * Updates the form values of the current view without saving them.
   */
  const update = (values?: Record<string, any>) => {
    if (!values || Object.keys(values).length === 0) {
      return;
    }

    if (!_isKirby5) {
      for (const [key, value] of Object.entries(values)) {
        store.dispatch("content/update", [key, value]);
      }

      return contentChanges.value;
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
