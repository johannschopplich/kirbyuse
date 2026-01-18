import type { KirbyFieldProps } from "kirby-types";
import { isKirby5 } from "./compatibility";
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
export interface FieldsDialogProps<T = Record<string, any>, R = T> {
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
  /**
   * Custom submit handler. Controls dialog closing behavior.
   * - Return `false` to keep the dialog open (e.g., validation failed)
   * - Return any other value to close the dialog and resolve with that value
   * - Throw to keep the dialog open
   *
   * @example
   * ```ts
   * // Validate before closing (e.g., check slug uniqueness)
   * const data = await openFieldsDialog<{ slug: string }>({
   *   fields,
   *   onSubmit: async (value) => {
   *     const response = await panel.api.post("/site/search", {
   *       query: `slug:${value.slug}`,
   *       limit: 1
   *     })
   *     if (response.data?.length > 0) {
   *       panel.notification.error("This slug is already taken")
   *       return false // Keep dialog open
   *     }
   *     return value // Close dialog, resolve with form values
   *   },
   * })
   *
   * // Transform data before resolving
   * const page = await openFieldsDialog<{ title: string }, { id: string }>({
   *   fields,
   *   onSubmit: async (value) => {
   *     const response = await panel.api.post(`/pages/${parentId}/children`, {
   *       slug: value.slug,
   *       template: "default",
   *       content: { title: value.title }
   *     })
   *     if (!response?.id) {
   *       panel.notification.error("Failed to create page")
   *       return false // Keep dialog open
   *     }
   *     return { id: response.id } // Close dialog, resolve with created resource
   *   },
   * })
   * ```
   */
  onSubmit?: (value: T) => R | false | Promise<R | false>;
}

/**
 * Provides methods to open different types of dialogs.
 */
export function useDialog() {
  const _isKirby5 = isKirby5();

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
          submit: () => {
            result = true;
            panel.dialog.close();
          },
          // TODO: Remove compatibility check in Kirby 6
          ...(_isKirby5
            ? {
                closed: () => {
                  resolve(result);
                },
              }
            : {
                close: () => {
                  setTimeout(() => resolve(result), 25);
                },
              }),
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
  function openFieldsDialog<T extends Record<string, any>, R>(
    props: Omit<FieldsDialogProps<T, R>, "onSubmit"> & {
      onSubmit: (value: T) => R | false | Promise<R | false>;
    },
  ): Promise<R | undefined>;
  function openFieldsDialog<T extends Record<string, any>>(
    props: Omit<FieldsDialogProps<T, T>, "onSubmit">,
  ): Promise<T | undefined>;
  function openFieldsDialog<T extends Record<string, any>, R = T>(
    props: FieldsDialogProps<T, R>,
  ): Promise<R | T | undefined> {
    let result: R | T | undefined;
    const { onSubmit, ...dialogProps } = props;

    return new Promise<R | T | undefined>((resolve) => {
      const panel = usePanel();

      panel.dialog.open({
        component: "k-form-dialog",
        props: dialogProps,
        on: {
          submit: async (event: unknown) => {
            const value = event as T;

            if (onSubmit) {
              try {
                const submitResult = await onSubmit(value);
                if (submitResult === false) {
                  return; // Keep dialog open
                }
                result = submitResult as R;
              } catch {
                return; // Keep dialog open on error
              }
            } else {
              result = value as unknown as R;
            }

            panel.dialog.close();
          },
          // TODO: Remove compatibility check in Kirby 6
          ...(_isKirby5
            ? {
                closed: () => {
                  resolve(result);
                },
              }
            : {
                close: () => {
                  setTimeout(() => resolve(result), 0);
                },
              }),
        },
      });
    });
  }

  return {
    openTextDialog,
    openFieldsDialog,
  };
}
