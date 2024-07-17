/**
 * @see https://github.com/getkirby/kirby/blob/f9f00b16a22fe9dbbbddc2bfd4719ca3437cbee9/panel/src/components/Forms/Blocks/Elements/BlockTitle.vue#L14
 * @see https://github.com/getkirby/kirby/blob/f9f00b16a22fe9dbbbddc2bfd4719ca3437cbee9/panel/src/components/Forms/Blocks/Types/Default.vue#L15
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
