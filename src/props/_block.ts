/**
 * @see https://github.com/getkirby/kirby/blob/main/panel/src/components/Forms/Blocks/Elements/BlockTitle.vue
 * @see https://github.com/getkirby/kirby/blob/main/panel/src/components/Forms/Blocks/Types/Default.vue
 */
export const block = {
  /**
   * The block content is an object of values,
   * depending on the block type.
   */
  content: {
    default: () => ({}),
    type: [Array, Object],
  },
  /**
   * The fieldset definition with all fields, tabs, etc.
   */
  fieldset: {
    default: () => ({}),
    type: Object,
  },
  /**
   * API endpoints
   * @value { field, model, section }
   */
  endpoints: {
    default: () => ({}),
    type: [Array, Object],
  },
  /**
   * A unique ID for the block
   */
  id: String,
};
