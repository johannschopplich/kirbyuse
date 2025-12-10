import { computed } from "vue";
import { usePanel } from "./panel";

/**
 * Reactive getters and methods to work with content of the current view.
 *
 * @remarks
 * This composable follows the Kirby 5 content API while staying compatible with Kirby 4 (falling back to the Vuex store of Kirby 4).
 */

export function useContent() {
  const panel = usePanel();

  const currentContent = computed<Record<string, any>>(() =>
    panel.content.version("changes"),
  );
  const contentChanges = computed<Record<string, any>>(() =>
    panel.content.diff(),
  );
  const hasChanges = computed<boolean>(() => panel.content.hasDiff());
  const content = panel.content;

  /**
   * Updates the form values of the current view.
   *
   * @remarks
   * Kirby's native `window.panel.content.update()` method immediately saves the changes to the backend storage. This can be prevented by passing `false` as the second argument.
   */
  const update = async (values?: Record<string, any>, save = true) => {
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
