# kirbyuse

A collection of Vue Composition utilities and other helpers to improve the DX when writing Kirby Panel plugins. It is intended for the Composition API, but also works with the Options API.

> [!NOTE]
> When Kirby migrates to Vue 3, this package will adapt accordingly.

## Features

- 🧃 IntelliSense support for Kirby's global `window.panel` object
- 🍿 Helpers like `usePanel` to write future-proof Kirby plugins
- 🚀 Aliases for Composition API functions like `ref` and `computed`

## Setup

```bash
# pnpm
pnpm add -D kirbyuse

# npm
npm i -D kirbyuse

# yarn
yarn add -D kirbyuse
```

## Examples

### Kirby Panel Type Augmentation

> [!NOTE]
> This works for Vue components written in the Options API as well as the Composition API! TypeScript is not required. The type hints are provided by the package itself.

Kirby's `window.panel` global object provides the main Panel instance, including all helper methods and services. This package augments the `window.panel` object to provide type hints out of the box.

In order to use the type hints, you have to import the `usePanel` function from this package. This function returns the augmented `window.panel` object. This works both in the Options API and the Composition API.

For example, the `notification` service is available on the `panel` object. With each method call, you get IntelliSense support in your editor:

```js
import { usePanel } from "kirbyuse";

const panel = usePanel();
panel.notification.success("Kirby is awesome!");
//                 ^? (property) PanelNotification.success: (arg1: any) => any
```

If you are writing a Vue component in the Options API, you can use the `panel` instance in methods like `created`:

```js
import { usePanel } from "kirbyuse";

export default {
  mounted() {
    const panel = usePanel();
    panel.notification.success("Guten Tag!");
  },
};
```

> [!NOTE]
> Type augmentations are generated based on the Kirby Panel JavaScript build. Especially types of function arguments and return types cannot be inferred. But for working with the Panel API, this should be sufficient.

### Panel Section

```vue
<script setup>
import { computed, ref, usePanel, useStore, watch } from "kirbyuse";

const panel = usePanel();
const store = useStore();

const label = ref("");
const currentContent = computed(() => store.getters["content/values"]());

watch(currentContent, (content) => {
  console.log("Content changed:", content);
});

function handleClick() {
  panel.notification.success("Composition API is awesome!");
}
</script>

<template>
  <k-section :label="label">
    <k-text>
      <h1 @click="handleClick()">My Section</h1>
    </k-text>
  </k-section>
</template>
```

<details>
<summary>👉 How to load section data</summary>

```vue
<script>
import { ref, useSection, watch } from "kirbyuse";
import { section } from "kirbyuse/props";

// Define the component props
const propsDefinition = {
  ...section,
};

export default {
  inheritAttrs: false,
};
</script>

<script setup>
const props = defineProps(propsDefinition);

const label = ref("");

// Async components are not supported in Vue 2, so we use
// a self-invoking async function as `created` replacement
(async () => {
  const { load } = useSection();
  const response = await load({
    parent: props.parent,
    name: props.name,
  });

  label.value = response.label || "My Section";
})();
</script>

<template>
  <k-section :label="label">
    <k-text>
      <h1>My Section</h1>
    </k-text>
  </k-section>
</template>
```

</details>

## Background

Kirby CMS uses Vue 2 and provides the `Vue` constructor via the UMD build in the global scope. The main Kirby Panel instance is accessible at `window.panel.app`.

Before Vue reached EOL, the Composition API was backported in Vue 2.7. In ESM builds, these APIs are provided as named exports:

```js
import Vue, { ref } from "vue";

Vue.ref; // `undefined`, use named export instead
```

Since Kirby uses the UMD build, these APIs are not available. Instead, in the **UMD build**, these APIs are exposed as properties on the global Vue object:

```js
import Vue from "vue";

Vue.ref; // `function`
```

When writing Vue components for Kirby with the Composition API, you have to import the Vue constructor from the global scope and use the Composition API from there:

```js
import Vue from "vue";

const label = Vue.ref("");
```

This approach gets tedious quickly, especially when you have to write a lot of components. It also makes it harder to upgrade to Vue 3 in the future.

This is where this package comes in. It provides aliases to the Composition API that are compatible with the UMD build of Vue. Additionally, some helpers are provided to make working with Kirby easier:

```js
// Inside `<script setup>`
import { computed, ref, usePanel } from "kirbyuse";

const label = ref("");

const panel = usePanel();
panel.notification.success("Composition API is awesome!");
```

## Composition API in Panel Plugins

The following open source plugins are written with the Vue Composition API:

- [Kirby Content Translator](https://github.com/kirby-tools/kirby-content-translator)
- [Kirby SERP Preview](https://github.com/johannschopplich/kirby-serp-preview)

## License

[MIT](./LICENSE) License © 2024-PRESENT [Johann Schopplich](https://github.com/johannschopplich)
