import { disabled } from "./disabled";
import { help } from "./help";
import { id } from "./id";
import { label } from "./label";
import { name } from "./name";
import { required } from "./required";

/**
 * @see https://github.com/getkirby/kirby/blob/main/panel/src/components/Forms/Field.vue
 */
export const field = {
  ...disabled,
  ...help,
  ...id,
  ...label,
  ...name,
  ...required,
  counter: [Boolean, Object],
  endpoints: Object,
  input: {
    type: [String, Number, Boolean],
    default: null,
  },
  translate: Boolean,
  type: String,
};
