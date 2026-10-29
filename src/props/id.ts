import { useId } from "vue";

export const id = {
  id: {
    type: [Number, String],
    default: () => useId(),
  },
};
