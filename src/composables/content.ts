import { computed } from "vue";
import { usePanel } from "./panel";

/**
 * Provides reactive getters and methods to work with content of the current view.
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
   * Whether the editor may change the current view's content: the model
   * grants `update` and no other user holds the lock.
   */
  const isEditable = computed<boolean>(
    () => panel.view.props.permissions?.update !== false && !content.isLocked(),
  );

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
    content,
    currentContent,
    contentChanges,
    hasChanges,
    isEditable,
    update,
  };
}
