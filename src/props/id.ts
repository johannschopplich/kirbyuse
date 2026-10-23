import { useId } from "vue";

export const id = {
  /**
   * A unique ID
   */
  id: {
    type: [Number, String],
    default: () => useId(),
  },
};
