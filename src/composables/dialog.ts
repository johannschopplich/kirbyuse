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
   * const result = await openFieldsDialog<{ email: string }>({ fields })
   * console.log(result) // -> { email: "..." }
   * ```
   */
  function openFieldsDialog<T = Record<string, any>>(props: {
    /** @default "medium" */
    size?: string;
    submitButton?: string | Record<string, any>;
    text?: string;
    /**
     * Empty state message if no fields are defined
     */
    empty?: string;
    /**
     * An array or object with all available fields
     */
    fields?: Record<string, any> | Record<string, any>[];
    /**
     * An object with all values for the fields
     */
    value?: Partial<T>;
  }) {
    let result: T | undefined;

    return new Promise<T | undefined>((resolve) => {
      const panel = usePanel();

      panel.dialog.open({
        component: "k-form-dialog",
        props,
        on: {
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
