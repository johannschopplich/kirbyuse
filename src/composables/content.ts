import { computed } from "..";
import { usePanel } from "./panel";

export function useContent() {
  const panel = usePanel();
  const content = panel.content;

  if (!panel.content) {
    throw new Error(
      "The content object is not available. Are you using Kirby 4?",
    );
  }

  const currentContent = computed(() => panel.view.props.content);
  const contentChanges = computed(() => content.changes());

  /**
   * Updates the form values of the current view without saving.
   *
   * @remarks
   * Technically almost identical to `panel.content.update()`, except that it doesn't save the changes.
   */
  const update = (values?: Record<string, any>) => {
    if (!values || Object.keys(values).length === 0) {
      return;
    }

    panel.view.props.content = {
      ...panel.view.props.originals,
      ...values,
    };
  };

  return {
    // Reactive objects
    content,
    currentContent,
    contentChanges,
    // Methods
    update,
  };
}
