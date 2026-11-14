import type { KirbyFieldsetProps, KirbyFieldsetTab } from "kirby-types";

/**
 * Props passed to block components by Kirby's block field.
 */
export interface BlockComponentProps {
  content?: Record<string, any> | unknown[];
  /** Fieldset definition, nesting its fields under tabs. */
  fieldset?: Partial<KirbyFieldsetProps>;
  [key: string]: unknown;
}

type BlockField = KirbyFieldsetTab["fields"][string];

/**
 * Provides block methods exposed by the default block component (Options API), which all custom blocks are extending.
 * Since Options API methods are not available in Composition API, we need to extract them into a composable.
 *
 * @see https://github.com/getkirby/kirby/blob/main/panel/src/components/Forms/Blocks/Types/Default.vue
 *
 * @example
 * ```vue
 * <script setup>
 * import { useBlock } from "kirbyuse";
 *
 * // Will inherit props from extended default block
 * const props = defineProps({});
 * const emit = defineEmits(["open", "update"]);
 *
 * const { field, open, update } = useBlock(props, emit);
 * ```
 */
export function useBlock(
  props: BlockComponentProps,
  emit: (event: any, ...args: any[]) => void,
) {
  function field(name: string): BlockField | undefined;
  function field<T>(name: string, fallback: T): BlockField | T;
  function field(name: string, fallback?: unknown) {
    let result: BlockField | undefined;

    for (const tab of Object.values(props.fieldset?.tabs ?? {})) {
      if (tab.fields?.[name]) {
        result = tab.fields[name];
      }
    }

    return result ?? fallback;
  }

  const open = () => {
    emit("open");
  };

  const update = (content: Record<string, unknown>) => {
    emit("update", {
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
