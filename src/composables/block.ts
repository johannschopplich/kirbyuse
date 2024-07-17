/**
 * Provides block methods exposed by the default block component (Options API), which all custom blocks are extending.
 * Since Options API methods are not avaiable in Composition API, we need to extract them into a composable.
 *
 * @see https://github.com/getkirby/kirby/blob/f9f00b16a22fe9dbbbddc2bfd4719ca3437cbee9/panel/src/components/Forms/Blocks/Types/Default.vue#L37
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
  props: Record<string, any>,
  emit?: (...args: any[]) => void,
) {
  const field = (name: string, fallback = null) => {
    let field = null;

    for (const tab of Object.values(
      (props.fieldset.tabs ?? {}) as Record<string, any>,
    )) {
      if (tab.fields[name]) {
        field = tab.fields[name];
      }
    }

    return field ?? fallback;
  };

  const open = () => {
    emit?.("open");
  };

  const update = (content: Record<string, any>) => {
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
