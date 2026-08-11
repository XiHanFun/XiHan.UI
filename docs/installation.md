# 安装与接入

## 从 npm 安装（当前是 alpha）

XiHan.UI 的 14 个公开包都已发布到 npm，当前版本 `1.0.0-alpha.0`，`latest` 与 `alpha` 两个 dist-tag 都指向它。

::: warning
alpha 的含义是：能装、能跑，但接口还会变，**不承诺语义化版本**，不建议用于生产。要让行为可复现，请把版本写成精确值而不是区间。
:::

装哪几个包取决于你用哪个适配器：

```bash
# Vue 3 项目：适配器 + 默认皮肤
pnpm add @xihan-ui/vue @xihan-ui/styles

# 原生 / 非 Vue 项目：自定义元素 + 默认皮肤
pnpm add @xihan-ui/web-components @xihan-ui/styles

# 只要设计令牌，皮肤自己写
pnpm add @xihan-ui/tokens

# 背景层是可选 peer，用到才装
pnpm add @xihan-ui/backgrounds
```

`@xihan-ui/styles` 不是必需的：组件不依赖默认皮肤，只拿令牌自己写样式是完全可行的一条路，见下文「样式的三种接法」。

适配器的引擎侧依赖（`kernel` / `machine` / `behavior` / `headless` / `position` / `code-highlight`）写在 `dependencies` 里，装适配器就一并带进来，不用单独列。`@xihan-ui/vue` 的 peer 依赖是 `vue@^3.5.0`，由你的项目提供。

除了从 npm 装，还有两条本地路径：

1. **克隆仓库直接开发**——playground 里 102 个组件都能跑；
2. **本地构建后链接进你的项目**——想跟着仓库最新改动走的话走这条。

::: warning
`@xihan-ui/icons` 只收录自研的一等图标集，量还很少。要成套图标请自行准备，或用 `XhIcon` 接任何图标源。
:::

## 环境要求

| 项 | 要求 |
| --- | --- |
| Node（装包使用） | ≥ 18，包的 `engines` 声明的就是这条 |
| Node / pnpm（参与本仓开发） | ≥ 24.0.0 / ≥ 11.0.0 |
| 模块格式 | ESM only，**不提供 CJS** |
| 浏览器 | 支持 `oklch()`、`@layer`、`:where()` 的现代浏览器 |

## 路径一：克隆仓库开发

```bash
git clone https://github.com/XiHanFun/XiHan.UI.git
cd XiHan.UI/ui
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev` 会同时起两个 playground：`apps/playground-vue`（Vue 适配器）与 `apps/playground-wc`（自定义元素）。两者覆盖同一批组件，可以并排对照。

常用命令：

```bash
pnpm build        # 全部库包出 dist
pnpm typecheck    # 类型检查
pnpm lint         # oxlint + eslint + stylelint
pnpm test         # 单元测试与跨适配器一致性测试（jsdom）
pnpm test:browser # 真实 Chromium 里的无障碍扫描与浮层定位契约
pnpm boundaries   # 分层依赖门禁
pnpm gate         # 十三项结构门禁
pnpm size         # 产物体积棘轮
```

首次跑 `pnpm test:browser` 前需要装浏览器：

```bash
pnpm exec playwright install chromium
```

## 路径二：链接进现有项目

先在 XiHan.UI 仓库里构建：

```bash
cd XiHan.UI/ui && pnpm build
```

再在你的项目里用 `link:` 协议指过去（pnpm 的写法，路径按实际填）：

```json
{
  "dependencies": {
    "@xihan-ui/vue": "link:../XiHan.UI/ui/packages/adapters/vue",
    "@xihan-ui/styles": "link:../XiHan.UI/ui/packages/design/styles",
    "@xihan-ui/tokens": "link:../XiHan.UI/ui/packages/design/tokens"
  }
}
```

`@xihan-ui/vue` 会顺着 `dependencies` 把 `kernel` / `machine` / `behavior` / `headless` / `position` / `code-highlight` 一并带进来，这几个不用单独链接。`vue` 本身是它的 peer 依赖，由你的项目提供。

## 接入 Vue 项目

```ts
// main.ts
import { createThemeController } from '@xihan-ui/tokens/runtime'
import { createApp } from 'vue'
import App from './App.vue'

// 令牌必须在皮肤之前：皮肤里不写兜底值，令牌缺席就是缺陷，不是降级
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 把主题的五个属性写到 <html> 上，并持久化用户偏好
createThemeController({ storageKey: 'app-theme' })

createApp(App).mount('#app')
```

组件按需从主入口取，不需要注册插件：

```vue
<script setup lang="ts">
import { XhDialogContent, XhDialogRoot, XhDialogTitle, XhDialogTrigger } from '@xihan-ui/vue'
</script>
```

包声明了 `sideEffects: false`，打包器会摇掉没用到的组件。库包**不提供**每个组件独立的子路径导出，按需靠的是 tree-shaking，不是手写路径。

## 接入原生 / 非 Vue 项目

```ts
import { createThemeController } from '@xihan-ui/tokens/runtime'
import { defineXhElements } from '@xihan-ui/web-components/define'

import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 注册全部 xh-* 元素。主入口 import 本身不注册，必须显式调用这一行
defineXhElements()
createThemeController({ storageKey: 'app-theme' })
```

之后在 HTML 里直接写标签，结构由你手写、用 `data-xh-part` 标出角色节点：

```html
<xh-button variant="solid">
  <button data-xh-part="root">提交</button>
</xh-button>
```

详见 [Web Components 适配器](./adapters/web-components)。

## 样式的三种接法

`@xihan-ui/styles` 是纯 CSS 包，与 JS 层无关，三种粒度任选：

```ts
// 1. 全量：令牌 + 层序 + reset + 全部组件皮肤
import '@xihan-ui/styles'

// 2. 按组件挑（层序声明必须最先引，否则级联顺序不成立）
import '@xihan-ui/styles/layers.css'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles/button.css'
import '@xihan-ui/styles/dialog.css'

// 3. 只要令牌，皮肤自己写
import '@xihan-ui/tokens/tokens.css'
```

第三种是完全可行的：组件不依赖默认皮肤，它只往 DOM 上打 `data-scope` / `data-part` / `data-state` 等属性，样式全由你决定。参见[皮肤与样式分层](./guide/styling)。

令牌的机读形式也可直接取用，用于生成 Figma 变量、Tailwind 主题或别的产物：

```ts
import tokens from '@xihan-ui/tokens/tokens.json' with { type: 'json' }
// { "--xh-color-brand-500": "oklch(0.623 0.214 258)", ... }
```

## 宿主有无层 reset 时改用无层版

默认的 `index.css` 把全部皮肤包在 `@layer xihan.*` 里。CSS 级联有一条容易忽略的规则：**无层声明胜过任何有层声明，与特异性无关**。所以宿主应用只要带一条无层的 reset 或 normalize，比如

```css
button { padding: 0; background-color: transparent; }
```

它就会压掉皮肤里所有 `[data-scope='button'][data-part='root']` 的对应声明——即便后者特异性高得多。表现是组件渲染成没有内边距、没有底色的裸元素。Tailwind v3 的 preflight、normalize.css、以及多数文档站/脚手架自带的重置都是无层的，都会撞上。

判断方法：组件的 `data-scope` / `data-part` 属性都在、皮肤 CSS 也确实加载了，但盒模型相关的属性全没生效。

包里为此额外发一份拆掉层壳的 `index.unlayered.css`，内容与 `index.css` 完全一致，由构建脚本从同一份源生成：

```ts
// 宿主带无层 reset 时用这份，规则改按特异性竞争
// 皮肤选择器至少是 [data-scope][data-part]（0,2,0），稳压 button（0,0,1）
import '@xihan-ui/styles/index.unlayered.css'
```

两份怎么选：

| 你的情况 | 用哪份 | 覆盖皮肤的方式 |
| --- | --- | --- |
| 自己的样式也都在 `@layer` 里（如 Tailwind v4） | `index.css` | 写进 `@layer xihan.overrides`，或任何排在 `xihan` 之后的层 |
| 宿主带无层 reset / normalize | `index.unlayered.css` | 用不低于 `[data-scope][data-part]` 的特异性 |

用 `index.css` 时，覆盖槽位是现成的：

```css
@layer xihan.overrides {
  [data-scope='button'][data-part='root'] { border-radius: 0; }
}
```

反过来只能单向：`@import url('...') layer(x)` 可以给无层样式套一层，但没有办法给已经层化的样式脱层——所以这份无层产物由库这边提供，而不是让你自己想办法拆。

本文档站用的就是无层版：VitePress 自带无层的 `button` 重置，用 `index.css` 的话所有示例都会渲染成纯文本。

## 服务端渲染

- 主题运行时在 `document` / `window` 缺席时自动走 SSR 分支：不读媒体查询、不写 DOM，一律回退到浅色与基线对比度。要让首屏不闪，请在服务端把 `data-theme` / `data-brand` / `data-density` / `data-contrast` / `dir` 五个属性直接渲染到 `<html>` 上。
- 自定义元素在 JS 到达之前不会升级。`@xihan-ui/styles` 里的 `undefined.css` 专门处理这段空窗：用 `:not(:defined)` 选中作者写的 `data-xh-part`，先把浮层族的 `content` / `positioner` / `backdrop` / `viewport` 收起来，避免内容以裸文本堆在页面流里被读屏和搜索引擎当作正文。

## 下一步

- [快速上手](./quickstart)：三种用法各写一遍
- [包与依赖关系](./npm-package-dependency)：每个包依赖谁、被谁依赖
