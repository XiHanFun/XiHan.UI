# Quick start

Three ways to write the same dialog. All three run the same state machine and the same `connect`; they only differ in who writes the attributes onto the DOM.

## Way one: Vue components

The most direct one. A component is split into parts, each part is a Vue component, and you nest them following the structure.

```vue
<script setup lang="ts">
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhDialogRoot v-slot="{ setOpen }">
    <XhDialogTrigger>Open dialog</XhDialogTrigger>
    <XhDialogContent>
      <XhDialogTitle>Confirm</XhDialogTitle>
      <XhDialogDescription>This action cannot be undone.</XhDialogDescription>
      <div class="row end">
        <XhButton variant="ghost" @click="setOpen(false)">Cancel</XhButton>
        <XhButton variant="solid" @click="setOpen(false)">OK</XhButton>
      </div>
      <XhDialogCloseTrigger>✕</XhDialogCloseTrigger>
    </XhDialogContent>
  </XhDialogRoot>
</template>
```

What happens once it opens, without any extra code: focus is trapped in the content, `Esc` or a click on the backdrop closes it, focus returns to the trigger after closing, page scrolling is locked, and content outside is hidden from screen readers.

### Controlled and uncontrolled

Value components are controlled first: when you pass the controlled prop, the outside value wins; when you only pass `default*`, the component keeps the value itself.

```vue
<script setup lang="ts">
import { XhAccordionContent, XhAccordionHeader, XhAccordionItem, XhAccordionRoot, XhAccordionTrigger, XhSwitch } from "@xihan-ui/vue";
import { ref } from "vue";

const panels = ref<string[]>(["a"]);
const wifi = ref(true);
</script>

<template>
  <!-- Controlled: two-way binding with v-model -->
  <XhSwitch v-model:checked="wifi" aria-label="Wi-Fi" />

  <!-- Uncontrolled: only an initial value, the component keeps it afterwards -->
  <XhSwitch :default-checked="false" aria-label="Uncontrolled switch" />

  <XhAccordionRoot v-model:value="panels" multiple>
    <XhAccordionItem value="a">
      <XhAccordionHeader>
        <XhAccordionTrigger>Section one</XhAccordionTrigger>
      </XhAccordionHeader>
      <XhAccordionContent>The expanded set is a string[]; with multiple, items can be open together.</XhAccordionContent>
    </XhAccordionItem>
    <XhAccordionItem value="b">
      <XhAccordionHeader>
        <XhAccordionTrigger>Section two</XhAccordionTrigger>
      </XhAccordionHeader>
      <XhAccordionContent>Arrow keys only move focus between headers, never into the content.</XhAccordionContent>
    </XhAccordionItem>
  </XhAccordionRoot>
</template>
```

Every value component emits two events: `value-change` carries the full details object (such as `{ value }`), and `update:value` carries the bare value for `v-model`.

## Way two: Vue composables

When you do not want the ready-made DOM structure, use `api` directly and decide which tags to render.

```vue
<script setup lang="ts">
import { useAccordion } from "@xihan-ui/vue";

const { api } = useAccordion({ multiple: true, defaultValue: ["a"] });
const items = [
  { value: "a", title: "Section one", body: "Content A" },
  { value: "b", title: "Section two", body: "Content B" },
];
</script>

<template>
  <section v-bind="api.getRootProps()">
    <article v-for="item in items" :key="item.value" v-bind="api.getItemProps(item)">
      <h3 v-bind="api.getHeaderProps(item)">
        <button v-bind="api.getTriggerProps(item)">{{ item.title }}</button>
      </h3>
      <div v-bind="api.getContentProps(item)">{{ item.body }}</div>
    </article>
  </section>
</template>
```

Each `getXxxProps()` on `api` returns every attribute the part should currently have: `data-scope` / `data-part`, the `id` and `aria-*` relations, state attributes such as `data-state`, and the event handlers. Bind them with `v-bind`.

## Way three: native custom elements

You write the whole structure and mark the role of each node with `data-xh-part`. The element is a light DOM behavior host: it renders no structure and only writes attributes and events onto the nodes you wrote.

```html
<xh-dialog>
  <button data-xh-part="trigger">Open dialog</button>
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <h3 data-xh-part="title">Confirm</h3>
      <p data-xh-part="description">This action cannot be undone.</p>
      <button data-xh-part="close-trigger" aria-label="Close">✕</button>
    </div>
  </div>
</xh-dialog>
```

```ts
import { defineXhElements } from "@xihan-ui/web-components/define";
import "@xihan-ui/styles";

defineXhElements();
```

A missing required part does not fail silently: the Web Components adapter reports `wc.missing-part` (error) on the diagnostics channel, and a part name outside the anatomy reports `wc.unknown-part` (warn). The required parts of every component are shown in bold in the [component reference](./components/).

## Theming

All three ways share the same eight-axis visual environment runtime; skins and portals consume the same resolved attributes:

```ts
import { createVisualEnvironmentController } from "@xihan-ui/tokens/runtime";

const visual = createVisualEnvironmentController({
  root: document.documentElement,
  storageKey: "app-visual-environment",
  onStorageError: detail => console.error("Failed to persist visual preferences", detail),
  initial: { mode: "system", density: "comfortable", motion: "system", transparency: "system" },
});

// Switch to dark
visual.setPreference({ mode: "dark" });

// Follow the system
visual.setPreference({ mode: "system" });

// Subscribe to the settled state
visual.subscribe(state => console.log(state.mode, state.density, state.motion, state.transparency));
```

The axes are color mode, brand, density, writing direction, contrast, motion, transparency and material; see [Design tokens and theming](./guide/theme).

## Further reading

- [Accessibility and keyboard](./guide/a11y): the keyboard specification and the focus ring contract;
- [Components](./components/): the API of every component;
- The core concepts in Chinese: [anatomy and the part contract](/guide/anatomy), [the state machine runtime](/guide/machine) and [connect and attribute output](/guide/connect).
