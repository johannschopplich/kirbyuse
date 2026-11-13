# kirbyuse

[![CI](https://github.com/johannschopplich/kirbyuse/actions/workflows/ci.yml/badge.svg)](https://github.com/johannschopplich/kirbyuse/actions)
[![npm version](https://img.shields.io/npm/v/kirbyuse.svg)](https://www.npmjs.com/package/kirbyuse)

A collection of Vue Composition utilities and type hints to improve the DX for writing Kirby Panel plugins. It is intended for the Composition API, but also works with the Options API.

## Features

- 🧃 IntelliSense support for Kirby's global `window.panel` object
- 🍿 Helpers like `usePanel` to write future-proof Kirby plugins
- 📇 Ready for the Kirby 6 Panel import-map setup

## Installation

```bash
# pnpm
pnpm add -D kirbyuse@next

# npm
npm i -D kirbyuse@next

# yarn
yarn add -D kirbyuse@next
```

> [!IMPORTANT]
> `kirbyuse` 2.x targets Kirby 6+ and the Vue 3-based Panel runtime. Keep using `kirbyuse` 1.x if you still need to support Kirby 4 or 5. Until its stable release, 2.x is published under the `next` tag, and a bare `kirbyuse` installs 1.x.

`vue` 3.5 or later is a required peer dependency. For the optional `dayjs` and `prosemirror-*` peers, see [Optional Dependencies](https://github.com/johannschopplich/kirby-types#optional-dependencies) in kirby-types.

## Quick Start

Kirby's global `window.panel` object is the main Panel instance, including all methods and props. `usePanel` returns it with type hints:

```vue
<script setup>
import { usePanel } from "kirbyuse";

const panel = usePanel();

function greet() {
  panel.notification.success("Kirby is awesome!");
  //                 ^? (property) PanelNotification.success: (success?: string | PanelNotificationOptions) => PanelNotificationDefaults
}
</script>

<template>
  <k-button icon="smile" variant="filled" @click="greet()">Greet</k-button>
</template>
```

Your editor shows IntelliSense for every method call. TypeScript is not required – the package ships the type hints itself:

![Type Hints for `window.panel`](./.github/kirby-panel-intellisense-preview.png)

## Use Cases

### Use the Panel in the Options API

In an Options API component, call `usePanel()` in a lifecycle hook like `mounted`:

```js
import { usePanel } from "kirbyuse";

export default {
  mounted() {
    const panel = usePanel();
    panel.notification.success("Guten Tag!");
  },
};
```

### Augment the `window.panel` Object

To get type hints on `window.panel` itself, without the `usePanel` import, import `kirbyuse` **once** in your main entry file:

```js
// Once, in your main entry file
import "kirbyuse";

// In any component
window.panel.notification.success("Kirby is awesome!");
//                        ^? (property) PanelNotification.success: (success?: string | PanelNotificationOptions) => PanelNotificationDefaults
```

The import also types the Panel's global properties, such as `this.$panel` and `this.$t`. Code that reads `window.panel` directly skips a [mocked Panel](#mock-the-panel-outside-kirby).

### Build a Panel Field

```vue
<script setup>
import { useContent, usePanel } from "kirbyuse";
import { field } from "kirbyuse/props";
import { watch } from "vue";

const props = defineProps({ ...field });
const panel = usePanel();
const { currentContent } = useContent();

watch(currentContent, (newContent) => {
  console.log("Content has changed:", newContent);
});

function handleClick() {
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

For complete plugins written with the Vue Composition API, read the source of [Kirby Minimap](https://github.com/johannschopplich/kirby-minimap), [Kirby Content Translator](https://github.com/kirby-tools/kirby-content-translator), and [Kirby SERP Preview](https://github.com/johannschopplich/kirby-serp-preview).

### Load Plugin Assets on Demand

For assets that should load on demand, register them once and resolve them by file name:

| Helper                         | Purpose                                                                 |
| ------------------------------ | ----------------------------------------------------------------------- |
| `registerPluginAssets(assets)` | Registers `{ filename, url }` pairs, usually from a PHP-side asset list |
| `resolvePluginAsset(filename)` | Returns the registered asset                                            |
| `loadPluginModule(filename)`   | Imports a registered JavaScript module, cached                          |

### Share a Request Across Components

`createSharedRequest` fetches a value once for every component that asks: concurrent calls share one request, later calls get the cached value, and a failed request is retried on the next call.

```ts
import { createSharedRequest, usePanel } from "kirbyuse";

const fieldsets = createSharedRequest(() =>
  usePanel().api.get("my-plugin/fieldsets"),
);

await fieldsets.get();
// Fetch again on the next `get()`, e.g. after a license activation
fieldsets.clear();
```

### Share State Across Components

`createGlobalState`, adapted from [VueUse](https://vueuse.org/shared/createglobalstate/), runs a state factory once and shares its state with every component, across Vue instances. The factory runs in its own detached effect scope, so its watchers and computeds outlive every component that uses the state – even the one that calls `createGlobalState`.

```ts
import { createGlobalState } from "kirbyuse";
import { ref } from "vue";

export const useTranslationState = createGlobalState(() => {
  const isTranslating = ref(false);
  return { isTranslating };
});
```

### Mock the Panel Outside Kirby

Outside Kirby – in a docs site rendering a plugin's components, or in a test – `usePanel()` and every composable built on it can return a Panel of your own. It resolves the Panel the way Pinia resolves its store with `setActivePinia()`:

1. A Panel provided with `providePanel()` by an ancestor component.
2. The Panel set with `setActivePanel()`, everywhere: event handlers, code after an `await`, module code, and server-side rendering. One call reaches every copy of `kirbyuse` on the page, so a docs site rendering several plugins sets it once. `setActivePanel(undefined)` restores `window.panel`.
3. `window.panel`.

```ts
import { providePanel, setActivePanel } from "kirbyuse";

// Once, e.g. in a Nuxt plugin or a test setup file.
setActivePanel(mockPanel);

// In a component's `setup()`, for its descendants only.
providePanel(scenePanel);
```

Type a mock as `Panel`, which `kirbyuse` re-exports from [kirby-types](https://github.com/johannschopplich/kirby-types).

A provided Panel reaches only code that runs in a component's `setup()` or lifecycle hooks. Call `usePanel()` in `setup()` and keep the result, and never read `window.panel` directly.

During server-side rendering, every request shares the active Panel, so set one no request writes to.

## API

Import the composables from `kirbyuse`. Import the prop definitions, such as [`field`](#field) and [`block`](#block), from `kirbyuse/props`.

| Composable                        | Description                                      | Returns                                                                       |
| --------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------- |
| [`useApi`](#useapi)               | Access Kirby's Panel API                         | `PanelApi`                                                                    |
| [`useApp`](#useapp)               | Access the Panel's Vue application               | `PanelApp`                                                                    |
| [`useBlock`](#useblock)           | Block methods for custom block components        | `{ field, open, update }`                                                     |
| [`useContent`](#usecontent)       | Reactive content getters and methods             | `{ content, currentContent, contentChanges, hasChanges, isEditable, update }` |
| [`useDialog`](#usedialog)         | Open different types of dialogs                  | `{ openTextDialog, openFieldsDialog }`                                        |
| [`useI18n`](#usei18n)             | Translation utility functions                    | `{ t }`                                                                       |
| [`usePanel`](#usepanel)           | Access the reactive Kirby Panel object           | `Panel`                                                                       |
| [`usePanelEvent`](#usepanelevent) | Listen to a Panel event for the scope's lifetime | `void`                                                                        |
| [`useHelpers`](#usehelpers)       | Access internal Panel helpers                    | `PanelHelpers`                                                                |
| [`useLibrary`](#uselibrary)       | Access internal Kirby Panel libraries            | `PanelLibrary`                                                                |

### `useApi`

Returns Kirby's Panel API for making HTTP requests to the backend, a shortcut to `usePanel().api`.

```ts
import { useApi } from "kirbyuse";

const api = useApi();
await api.get("pages/my-page");
```

### `useApp`

Returns the Panel's Vue application, the result of `createApp()` and a shortcut to `usePanel().app`.

```ts
import { useApp } from "kirbyuse";

const app = useApp();
// Register a component or reach the global properties
app.component("k-my-component", MyComponent);
console.log(app.config.globalProperties.$helper);
```

### `useBlock`

Returns `field`, `open`, and `update`, the methods of Kirby's default block component, for custom blocks written with the Composition API.

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

`field` returns a field's configuration from the block's fieldset, or the fallback passed as second argument. `update` merges new values into the block's content. `open` opens the block's drawer.

### `useContent`

Returns reactive getters for the content of the current view, and `update` to change it.

```ts
import { useContent } from "kirbyuse";
import { watch } from "vue";

const { currentContent, contentChanges, hasChanges, isEditable, update } =
  useContent();

// Watch for content changes
watch(currentContent, (newContent) => {
  console.log("Content changed:", newContent);
});

// Update the content of the current view, if the editor may change it
if (isEditable.value) {
  update({ excerpt: "Hello, Kirby!" });
}
```

- `content` – The Panel's `panel.content` object.
- `currentContent` – The content of the view, unpublished changes included.
- `contentChanges` – The changed fields only.
- `hasChanges` – Whether any field has changed.
- `isEditable` – `false` when the model denies `update` or another user holds the lock.
- `update(values, save)` – Merges `values` into the content of the view and saves them as unpublished changes right away. Pass `false` as `save` to merge without saving. Resolves `false` when Kirby did not save.

### `useDialog`

`openTextDialog` opens a confirmation dialog and resolves `true` when the editor confirms, `false` otherwise. `openFieldsDialog` opens a form dialog and resolves with the submitted values, or with `undefined` when the dialog closes without a submit.

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
console.log(result); // -> { email: "..." }, or undefined if cancelled
```

`openFieldsDialog` takes these options:

- `fields` – Field definitions, as an object keyed by field name or as an array.
- `value` – Initial values for the fields.
- `text` – Text shown above the fields.
- `empty` – Message shown when no fields are defined.
- `size` – Dialog width: `"small"`, `"default"`, `"medium"`, `"large"`, or `"huge"`. Default: `"medium"`.
- `submitButton`, `cancelButton` – `false` hides the button, a string sets its text, an object sets its `text`, `icon`, `theme`, `disabled`, and `variant`.
- `onSubmit` – Called with the values on submit. Returning `false` or throwing keeps the dialog open; any other return value closes it and becomes the result. A thrown error is logged to the console only, so notify the editor inside the handler.

### `useI18n`

Returns `t`, which picks the value for the current Panel language from a translation object keyed by language code. In most cases, use `usePanel().t`, Kirby's built-in translation function.

```ts
import { useI18n } from "kirbyuse";

const { t } = useI18n();

// Simple string
t("Hello"); // -> "Hello"

// Translation object
t({ en: "Hello", de: "Hallo" }); // -> Returns value based on current Panel language
```

Without an entry for the current Panel language, `t` returns the first value of the object.

### `usePanel`

Returns the reactive Kirby Panel object with type hints: `window.panel` inside the Panel, or the Panel a docs site or test sets up (see [Mock the Panel Outside Kirby](#mock-the-panel-outside-kirby)).

Call `usePanel()` inside a component, not at the top level of the plugin's entry file, where `window.panel` only registers plugins and has no services yet.

```ts
import { usePanel } from "kirbyuse";

const panel = usePanel();
panel.notification.success("Success!");
```

### `usePanelEvent`

Listens to a Panel event until the component unmounts or the effect scope stops. Outside a component or effect scope, such as in an async callback, the listener is never removed.

```ts
import { usePanelEvent } from "kirbyuse";

usePanelEvent("content.publish", () => {
  console.log("Published");
});
```

### `useHelpers`

Returns the internal Panel helpers, a shortcut to `usePanel().app.config.globalProperties.$helper`. See the [Lab documentation](https://lab.getkirby.com/public/lab/internals/helpers/) for details.

```ts
import { useHelpers } from "kirbyuse";

const helpers = useHelpers();
helpers.link.detect("https://getkirby.com");
```

### `useLibrary`

Returns the internal Kirby Panel libraries (dayjs, colors and autosize), a shortcut to `usePanel().app.config.globalProperties.$library`. See the Lab documentation for [colors](https://lab.getkirby.com/public/lab/internals/library.colors) and [dayjs](https://lab.getkirby.com/public/lab/internals/library.dayjs).

```ts
import { useLibrary } from "kirbyuse";

const library = useLibrary();
library.dayjs(); // now
```

### `toIntlLocale`

`Intl` rejects Kirby's translation codes such as `pt_BR` or `sr@latin`. `toIntlLocale` converts them to BCP 47 locales:

```ts
import { toIntlLocale, usePanel } from "kirbyuse";

const locale = toIntlLocale(usePanel().translation.code); // "pt_BR" -> "pt-BR"
new Intl.DateTimeFormat(locale).format(new Date());
```

### `field`

Props Kirby passes to a custom field component, matching the Panel's `Field.vue`:

```ts
import { field } from "kirbyuse/props";

const props = defineProps({ ...field });
```

The individual field props such as `label`, `disabled` or `required` are exported as well, so a component can pick only what it needs.

### `block`

Props Kirby passes to a custom block component, matching the Panel's default block type: `content`, `fieldset`, `disabled`, `endpoints`, and `id`.

```ts
import { block } from "kirbyuse/props";

const props = defineProps({ ...block });
```

## How It Works

Kirby 6 loads Vue 3 through an import map: every Panel plugin imports from `"vue"` and shares the Panel's Vue runtime. `kirbyuse` ships as ESM with `vue` declared external, so it uses that runtime instead of bundling Vue twice.

## License

[MIT](./LICENSE) License © 2024-PRESENT [Johann Schopplich](https://github.com/johannschopplich)
