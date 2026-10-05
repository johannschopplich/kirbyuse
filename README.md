# kirbyuse

[![CI](https://github.com/johannschopplich/kirbyuse/actions/workflows/ci.yml/badge.svg)](https://github.com/johannschopplich/kirbyuse/actions)
[![npm version](https://img.shields.io/npm/v/kirbyuse.svg)](https://www.npmjs.com/package/kirbyuse)

A collection of Vue Composition utilities and type hints to improve the DX for writing Kirby Panel plugins. It is intended for the Composition API, but also works with the Options API.

> [!IMPORTANT]
> `kirbyuse` 2.x targets Kirby 6+ and the Vue 3-based Panel runtime. Keep using `kirbyuse` 1.x if you still need to support Kirby 4 or 5.

## Features

- 🧃 IntelliSense support for Kirby's global `window.panel` object
- 🍿 Helpers like `usePanel` to write future-proof Kirby plugins
- 📇 Ready for the Kirby 6 Panel import-map setup

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

![Type Hints for `window.panel`](./.github/kirby-panel-intellisense-preview.png)

Kirby's `window.panel` global object provides the main Panel instance, including all methods and props. This package augments the `window.panel` object to provide type hints out of the box.

Type augmentations are generated based on the Kirby Panel JavaScript build. Especially types of function arguments and return types cannot be inferred. But for working with the Panel API, this should be sufficient.

Depending on the component type, you can choose how to import the type hints:

### Panel Access With `usePanel`

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

| Composable                  | Description                               | Returns                                                                       |
| --------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------- |
| [`useApi`](#useapi)         | Access Kirby's Panel API                  | `PanelApi`                                                                    |
| [`useApp`](#useapp)         | Access the main Panel Vue instance        | `PanelApp`                                                                    |
| [`useBlock`](#useblock)     | Block methods for custom block components | `{ field, open, update }`                                                     |
| [`useContent`](#usecontent) | Reactive content getters and methods      | `{ content, currentContent, contentChanges, hasChanges, isEditable, update }` |
| [`useDialog`](#usedialog)   | Open different types of dialogs           | `{ openTextDialog, openFieldsDialog }`                                        |
| [`useI18n`](#usei18n)       | Translation utility functions             | `{ t }`                                                                       |
| [`usePanel`](#usepanel)     | Access the reactive Kirby Panel object    | `Panel`                                                                       |
| [`useHelpers`](#usehelpers) | Access internal Fiber helpers             | `PanelHelpers`                                                                |
| [`useLibrary`](#uselibrary) | Access internal Kirby Panel libraries     | `PanelLibrary`                                                                |

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

Returns the Panel's Vue application, the result of `createApp()`. This composable is a simple shortcut to `window.panel.app`.

**Example:**

```ts
import { useApp } from "kirbyuse";

const app = useApp();
// Register a component or reach the global properties
app.component("k-my-component", MyComponent);
console.log(app.config.globalProperties.$helper);
```

### `useBlock`

Provides utilities for building custom block components, including access to field configuration and block update methods.

**Example:**

```vue
<script setup>
import { useBlock } from "kirbyuse";
import { computed } from "vue";

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

**Example:**

```ts
import { useContent } from "kirbyuse";
import { watch } from "vue";

const { currentContent, contentChanges, hasChanges, isEditable, update } =
  useContent();

// Watch for content changes
watch(currentContent, (newContent) => {
  console.log("Content changed:", newContent);
});

// Update content of the current view, unless the model denies `update` or
// another user holds the lock
if (isEditable.value) {
  update({ excerpt: "Hello, Kirby!" });
}
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
> In most cases, use `window.panel.t` for Kirby's built-in translation function. This composable is useful for custom translation objects keyed by language code.

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

### `useHelpers`

Returns the internal Fiber helpers. This composable is a simple shortcut to `window.panel.app.config.globalProperties.$helper`. See the [Lab documentation](https://lab.getkirby.com/public/lab/internals/helpers/) for details.

**Example:**

```ts
import { useHelpers } from "kirbyuse";

const helpers = useHelpers();
// Access a helper
helpers.link.detect("https://getkirby.com");
```

### `useLibrary`

Returns the internal Kirby Panel libraries (dayjs, colors and autosize). This composable is a simple shortcut to `window.panel.app.config.globalProperties.$library`. See the Lab documentation for [colors](https://lab.getkirby.com/public/lab/internals/library.colors) and [dayjs](https://lab.getkirby.com/public/lab/internals/library.dayjs).

**Example:**

```ts
import { useLibrary } from "kirbyuse";

const library = useLibrary();
// Access a library component
library.dayjs(); // now
```

## Props Helpers

This package provides pre-defined prop definitions for common Kirby Panel component types. Import them from `kirbyuse/props`:

### `field`

Props Kirby passes to a custom field component, matching the Panel's `Field.vue`:

```ts
import { field } from "kirbyuse/props";

const props = defineProps({ ...field });
```

The individual field props such as `label`, `disabled` or `required` are exported as well, so a component can pick only what it needs.

## Examples

### Panel Field

```vue
<script setup>
import { useContent, usePanel } from "kirbyuse";
import { field } from "kirbyuse/props";
import { watch } from "vue";

const props = defineProps({ ...field });
const { currentContent } = useContent();

watch(currentContent, (newContent) => {
  console.log("Content has changed:", newContent);
});

function handleClick() {
  const panel = usePanel();
  panel.notification.success("Composition API is awesome!");
}
</script>

<template>
  <k-field v-bind="props">
    <k-text>
      <h1 @click="handleClick()">My Field</h1>
    </k-text>
  </k-field>
</template>
```

## Background

Kirby 6 replaced the Vue 2 UMD bundle with a native Vue 3 setup powered by import maps. There is no global `Vue` constructor anymore – every Panel plugin imports Vue's Composition API directly from `"vue"` (`import { ref, computed } from "vue"` works out of the box), and the import map ensures all plugins share the Panel's Vue runtime.

`kirbyuse` exists to layer Kirby-specific ergonomics on top of that:

1. Panel composables (`usePanel`, `useContent`, `useDialog`, …) wrap the `window.panel` runtime so you get IntelliSense and a stable API surface.
2. Importing the package types `window.panel` and the Panel's global properties (`this.$panel`, `this.$t`, …) through `kirby-types/panel-globals`.
3. The package is shipped as ESM with `vue` declared external, so it slots into the Panel import map without bundling Vue twice.

## Composition API in Panel Plugins

The following open source plugins are written with the Vue Composition API:

- [Kirby Minimap](https://github.com/johannschopplich/kirby-minimap)
- [Kirby Content Translator](https://github.com/kirby-tools/kirby-content-translator)
- [Kirby SERP Preview](https://github.com/johannschopplich/kirby-serp-preview)

## License

[MIT](./LICENSE) License © 2024-PRESENT [Johann Schopplich](https://github.com/johannschopplich)
