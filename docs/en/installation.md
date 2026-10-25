# Installation

## Install from npm

All public XiHan.UI packages are published to npm. They form one version group and always share the same version number; npm is the source of truth for the current one: `npm view @xihan-ui/vue version`.

Which packages to install depends on the adapter you use:

```bash
# Vue project: adapter + default skin
pnpm add @xihan-ui/vue @xihan-ui/styles

# React project: adapter + default skin
pnpm add @xihan-ui/react @xihan-ui/styles

# Plain / non-framework project: custom elements + default skin
pnpm add @xihan-ui/web-components @xihan-ui/styles

# Design tokens only, write your own skin
pnpm add @xihan-ui/tokens

# Background layers and syntax highlighting are optional peers, install on demand
pnpm add @xihan-ui/backgrounds
pnpm add @xihan-ui/code-highlight
```

`@xihan-ui/styles` is not required: components do not depend on the default skin, and writing your own styles on top of the tokens is a supported path; see "Three ways to bring in styles" below.

The adapters' engine-side dependencies (`core` / `motion` / `pointer` / `viz` / `headless` / `position`) are listed in `dependencies` and are installed with the adapter; you do not need to list them yourself. The peer dependency of `@xihan-ui/vue` is `vue@^3.5.0`, and of `@xihan-ui/react` it is `react@^19.0.0` with `react-dom@^19.0.0`; your project provides them.

`backgrounds` / `sound` / `code-highlight` are optional peers; install them when you need them. Without `code-highlight`, the code view renders plain text instead of failing.

Besides installing from npm there are two local paths:

1. Clone the repository and develop in it: build the library packages, then run the documentation site, where every example is a real component;
2. Build locally and link the packages into your project: useful to follow the latest changes of the repository.

::: warning
`@xihan-ui/icons` only contains the in-house first-class icon set. It covers what the components and common interfaces need and does not aim to be complete.
If you need a full icon set, bring your own, or plug any icon source into `XhIcon`: it accepts plain `IconRecord` data, which any source can be converted to.
:::

## Requirements

| Item | Requirement |
| --- | --- |
| Node (using the packages) | ≥ 18, matching the packages' `engines` field |
| Node / pnpm (developing in this repository) | ≥ 24.0.0 / ≥ 11.0.0 |
| Module format | ESM only, no CJS |
| Browsers | Modern browsers supporting `oklch()`, `@layer` and `:where()` |

## Path one: clone the repository

```bash
git clone https://github.com/XiHanFun/XiHan.UI.git
cd XiHan.UI/ui
pnpm install --frozen-lockfile
pnpm build
```

To see the components in a browser, run the documentation site. It points at the library packages of this repository through `link:`, so the examples render real components, and it needs `pnpm build` first.

```bash
cd ../docs
pnpm install
pnpm dev
```

Common commands back in `ui/`:

```bash
pnpm build        # build every library package into dist
pnpm typecheck    # type checking
pnpm lint         # oxlint + eslint + stylelint
pnpm test         # unit tests and cross-adapter conformance tests (jsdom)
pnpm test:browser # accessibility scans and overlay positioning contracts in real Chromium
pnpm boundaries   # layer dependency gate
pnpm gate         # structural gates
pnpm size         # bundle size ratchet
```

Install the browser before the first `pnpm test:browser`:

```bash
pnpm exec playwright install chromium
```

## Path two: link into an existing project

Build in the XiHan.UI repository first:

```bash
cd XiHan.UI/ui && pnpm build
```

Then point your project at it with the `link:` protocol (pnpm syntax; adjust the paths):

```json
{
  "dependencies": {
    "@xihan-ui/vue": "link:../XiHan.UI/ui/packages/adapters/vue",
    "@xihan-ui/styles": "link:../XiHan.UI/ui/packages/design/styles",
    "@xihan-ui/tokens": "link:../XiHan.UI/ui/packages/design/tokens"
  }
}
```

`@xihan-ui/vue` brings in `core` / `motion` / `pointer` / `viz` / `headless` / `position` through its `dependencies`; they do not need to be linked separately. `vue` itself is its peer dependency and comes from your project.

## Use it in a Vue project

```ts
// main.ts
import { createVisualEnvironmentController } from "@xihan-ui/tokens/runtime";
import { createApp } from "vue";
import App from "./App.vue";

// The skin entry carries the layer order and the tokens; this one line is enough.
// Importing tokens.css alone is the path for tokens without a skin
import "@xihan-ui/styles";

// Write the eight-axis visual environment onto <html> and handle persistence failures explicitly
createVisualEnvironmentController({
  root: document.documentElement,
  storageKey: "app-visual-environment",
  onStorageError: detail => console.error("Failed to persist visual preferences", detail),
  initial: { mode: "system", motion: "system", transparency: "system" },
});

createApp(App).mount("#app");
```

Import components from the main entry as you need them; no plugin registration is required (automatic imports and global registration are also available, see [Vue adapter · Registration](/adapters/vue#注册方式), in Chinese):

```vue
<script setup lang="ts">
import { XhDialogContent, XhDialogRoot, XhDialogTitle, XhDialogTrigger } from "@xihan-ui/vue";
</script>
```

The packages declare `sideEffects: false`, so bundlers drop unused components. There are no per-component subpath exports; importing on demand relies on tree shaking.

::: tip Built-in texts and locale
The built-in texts of components (the screen reader name of a close button, the page descriptions of a pagination and so on) are English by default. Date and time components also accept `locale`; without it they follow the browser language, and fall back to `en-US` if that cannot be read.
To switch both to another language, hand a built-in language pack to the global configuration once in the root component, for example `provideXhConfig(zhCN)` with `zhCN` imported from `@xihan-ui/vue/locale`; texts and `locale` switch together, and individual phrases can still be overridden through `translations`.
:::

### Nuxt projects

Install the same `@xihan-ui/vue` and `@xihan-ui/styles` and add one module to `nuxt.config.ts`; the skin import, the visual environment controller and the component imports above are no longer needed:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@xihan-ui/vue/nuxt"],
});
```

The module also renders the visual environment onto `<html>` on the server and reads back the reader's stored preference before the first paint. Options and how to use `$xhVisual` are in [Vue adapter · Nuxt](/adapters/vue#nuxt), in Chinese.

## Use it in a plain / non-framework project

```ts
import { createVisualEnvironmentController } from "@xihan-ui/tokens/runtime";
import { defineXhElements } from "@xihan-ui/web-components/define";

import "@xihan-ui/styles";

// Register every xh-* element. Importing the main entry does not register anything; call this explicitly
defineXhElements();
createVisualEnvironmentController({
  root: document.documentElement,
  storageKey: "app-visual-environment",
  onStorageError: detail => console.error("Failed to persist visual preferences", detail),
  initial: { mode: "system", motion: "system", transparency: "system" },
});
```

Then write the tags directly in HTML. You write the structure and mark each role node with `data-xh-part`:

```html
<xh-button variant="solid">
  <button data-xh-part="root">Submit</button>
</xh-button>
```

## Three ways to bring in styles

`@xihan-ui/styles` is a pure CSS package, independent of the JS layer. Pick one of three granularities:

Everything: tokens + layer order + reset + every component skin. The main entry `index.css` is a generated flat file: the Action Control / Field Chrome / Collection Item / Swatch family recipes and the shared keyframes are inlined once, after the four common layers (focus / label / description / pointer) and before every component skin; the skins follow in source order with their own family `@import` removed. Apart from the one for tokens there is no `@import`, so no bundler can copy the families dozens of times.

```ts
import "@xihan-ui/styles";
```

Per component. layers.css and tokens.css each carry the full layer order declaration, so import either one first; component skins must not come before them. Every single skin file starts with an `@import '../family/*.css'` of its family, so the family is present when a skin is imported alone. The reset and the four common layers (focus ring, field label, description text, pointer feedback) are not brought in by the skins; import them yourself: without `focus.css`, keyboard focus only shows the browser's default outline. Projects on Vite can leave this to the plugin described below.

```ts
import "@xihan-ui/styles/layers.css";
import "@xihan-ui/tokens/tokens.css";
import "@xihan-ui/styles/reset.css";
import "@xihan-ui/styles/focus.css";
import "@xihan-ui/styles/label.css";
import "@xihan-ui/styles/description.css";
import "@xihan-ui/styles/pointer.css";
import "@xihan-ui/styles/button.css";
import "@xihan-ui/styles/dialog.css";
```

Tokens only, write your own skin.

```ts
import "@xihan-ui/tokens/tokens.css";
```

The third way keeps the layer order as well: tokens.css carries the full layer declaration, and your own skin goes straight into `@layer xihan.overrides`. Components do not depend on the default skin; they only write `data-scope` / `data-part` / `data-state` and similar attributes into the DOM, and the styling is entirely yours.

::: warning Three things to watch with the second way
1. A missing import fails silently. If one skin is missing, that component's `data-scope` / `data-part` are still there and the other skins are loaded; only it renders as a bare element without padding or background. Turn on the detector described below during development to catch it.
2. Keep the relative order of the skin segments in `index.css`. Within the same `@layer xihan.components`, rules of equal specificity are decided by source order. Sorting by yourself (alphabetically, by directory order) may look the same today and render differently from the full entry once cross-component rules are added. When importing per component, filter by the order of the `/* styles/xxx.css */` segment markers in [`ui/packages/design/styles/index.css`](https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/index.css) in the repository instead of sorting yourself (the published styles are minified and carry no comments or markers).
3. When mixing several single skins, each brings its own family `@import`. Bundlers that deduplicate `@import`s of the same URL (Vite's default postcss path does) pay nothing; inliners that do not (such as the one bundled with `@tailwindcss/vite`) copy the families several times, double the output, and place later copies after earlier skins. The key override points of the families are designed around specificity rather than source order, but the copies are pure waste: switch to the main entry once you import more than a few skins.

The published style files are stripped of comments and whitespace (`index.css` is about 1.6 MB); the commented sources only live in the repository and are not published. Everything — all skins plus tokens — is about 180 kB gzip (about 120 kB brotli, measured on v5.1.0); the `styles/index.css` entry of `pnpm size` limits it to 197 kB gzip, and CI fails beyond that. Use the first way unless you have a clear size constraint.
:::

### Inject the skins of the components you use

On Vite, the order and the missing imports of per-component styles can be left to `@xihan-ui/styles/vite`. The plugin scans the source for the components you write (both export names such as `XhButton` and `XhSelectRoot` and tags such as `<xh-button>`) and injects the layer order, tokens, reset, common layers, family recipes and the skins of those components; components that a component borrows internally (the page size select of a pagination, the calendar of a date picker) are added too. The order is taken from the full entry, so what is injected is a subset of `index.css` and renders the same as the full import.

```ts
// vite.config.ts
import { XiHanUIStyles } from "@xihan-ui/styles/vite";

export default defineConfig({
  plugins: [vue(), XiHanUIStyles()],
});
```

```ts
// Application entry: instead of import "@xihan-ui/styles"
import "virtual:xihan-ui/styles";
```

The plugin scans files on disk, `index.html` and `src/` by default; `scan` changes the range. Components written outside that range (rendered by another package) are added with `include: ["dialog"]`, and `exclude` drops unwanted ones. In development a missing-skin detector is on by default: when a component without an injected skin appears on the page, the console reports it with the fix; `skinCheck: false` turns it off. The injected styles are the layered variant; if the host has an unlayered reset, use the full `index.unlayered.css` instead. With TypeScript's `noUncheckedSideEffectImports` on, add a `declare module` for `virtual:xihan-ui/styles`.

### Detect missing skins in development

Every component skin writes a `--xh-X-skin` marker on its own `[data-scope='X']`. `startSkinCheck()` probes every scope that appears on the page; a missing marker means that CSS is not loaded:

```ts
if (import.meta.env.DEV) {
  const { startSkinCheck } = await import("@xihan-ui/core/skin-check");
  startSkinCheck();
}
```

It reports to the diagnostics channel with the code `styles.missing-skin`.

Each scope is probed once (probing reads computed styles, and probing every instance would force style recalculation); later nodes are picked up with a `MutationObserver`, and the return value stops it. With the full import it reports nothing.

When you pass `root`, the element brand checks, computed styles and the MutationObserver all come from the Window that owns that root, so on-demand skins inside an iframe can be checked separately; a valid explicit root works even when the top level has no DOM globals. An explicit root without an active Window, or whose Window has no MutationObserver, throws right away rather than scanning once and silently stopping. During SSR, calling it without a root returns a no-op stop function.

The machine-readable form of the tokens can also be used directly, to generate Figma variables, a Tailwind theme or other artifacts:

```ts
import tokens from "@xihan-ui/tokens/tokens.json" with { type: "json" };
// { "--xh-color-brand-500": "oklch(0.623 0.214 258)", ... }
```

## Use the unlayered build when the host has an unlayered reset

The default `index.css` wraps every skin in `@layer xihan.*`. CSS cascading has an easily overlooked rule: unlayered declarations beat any layered declaration, regardless of specificity. So as soon as the host application ships one unlayered reset or normalize rule, such as

```css
button { padding: 0; background-color: transparent; }
```

it overrides the matching declarations of every `[data-scope='button'][data-part='root']` in the skin, even though the latter is more specific. Components then render as bare elements without padding or background. Tailwind v3's preflight, normalize.css and the resets shipped with most documentation sites and scaffolds are unlayered and all trigger this.

How to tell: the component's `data-scope` / `data-part` attributes are present and the skin CSS is loaded, yet none of the box model properties take effect.

For this case the package also ships `index.unlayered.css` with the layer wrappers removed. Its content is identical to `index.css` (the families are likewise inlined once, before the skins) and it is generated from the same source order:

```ts
// Use this one when the host has an unlayered reset; rules then compete by specificity.
// Skin selectors are at least [data-scope][data-part] (0,2,0), safely above button (0,0,1)
import "@xihan-ui/styles/index.unlayered.css";
```

Choosing between the two:

| Situation | Use | How to override the skin |
| --- | --- | --- |
| Your own styles are layered too (e.g. Tailwind v4) | `index.css` | Write into `@layer xihan.overrides`, or any layer after `xihan` |
| The host has an unlayered reset / normalize | `index.unlayered.css` | Use specificity no lower than `[data-scope][data-part]` |

In the unlayered build, the library's own reset layer (`box-sizing`, `font: inherit` on form controls, `visibility: hidden` before overlays are positioned and so on) has a specificity of (0,0,0), so element selectors of the host (`button { font-family: … }`, (0,0,1)) beat it. This only affects the reset itself: the `font-size` and `line-height` declared by family recipes such as Action Control / Field Chrome and by the component skins are untouched; when the host reset should match the library, write the same declarations as `inherit`.

With `index.css`, the override slot is ready to use:

```css
@layer xihan.overrides {
  [data-scope='button'][data-part='root'] { border-radius: 0; }
}
```

The conversion only works one way: `@import url('...') layer(x)` can wrap unlayered styles in a layer, but cannot take layered styles out of one, which is why the library ships the unlayered build.

This documentation site uses the unlayered build: VitePress ships an unlayered `button` reset, and with `index.css` every example would render as plain text. So the examples of this site run on the unlayered build, where the layer order does not hold. The table above, overrides through `@layer xihan.overrides` and anything else that depends on layer order cannot be demonstrated or verified here; verify them in your own project with `index.css`.

## Server-side rendering

- The visual environment runtime enters an SSR branch when `document` / `window` are absent: it reads no media queries, writes no DOM and uses the eight-axis baseline. To avoid a flash on first paint, render the seven attributes `data-theme` / `data-brand` / `data-density` / `data-contrast` / `data-motion` / `data-transparency` / `dir` directly onto `<html>` on the server. In Nuxt projects the [Nuxt module](/adapters/vue#nuxt) (in Chinese) does this for you.
- Custom elements are not upgraded before the JS arrives. `undefined.css` in `@xihan-ui/styles` covers that window: it selects the `data-xh-part` nodes you wrote with `:not(:defined)` and collapses the `content` / `positioner` / `backdrop` / `viewport` of the overlay family first, so their content does not show up in the page flow as bare text that screen readers and search engines treat as body copy.

## Next steps

- [Quick start](./quickstart): minimal examples of the three ways to use a component
- [Design tokens and theming](./guide/theme): the token layers and the visual environment runtime
