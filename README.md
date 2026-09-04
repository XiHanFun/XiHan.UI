<div align="center">
<img src="./assets/banner.png" alt="XiHan.UI" />
<h1>XiHan.UI</h1>

<p><b>A fast, lightweight, efficient and thoughtfully built framework-agnostic component library</b></p>

<p>A headless core with Vue 3 and Web Components adapters — composable, accessible and themeable UI infrastructure</p>

<p><b>English</b> | <a href="./README_cn.md">简体中文</a></p>

<p>
  <a href="https://github.com/XiHanFun/XiHan.UI/stargazers"><img alt="GitHub Stars" src="https://img.shields.io/github/stars/XiHanFun/XiHan.UI?style=flat-square&logo=github&label=Stars&color=1f6feb" /></a>
  <a href="https://gitee.com/XiHanFun/XiHan.UI"><img alt="Gitee Stars" src="https://gitee.com/XiHanFun/XiHan.UI/badge/star.svg" /></a>
  <a href="https://gitcode.com/XiHanFun/XiHan.UI"><img alt="GitCode Stars" src="https://gitcode.com/XiHanFun/XiHan.UI/star/badge.svg" /></a>
</p>

<p>
  <img alt="Vue" src="https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Components" src="https://img.shields.io/badge/Components-127-1f6feb?style=flat-square" />
  <a href="https://www.npmjs.com/package/@xihan-ui/vue"><img alt="npm" src="https://img.shields.io/npm/v/@xihan-ui/vue?style=flat-square&logo=npm&logoColor=white" /></a>
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/github/license/XiHanFun/XiHan.UI?style=flat-square&color=green" /></a>
</p>

<p>
  <a href="https://ui.docs.xihanfun.com"><img alt="Docs" src="https://img.shields.io/badge/Docs-ui.docs.xihanfun.com-2496ED?style=flat-square&logo=readthedocs&logoColor=white" /></a>
  <a href="https://deepwiki.com/XiHanFun/XiHan.UI"><img alt="Ask DeepWiki" src="https://deepwiki.com/badge.svg" /></a>
  <a href="https://qm.qq.com/q/qYp1Urv3z2"><img alt="QQ Group" src="https://img.shields.io/badge/QQ_Group-462371834-EB1923?style=flat-square&logo=tencentqq&logoColor=white" /></a>
</p>

</div>

## Introduction

XiHan.UI is built around a framework-agnostic headless core: a component's state, interaction and accessibility logic live in that core, and every framework only gets a thin adapter. The same `connect()` output runs one shared conformance suite on both the Vue and the Web Components side, advancing the case step by step and comparing normalized DOM, so "framework-agnostic" is a property under test rather than a slogan. XiHan.UI is the component layer of the XiHanFun open-source ecosystem, which spans foundation, components and applications.

## Features

- **Framework-agnostic** - state and accessibility live in the headless core; Vue and Web Components behave identically
- **127 components** - covering general, layout, navigation, data entry, data display, feedback, overlay and AI chat — eight groups
- **Almost dependency-free** - the only third-party runtime dependency is `@internationalized/date`; floating positioning, pointer sessions, code highlighting and streaming markdown are all first-party
- **Build-time styling** - tokens are generated from DTCG sources into CSS variables and skins are layered with `@layer`; no CSS-in-JS at runtime
- **Themeable** - color mode, brand, density, contrast and writing direction switch independently
- **Accessible** - keyboard interaction follows the W3C APG; accessibility is scanned in real Chromium
- **TypeScript** - fully typed, discoverable in the editor

## Install

18 public packages, all published to npm; the current version is on the npm badge above.

```bash
pnpm add @xihan-ui/vue @xihan-ui/tokens @xihan-ui/styles
```

## Usage

Both adapters share the same tokens and skins — import them once at the entry point:

```ts
import { createThemeController } from '@xihan-ui/tokens/runtime'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

createThemeController({ storageKey: 'app-theme' })
```

Vue:

```vue
<script setup lang="ts">
import { XhDialogContent, XhDialogRoot, XhDialogTitle, XhDialogTrigger } from '@xihan-ui/vue'
</script>

<template>
  <XhDialogRoot v-slot="{ setOpen }">
    <XhDialogTrigger>Open dialog</XhDialogTrigger>
    <XhDialogContent>
      <XhDialogTitle>Confirm</XhDialogTitle>
      <button @click="setOpen(false)">Close</button>
    </XhDialogContent>
  </XhDialogRoot>
</template>
```

Web Components: the element renders no structure of its own. You write Light-DOM children carrying `data-xh-part`, and the element applies the `connect()` output to them.

```ts
import { defineXhElements } from '@xihan-ui/web-components/define'

defineXhElements()
```

```html
<xh-dialog>
  <button data-xh-part="trigger">Open dialog</button>
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <h2 data-xh-part="title">Confirm</h2>
      <button data-xh-part="close-trigger">Close</button>
    </div>
  </div>
</xh-dialog>
```

## Documentation

<https://ui.docs.xihanfun.com> — component pages are generated from the headless output and the type definitions, and include the connect API, keyboard tables and state charts.

## Browser Support

The styling floor is Chrome 111, Firefox 113 and Safari 16.2 (the bar for `oklch`, `@layer` and `:where`); below that line you get no styling rather than a degraded one. Local development requires Node.js 24+ and pnpm 11+.

## Development

The package catalog, directory layout and development commands live in [ui/README.md](./ui/README.md).

To see the components running locally, first `cd ui && pnpm build`, then start the documentation site — every example on a component page uses the real component, with the Vue and Web Components spellings side by side:

```bash
cd docs
pnpm install
pnpm dev
```

Changes must pass the full CI gate, and CI runs the same commands you do locally: `pnpm lint`, `pnpm typecheck`, `pnpm boundaries`, `pnpm gate` (one command runs 96 structural checks), `pnpm test`, `pnpm build`, `pnpm size` and more.

## Scope

In the box: 127 components with their cores and both adapters, the default skins, design tokens and the theme runtime, the cross-adapter conformance suite, the accessibility sweep and floating-position contract in real Chromium, and the documentation site.

Not in the box: bundled language packs (component copy ships English only; other languages need your own `translations`, though the global injection point is in place), the token browser, the AI family's MarkdownStream / Reasoning and ToolCall collapsing / tool approval, and enterprise business components.

## Related Projects

- [XiHan.Framework](https://github.com/XiHanFun/XiHan.Framework) - modular development framework for .NET
- [XiHan.BasicApp](https://github.com/XiHanFun/XiHan.BasicApp) - enterprise admin kernel built on XiHan.Framework and Vue 3

## Contributing

Issues and pull requests are welcome. Commits follow conventional commits, and changes must pass the gates listed above.

## Acknowledgements

In no particular order.

| Project | Thanks for |
| --- | --- |
| [Zag.js](https://github.com/chakra-ui/zag) | Reference specs for component state charts and ARIA wiring |
| [W3C APG](https://www.w3.org/WAI/ARIA/apg/) | The normative basis for accessible interaction patterns |
| [CommonMark](https://spec.commonmark.org/) | The source of markdown semantics and the conformance benchmark |
| [axe-core](https://github.com/dequelabs/axe-core) | The engine behind automated accessibility scanning |
| Other third-party dependencies | Being the foundation this project is built upon |

## Support & Sponsorship

If this project helps your work, feel free to buy the author a coffee.

Official sponsorship page: https://docs.xihanfun.com/cosmos/sponsor

## License

Copyright (c) 2021-Present XiHanFun and contributors.

Released under the MIT License — see [License](./LICENSE).

The XiHan.UI logo, name, interface visual design and original visual expression belong to the author; third-party dependencies and services are governed by their own licenses and terms.

This project is provided for study and reference; the author assumes no liability for any use of the software.
