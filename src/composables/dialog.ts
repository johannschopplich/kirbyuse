import { usePanel } from "kirbyuse";

/**
 * Provides methods to open different types of dialogs.
 *
 * @example
 * ```ts
 * const { openTextDialog } = useDialog()
 *
 * const result = await openTextDialog("Are you sure?")
 * console.log(result) // -> true or false
 * ```
 */
export function useDialog() {
  /**
   * Returns a promise that resolves when the dialog is closed.
   */
  function openTextDialog(text: string) {
    let result = false;

    return new Promise<boolean>((resolve) => {
      const panel = usePanel();

      panel.dialog.open({
        component: "k-text-dialog",
        props: { text },
        on: {
          // Close event will always be triggered, even on submit
          close: () => {
            setTimeout(() => {
              resolve(result);
            }, 25);
          },
          submit: () => {
            result = true;
            panel.dialog.close();
          },
        },
      });
    });
  }

  /**
   * Returns a promise that resolves when the dialog is closed.
   */
  function openFieldsDialog(fields: Record<string, any>) {
    let result = false;

    return new Promise<boolean>((resolve) => {
      const panel = usePanel();

      panel.dialog.open({
        component: "k-form-dialog",
        props: {
          fields,
        },
        on: {
          // Close event will always be triggered, even on submit
          close: () => {
            setTimeout(() => {
              resolve(result);
            }, 25);
          },
          submit: () => {
            result = true;
            panel.dialog.close();
          },
        },
      });
    });
  }

  return {
    openTextDialog,
    openFieldsDialog,
  };
}
