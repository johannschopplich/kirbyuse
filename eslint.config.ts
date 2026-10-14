import antfu from "@antfu/eslint-config";

export default antfu(
  {
    stylistic: false,
  },
  {
    rules: {
      // `stylistic: false` keeps this Vue rule, which contradicts Prettier.
      "vue/singleline-html-element-content-newline": "off",
    },
  },
);
