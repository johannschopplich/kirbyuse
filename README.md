# kirbyuse

A collection of Vue Composition utilities and type hints to improve the DX for writing Kirby Panel plugins. It is intended for the Composition API, but also works with the Options API.

> [!NOTE]
> When Kirby migrates to Vue 3, this package will adapt accordingly.

## Features

- 🧃 IntelliSense support for Kirby's global `window.panel` object
- 🍿 Helpers like `usePanel` to write future-proof Kirby plugins
- 🚀 Aliases for Composition API functions like `ref` and `computed`
- 📇 Ready for Kirby 4 & Kirby 5

## Setup

```bash
# pnpm
pnpm add -D kirbyuse

# npm
npm i -D kirbyuse

# yarn
yarn add -D kirbyuse
```

## Kirby Panel Type Augmentation

> [!NOTE]
> This works for Vue components written in the Options API as well as the Composition API. TypeScript is not required. The type hints are provided by the package itself.

![Type Hints for `window.panel`](./.github/kirby-intellisense-preview.png)

Kirby's `window.panel` global object provides the main Panel instance, including all methods and props. This package augments the `window.panel` object to provide type hints out of the box.

Type augmentations are generated based on the Kirby Panel JavaScript build. Especially types of function arguments and return types cannot be inferred. But for working with the Panel API, this should be sufficient.

Depending on the component type, you can choose how to import the type hints:

### Panel Access with `usePanel`

In order to benefit from type completions, you can import the `usePanel` function from this package. This function returns a typed `window.panel` object. This works both in the Options API and the Composition API.

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

### Augmenting the `window.panel` Object

Instead of the explicit `usePanel` import, you can also augment the `window.panel` object directly. In this case, you have to import the `kirbyup` package **once** in your main entry file:

```js
import "kirbyuse";

window.panel.notification.success("Kirby is awesome!");
//                        ^? (property) PanelNotification.success: (arg1: any) => any
```

The import will provide global type augmentations for the `window.panel` object. Every time you access the `panel` object, you get IntelliSense support for all available methods and services.

## API

### useApi

Returns Kirby's Panel API for making HTTP requests to the backend.

This composable is a simple shortcut to `window.panel.api`.

```ts
import { useApi } from "kirbyuse";

const api = useApi();
// Make API calls
await api.get("pages/my-page");
```

### useApp

Returns the main Panel Vue instance.

This composable is a simple shortcut to `window.panel.app`.

```ts
import { useApp } from "kirbyuse";

const app = useApp();
// Access Vue instance methods and properties
console.log(app.$root);
```

### useBlock

Provides block methods for custom block components, including field access and updates.

```ts
import { computed, ref, useApi, useBlock, usePanel, watch } from "kirbyuse";

// Will inherit props from extended default block
const props = defineProps({});
const emit = defineEmits([]);
const { field } = useBlock(props, emit);

const source = computed(() => props.content?.source?.[0]);
const captionMarks = computed(() => field("caption", { marks: true }).marks);
```

### useContent

Provides reactive getters and methods to work with content of the current view.

> [!TIP]
> Compatible with both Kirby 4 and 5. The returned getters and methods are shimmed for Kirby 4 in a Kirby 4 environment.

```ts
import { useContent } from "kirbyuse";

const { currentContent, contentChanges, hasChanges, update } = useContent();

// Watch for content changes
watch(currentContent, (newContent) => {
  console.log("Content changed:", newContent);
});

// Update content of the current view
update({ excerpt: "Hello, Kirby!" });
```

### usePanel

Returns the reactive Kirby Panel object with type hints.

This composable is a simple shortcut to `window.panel`.

```ts
import { usePanel } from "kirbyuse";

const panel = usePanel();
// Access panel services
panel.notification.success("Success!");
```

### useSection

Provides methods for loading section data.

See the [section example](#panel-section) for a usage example.

### useStore

Returns the Vuex store of the Panel app (Kirby 4 only, will not work in Kirby 5).

```ts
import { useStore } from "kirbyuse";

const store = useStore();
// Access store
const content = comptued(() => store.getters["content/values"]());
```

> [!TIP]
> Use the `useContent` composable instead for common use cases, such as getting the current content, content changes, and updating content.

## Examples

### Panel Section

```vue
<script setup>
import { computed, ref, useContent, usePanel, useStore, watch } from "kirbyuse";

const label = ref("");

// For Kirby 4, use the Vuex store to access the content
const store = useStore();
const currentContent = computed(() => store.getters["content/values"]());

// In Kirby 5, the Vuex store has been removed. Use the
// `useContent` composable and its computed getter instead:
const { currentContent, contentChanges } = useContent();

watch(currentContent, (newContent) => {
  console.log("Content has changed:", newContent);
});

function handleClick() {
  const panel = usePanel();
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
