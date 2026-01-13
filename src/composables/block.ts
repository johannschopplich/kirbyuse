import type { KirbyFieldProps, KirbyFieldsetProps } from "kirby-types";

/**
 * Props passed to block components by Kirby's block field.
 */
export interface BlockComponentProps {
  /** Block content data */
  content: Record<string, unknown>;
  /** Fieldset definition with tabs and fields */
  fieldset: KirbyFieldsetProps;
  /** Allow additional block-specific props */
  [key: string]: unknown;
}

/**
 * Provides block methods exposed by the default block component (Options API), which all custom blocks are extending.
 * Since Options API methods are not avaiable in Composition API, we need to extract them into a composable.
 *
 * @see https://github.com/getkirby/kirby/blob/main/panel/src/components/Forms/Blocks/Types/Default.vue
 *
 * @example
 * ```vue
 * <script setup>
 * import { computed, ref, useApi, usePanel, watch } from "kirbyuse";
 *
 * // Will inherit props from extended default block
 * const props = defineProps({});
 * const emit = defineEmits([]);
 *
 * const { field, open, update } = useBlock(props, emit);
 * ```
 */
export function useBlock(
  props: BlockComponentProps,
  emit?: (...args: unknown[]) => void,
) {
  const field = (name: string, fallback?: KirbyFieldProps) => {
    let result: KirbyFieldProps | undefined;

    for (const tab of Object.values(props.fieldset.tabs ?? {})) {
      if (tab.fields?.[name]) {
        result = tab.fields[name];
      }
    }

    return result ?? fallback;
  };

  const open = () => {
    emit?.("open");
  };

  const update = (content: Record<string, unknown>) => {
    emit?.("update", {
      ...props.content,
      ...content,
    });
  };

  return {
    field,
    open,
    update,
  };
}
