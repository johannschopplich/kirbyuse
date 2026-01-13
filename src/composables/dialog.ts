import type { KirbyFieldProps } from "kirby-types";
import { usePanel } from "./panel";

/**
 * Dialog size options.
 *
 * @see https://github.com/getkirby/kirby/blob/main/panel/src/mixins/dialog.js
 */
export type DialogSize = "small" | "default" | "medium" | "large" | "huge";

/**
 * Button theme options.
 *
 * Includes semantic themes, color themes, and special themes.
 * Any theme can be suffixed with `-icon` to only color the icon.
 *
 * @see https://github.com/getkirby/kirby/blob/main/panel/src/styles/utilities/theme.css
 */
export type ButtonTheme =
  // Semantic themes
  | "positive"
  | "negative"
  | "info"
  | "notice"
  | "warning"
  | "passive"
  | "error"
  | "love"
  | "text"
  // Color themes
  | "red"
  | "orange"
  | "yellow"
  | "blue"
  | "pink"
  | "green"
  | "aqua"
  | "purple"
  | "gray"
  | "white"
  // Special themes
  | "dark"
  | "code"
  | "empty"
  | "none"
  // Icon-only variants
  | `${string}-icon`;

/**
 * Button configuration for dialog buttons.
 *
 * @see https://github.com/getkirby/kirby/blob/main/panel/src/components/Navigation/Button.vue
 */
export interface DialogButtonProps {
  /** Button text */
  text?: string;
  /** Icon identifier */
  icon?: string;
  /** Button color theme */
  theme?: ButtonTheme;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button variant */
  variant?: "filled" | "dimmed";
}

/**
 * Field definition for dialog fields.
 */
export type DialogFieldProps = Partial<Omit<KirbyFieldProps, "type">> & {
  type: string;
  /** Allow additional field-type-specific properties */
  [key: string]: unknown;
};

/**
 * Props for opening a fields dialog.
 *
 * @see https://github.com/getkirby/kirby/blob/main/panel/src/components/Dialogs/FormDialog.vue
 */
export interface FieldsDialogProps<T = Record<string, any>> {
  /**
   * Dialog width.
   * @default "medium"
   */
  size?: DialogSize;
  /**
   * Submit button configuration. Can be:
   * - `false` to hide the button
   * - A string for the button text
   * - An object with button props
   */
  submitButton?: false | string | DialogButtonProps;
  /**
   * Cancel button configuration.
   */
  cancelButton?: false | string | DialogButtonProps;
  /**
   * Optional text shown above the fields.
   */
  text?: string;
  /**
   * Empty state message if no fields are defined.
   */
  empty?: string;
  /**
   * Field definitions as object (keyed by field name) or array.
   */
  fields?: Record<string, DialogFieldProps> | DialogFieldProps[];
  /**
   * Initial values for the fields.
   */
  value?: Partial<T>;
}

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
  function openFieldsDialog<T = Record<string, any>>(
    props: FieldsDialogProps<T>,
  ) {
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
          submit: (event: unknown) => {
            result = event as T;
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
