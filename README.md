# kirbyuse

[![NPM version](https://img.shields.io/npm/v/kirbyuse?color=a1b858&label=)](https://www.npmjs.com/package/kirbyuse)

A collection of Vue Composition utilities to ease working with the Composition API in Kirby CMS v4:

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

panel.notification.success("Composition API is awesome!");
</script>

<template>
  <k-section :label="label">
    <k-text>
      <h1>My Section</h1>
    </k-text>
  </k-section>
</template>
```

## Setup

```bash
# pnpm
pnpm add -D kirbyuse

# npm
npm i -D kirbyuse

# yarn
yarn add -D kirbyuse
```

> [!NOTE]
> If Kirby migrates to Vue 3, this package will adapt accordingly.

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

## Section Example Usage

```vue
<script>
import { ref, useSection, watch } from "kirbyuse";
import { section } from "kirbyuse/props";

export default defineComponent({
  props: {
    // Reuse the section props
    ...section,
  },
});
</script>

<script setup>
// Don't define new props here, just access them
const props = defineProps({});

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

## License

[MIT](./LICENSE) License © 2024-PRESENT [Johann Schopplich](https://github.com/johannschopplich)
