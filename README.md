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

Instead of the explicit `usePanel` import, you can also augment the `window.panel` object directly. In this case, you have to import the `kirbyuse` package **once** in your main entry file:

```js
import "kirbyuse";

window.panel.notification.success("Kirby is awesome!");
//                        ^? (property) PanelNotification.success: (arg1: any) => any
```

The import will provide global type augmentations for the `window.panel` object. Every time you access the `panel` object, you get IntelliSense support for all available methods and services.

## API

### Composables Overview

| Composable                  | Description                               | Returns                                                           |
| --------------------------- | ----------------------------------------- | ----------------------------------------------------------------- |
| [`useApi`](#useapi)         | Access Kirby's Panel API                  | `PanelApi`                                                        |
| [`useApp`](#useapp)         | Access the main Panel Vue instance        | `PanelApp`                                                        |
| [`useBlock`](#useblock)     | Block methods for custom block components | `{ field, open, update }`                                         |
| [`useContent`](#usecontent) | Reactive content getters and methods      | `{ content, currentContent, contentChanges, hasChanges, update }` |
| [`useDialog`](#usedialog)   | Open different types of dialogs           | `{ openTextDialog, openFieldsDialog }`                            |
| [`useI18n`](#usei18n)       | Translation utility functions             | `{ t }`                                                           |
| [`usePanel`](#usepanel)     | Access the reactive Kirby Panel object    | `Panel`                                                           |
| [`useSection`](#usesection) | Load section data                         | `{ load }`                                                        |
| [`useHelpers`](#usehelpers) | Access internal Fiber helpers             | `PanelHelpers`                                                    |
| [`useLibrary`](#uselibrary) | Access internal Kirby Panel libraries     | `PanelLibrary`                                                    |

---

### `useApi`

Returns Kirby's Panel API for making HTTP requests to the backend. This composable is a simple shortcut to `window.panel.api`.

**Example:**

```ts
import { useApi } from "kirbyuse";

const api = useApi();
// Make API calls
await api.get("pages/my-page");
```

### `useApp`

Returns the main Panel Vue instance. This composable is a simple shortcut to `window.panel.app`.

**Example:**

```ts
import { useApp } from "kirbyuse";

const app = useApp();
// Access Vue instance methods and properties
console.log(app.$root);
```

### `useBlock`

Provides utilities for building custom block components, including access to field configuration and block update methods.

**Example:**

```vue
<script setup>
import { computed, useBlock } from "kirbyuse";

// Props and emits are inherited from Kirby's default block component
const props = defineProps({
  // Block props provided by Kirby
  content: Object,
  endpoints: Object,
  fieldset: Object,
  id: String,
  name: String,
});
const emit = defineEmits(["update"]);

// Initialize block utilities
const { field, open, update } = useBlock(props, emit);

// Access field configuration (e.g., get the `marks` option from a `caption` field)
const captionMarks = computed(() => field("caption", { marks: true }).marks);

// Access block content
const source = computed(() => props.content?.source?.[0]);

// Update block content
function updateCaption(newCaption) {
  update({ caption: newCaption });
}
</script>
```

The `field` function retrieves field configuration from the block's fieldset, with optional default values. The `update` function merges new values into the block's content.

### `useContent`

Provides reactive getters and methods to work with content of the current view.

> [!TIP]
> Compatible with both Kirby 4 and 5. The returned getters and methods are shimmed for Kirby 4 in a Kirby 4 environment.

**Example:**

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

### `useDialog`

Provides methods to open different types of dialogs.

**Example:**

```ts
import { useDialog } from "kirbyuse";

const { openTextDialog, openFieldsDialog } = useDialog();

const isOk = await openTextDialog("Are you sure?");
console.log(isOk); // -> true or false

const fields = {
  email: {
    type: "email",
    label: "Email",
  },
};

const result = await openFieldsDialog({ fields });
console.log(result); // -> { email: "..." }
```

### `useI18n`

Returns translation utility functions.

> [!NOTE]
> In most cases, use `window.panel.t` for Kirby's built-in translation function. This composable is useful for custom translation objects, such as those returned by a section's `label` property.

**Example:**

```ts
const { t } = useI18n();

// Simple string
t("Hello"); // -> "Hello"

// Translation object
t({ en: "Hello", de: "Hallo" }); // -> Returns value based on current Panel language
```

### `usePanel`

Returns the reactive Kirby Panel object with type hints. This composable is a simple shortcut to `window.panel`.

**Example:**

```ts
import { usePanel } from "kirbyuse";

const panel = usePanel();
// Access panel services
panel.notification.success("Success!");
```

### `useSection`

Provides the `load` method for fetching section data from the backend. This is essential for custom sections that need to retrieve their configuration and data.

**Example:**

```ts
import { ref, useSection } from "kirbyuse";
import { section } from "kirbyuse/props";

const props = defineProps({ ...section });

const { load } = useSection();

// Fetch section data (typically in an IIFE since async setup isn't supported in Vue 2)
(async () => {
  const response = await load({
    parent: props.parent,
    name: props.name,
  });

  // Access section properties from the response
  console.log(response.label);
})();
```

> [!NOTE]
> The `load` method requires `parent` and `name` props. Use the `section` props helper from `kirbyuse/props` to ensure these are defined.

### `useHelpers`

Returns the internal Fiber helpers. This composable is a simple shortcut to `window.panel.app.$helper`. See the [Lab documentation](https://lab.getkirby.com/public/lab/internals/helpers/) for details.

**Example:**

```ts
import { useHelpers } from "kirbyuse";

const helpers = useHelpers();
// Access a helper
helpers.link.detect("https://getkirby.com");
```

### `useLibrary`

Returns the internal Kirby Panel libraries (dayjs, colors and autosize). This composable is a simple shortcut to `window.panel.app.$library`. See the Lab documentation for [colors](https://lab.getkirby.com/public/lab/internals/library.colors) and [dayjs](https://lab.getkirby.com/public/lab/internals/library.dayjs).

**Example:**

```ts
import { useLibrary } from "kirbyuse";

const library = useLibrary();
// Access a library component
library.dayjs(); // now
```

## Props Helpers

This package provides pre-defined prop definitions for common Kirby Panel component types. Import them from `kirbyuse/props`:

### `section`

Props required for custom Panel sections. Use with `defineProps` to inherit the necessary props for section components:

```ts
import { section } from "kirbyuse/props";

const propsDefinition = {
  ...section,
};

export default {
  inheritAttrs: false,
};

// In <script setup>
const props = defineProps(propsDefinition);
```

These props include `parent` and `name`, which are required for loading section data with `useSection`.

## Examples

### Panel Section

```vue
<script setup>
import { ref, useContent, usePanel, watch } from "kirbyuse";

const label = ref("");
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

- [Kirby Minimap](https://github.com/johannschopplich/kirby-minimap)
- [Kirby Content Translator](https://github.com/kirby-tools/kirby-content-translator)
- [Kirby SERP Preview](https://github.com/johannschopplich/kirby-serp-preview)

## License

[MIT](./LICENSE) License © 2024-PRESENT [Johann Schopplich](https://github.com/johannschopplich)
