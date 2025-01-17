import { usePanel } from "./panel";

/**
 * Provides methods to open different types of dialogs.
 */
export function useDialog() {
  /**
   * Returns a promise that resolves when the dialog is closed.
   *
   * @example
   * ```ts
   * const { openTextDialog } = useDialog()
   *
   * const result = await openTextDialog("Are you sure?")
   * console.log(result) // -> true or false
   * ```
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
   *
   * @example
   * ```ts
   * const { openFieldsDialog } = useDialog()
   *
   * const fields = {
   *   email: {
   *     type: "email",
   *     label: "Email",
   *   }
   * }
   *
   * const result = await openFieldsDialog(fields)
   * console.log(result) // -> { email: "..." }
   * ```
   */
  function openFieldsDialog(fields: Record<string, any>) {
    let result: any;

    return new Promise<any>((resolve) => {
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
          submit: (event: any) => {
            result = event;
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
