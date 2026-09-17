# 安装与接入

## 从 npm 安装

XiHan.UI 的 17 个公开包都已发布到 npm，同属一个版本组、始终同号。当前版本号以 npm 为准：`npm view @xihan-ui/vue version`。

安装的包取决于使用的适配器：

```bash
# Vue 3 项目：适配器 + 默认皮肤
pnpm add @xihan-ui/vue @xihan-ui/styles

# 原生 / 非 Vue 项目：自定义元素 + 默认皮肤
pnpm add @xihan-ui/web-components @xihan-ui/styles

# 只需要设计令牌，自行编写皮肤
pnpm add @xihan-ui/tokens

# 背景层与代码着色是可选 peer，按需安装
pnpm add @xihan-ui/backgrounds
pnpm add @xihan-ui/code-highlight
```

`@xihan-ui/styles` 不是必需的：组件不依赖默认皮肤，只使用令牌自行编写样式是可行的路径，见下文“样式的三种接法”。

适配器的引擎侧依赖（`core` / `motion` / `pointer` / `headless` / `position`）写在 `dependencies` 中，安装适配器时一并安装，不需要单独列出。`@xihan-ui/vue` 的 peer 依赖是 `vue@^3.5.0`，由项目提供。

`backgrounds` / `sound` / `code-highlight` 是可选 peer，按需安装。未安装 `code-highlight` 时，代码视图渲染纯文本，不报错。

除了从 npm 安装，还有两条本地路径：

1. 克隆仓库直接开发：构建库包后运行文档站，134 个组件的示例都是真实组件；
2. 本地构建后链接进项目：适合跟随仓库最新改动。

::: warning
`@xihan-ui/icons` 只收录自研的一等图标集，当前 184 枚，覆盖组件与常见界面所需，不追求完整。
需要整套图标时请自行准备，或用 `XhIcon` 接入任意图标源：它接受 `IconRecord` 纯数据，任何来源都可以转换。
:::

## 环境要求

| 项 | 要求 |
| --- | --- |
| Node（安装使用） | ≥ 18，与包的 `engines` 声明一致 |
| Node / pnpm（参与本仓库开发） | ≥ 24.0.0 / ≥ 11.0.0 |
| 模块格式 | ESM only，不提供 CJS |
| 浏览器 | 支持 `oklch()`、`@layer`、`:where()` 的现代浏览器 |

## 路径一：克隆仓库开发

```bash
git clone https://github.com/XiHanFun/XiHan.UI.git
cd XiHan.UI/ui
pnpm install --frozen-lockfile
pnpm build
```

在浏览器中查看组件请运行文档站：它通过 `link:` 指向本仓库的库包，示例渲染的是真实组件，Vue 与自定义元素两套写法并排，因此需要先 `pnpm build`。

```bash
cd ../docs
pnpm install
pnpm dev
```

回到 `ui/` 的常用命令：

```bash
pnpm build        # 全部库包出 dist
pnpm typecheck    # 类型检查
pnpm lint         # oxlint + eslint + stylelint
pnpm test         # 单元测试与跨适配器一致性测试（jsdom）
pnpm test:browser # 真实 Chromium 里的无障碍扫描与浮层定位契约
pnpm boundaries   # 分层依赖门禁
pnpm gate         # 121 项结构门禁
pnpm size         # 产物体积棘轮
```

首次运行 `pnpm test:browser` 前需要安装浏览器：

```bash
pnpm exec playwright install chromium
```

## 路径二：链接进现有项目

先在 XiHan.UI 仓库中构建：

```bash
cd XiHan.UI/ui && pnpm build
```

再在项目中用 `link:` 协议指向它（pnpm 写法，路径按实际填写）：

```json
{
  "dependencies": {
    "@xihan-ui/vue": "link:../XiHan.UI/ui/packages/adapters/vue",
    "@xihan-ui/styles": "link:../XiHan.UI/ui/packages/design/styles",
    "@xihan-ui/tokens": "link:../XiHan.UI/ui/packages/design/tokens"
  }
}
```

`@xihan-ui/vue` 会通过 `dependencies` 一并引入 `core` / `motion` / `pointer` / `headless` / `position`，这些包不需要单独链接。`vue` 本身是它的 peer 依赖，由项目提供。

## 接入 Vue 项目

```ts
// main.ts
import { createVisualEnvironmentController } from "@xihan-ui/tokens/runtime";
import { createApp } from "vue";
import App from "./App.vue";

// 皮肤入口自带层序声明与令牌，只引这一行；单独引 tokens.css 是只要令牌不要皮肤的路径
import "@xihan-ui/styles";

// 把七轴视觉环境写到 <html> 上，并显式处理持久化失败
createVisualEnvironmentController({
  root: document.documentElement,
  storageKey: "app-visual-environment",
  onStorageError: detail => console.error("视觉偏好持久化失败", detail),
  initial: { mode: "system", motion: "system", transparency: "system" },
});

createApp(App).mount("#app");
```

组件按需从主入口取，不需要注册插件：

```vue
<script setup lang="ts">
import { XhDialogContent, XhDialogRoot, XhDialogTitle, XhDialogTrigger } from "@xihan-ui/vue";
</script>
```

包声明了 `sideEffects: false`，打包器会移除未使用的组件。库包不提供每个组件独立的子路径导出，按需引入依靠 tree-shaking。

::: tip 中文项目的配置
组件的内建文案（关闭按钮的读屏名称、分页的翻页说明等）默认为英文；日期时间类组件另接受 `locale`，未提供时跟随浏览器语言，读取失败时使用 `en-US`。
要将两者固定为中文，在根组件中 `provideXhConfig({ locale: 'zh-CN', translations: { … } })` 全局配置一次即可，不需要逐实例传 `:translations`。文档站的示例是孤立片段，因此逐个传入；真实应用不应如此。见[国际化](./guide/i18n)。
:::

## 接入原生 / 非 Vue 项目

```ts
import { createVisualEnvironmentController } from "@xihan-ui/tokens/runtime";
import { defineXhElements } from "@xihan-ui/web-components/define";

import "@xihan-ui/styles";

// 注册全部 xh-* 元素。主入口 import 本身不注册，必须显式调用这一行
defineXhElements();
createVisualEnvironmentController({
  root: document.documentElement,
  storageKey: "app-visual-environment",
  onStorageError: detail => console.error("视觉偏好持久化失败", detail),
  initial: { mode: "system", motion: "system", transparency: "system" },
});
```

之后在 HTML 中直接写标签，结构由作者编写，用 `data-xh-part` 标出角色节点：

```html
<xh-button variant="solid">
  <button data-xh-part="root">提交</button>
</xh-button>
```

详见 [Web Components 适配器](./adapters/web-components)。

## 样式的三种接法

`@xihan-ui/styles` 是纯 CSS 包，与 JS 层无关，三种粒度任选：

全量：令牌 + 层序 + reset + 全部组件皮肤。

```ts
import "@xihan-ui/styles";
```

按组件引入。layers.css 与 tokens.css 各自带完整层序声明，先引入任一即可；组件皮肤不能排在它们之前。

```ts
import "@xihan-ui/styles/layers.css";
import "@xihan-ui/tokens/tokens.css";
import "@xihan-ui/styles/button.css";
import "@xihan-ui/styles/dialog.css";
```

只引入令牌，自行编写皮肤。

```ts
import "@xihan-ui/tokens/tokens.css";
```

第三种同样保持层序：tokens.css 自带完整的层序声明，自行编写的皮肤直接写进 `@layer xihan.overrides` 即可。组件不依赖默认皮肤，只向 DOM 写入 `data-scope` / `data-part` / `data-state` 等属性，样式完全由使用者决定。参见[皮肤与样式分层](./guide/styling)。

::: warning 第二种需要注意两点
1. 漏引默认是静默的。少引一份皮肤时，该组件的 `data-scope` / `data-part` 照常存在、其他皮肤也已加载，只有它渲染为没有内边距、没有底色的裸元素。开发模式下开启下文的探测器可以发现。
2. 顺序按 `index.css` 的相对顺序。同一个 `@layer xihan.components` 内，等特异性的规则由源序决定。自行排序（按字母、按目录读取序）当前可能看不出差别，将来增加跨组件规则后会与全量引入的渲染不同。需要按需引入时，按 `index.css` 的 `@import` 清单过滤，不自行排序。

全量是 145 份皮肤加令牌，压缩后约 66 kB gzip。没有明确的体积压力时使用第一种。
:::

### 开发模式下查漏引

每份组件皮肤在自己的 `[data-scope='X']` 上写入一个 `--xh-X-skin` 标记。`startSkinCheck()` 扫描页面上出现过的每个 scope，取不到标记即说明该 CSS 未加载：

```ts
if (import.meta.env.DEV) {
  const { startSkinCheck } = await import("@xihan-ui/core/skin-check");
  startSkinCheck();
}
```

报告到[诊断通道](./guide/diagnostics)，代码为 `styles.missing-skin`：

```
[xh][button] [styles] button 的皮肤没引：import '@xihan-ui/styles/button.css'，或改引全量的 '@xihan-ui/styles'
```

每个 scope 只探测一次（探测需要读取计算样式，逐实例探测会触发强制样式重算），用 `MutationObserver` 接收后续进入的节点，返回值是停止函数。全量引入时开启它没有额外输出。

传入 `root` 时，元素品牌、计算样式和 MutationObserver 全部取自该 root 所属的 Window，因此 iframe 中的按需皮肤可以独立检查；即使顶层没有 DOM globals，有效的显式 root 仍可工作。显式 root 没有活动 Window，或所属 Window 不提供 MutationObserver 时会直接抛错，不会只扫一次后静默停止持续检查。SSR 中不传 root 仍返回空停止函数。

令牌的机读形式也可直接使用，用于生成 Figma 变量、Tailwind 主题或其他产物：

```ts
import tokens from "@xihan-ui/tokens/tokens.json" with { type: "json" };
// { "--xh-color-brand-500": "oklch(0.623 0.214 258)", ... }
```

## 宿主有无层 reset 时改用无层版

默认的 `index.css` 把全部皮肤包在 `@layer xihan.*` 内。CSS 级联有一条容易忽略的规则：无层声明胜过任何有层声明，与特异性无关。因此宿主应用只要带一条无层的 reset 或 normalize，例如

```css
button { padding: 0; background-color: transparent; }
```

它就会覆盖皮肤中所有 `[data-scope='button'][data-part='root']` 的对应声明，即便后者特异性更高。表现是组件渲染为没有内边距、没有底色的裸元素。Tailwind v3 的 preflight、normalize.css，以及多数文档站 / 脚手架自带的重置都是无层的，都会触发这一问题。

判断方法：组件的 `data-scope` / `data-part` 属性都存在、皮肤 CSS 已加载，但盒模型相关的属性全部未生效。

包内为此额外提供一份移除层壳的 `index.unlayered.css`，内容与 `index.css` 完全一致，由构建脚本从同一份源生成：

```ts
// 宿主带无层 reset 时用这份，规则改按特异性竞争
// 皮肤选择器至少是 [data-scope][data-part]（0,2,0），稳压 button（0,0,1）
import "@xihan-ui/styles/index.unlayered.css";
```

两份的选择：

| 情况 | 使用 | 覆盖皮肤的方式 |
| --- | --- | --- |
| 自己的样式也都在 `@layer` 内（如 Tailwind v4） | `index.css` | 写进 `@layer xihan.overrides`，或任何排在 `xihan` 之后的层 |
| 宿主带无层 reset / normalize | `index.unlayered.css` | 使用不低于 `[data-scope][data-part]` 的特异性 |

无层版本里库自己的 reset 层（`box-sizing`、表单控件的 `font: inherit`、浮层落位前的 `visibility: hidden` 等）特指度是 (0,0,0)，宿主的元素选择器（`button { font-family: … }` 这类 (0,0,1)）会压过它。这只影响 reset 本身：Action Control / Field Chrome 等家族配方与组件皮肤自己声明的 `font-size`、`line-height` 不受影响，宿主 reset 需要与库一致时把同样的声明写成 `inherit` 即可。取舍见[皮肤与样式分层](./guide/styling#reset-只作用于库节点)。

使用 `index.css` 时，覆盖位置是现成的：

```css
@layer xihan.overrides {
  [data-scope='button'][data-part='root'] { border-radius: 0; }
}
```

转换是单向的：`@import url('...') layer(x)` 可以给无层样式套一层，但无法给已层化的样式脱层，因此无层产物由库提供。

本文档站使用的就是无层版：VitePress 自带无层的 `button` 重置，使用 `index.css` 时所有示例都会渲染为纯文本。

因此本站的示例全部运行在无层版本上，层序在这里不成立。上表、`@layer xihan.overrides` 的覆盖写法，以及任何与层序有关的表现，本站示例都无法演示与验证；请在自己的项目中引入 `index.css` 后验证。

## 服务端渲染

- 视觉环境运行时在 `document` / `window` 缺席时自动进入 SSR 分支：不读媒体查询、不写 DOM，使用七轴基线。要避免首屏闪烁，在服务端把 `data-theme` / `data-brand` / `data-density` / `data-contrast` / `data-motion` / `data-transparency` / `dir` 七个属性直接渲染到 `<html>` 上。
- 自定义元素在 JS 到达之前不会升级。`@xihan-ui/styles` 中的 `undefined.css` 处理这段窗口：用 `:not(:defined)` 选中作者编写的 `data-xh-part`，先把浮层族的 `content` / `positioner` / `backdrop` / `viewport` 收起，避免内容以裸文本出现在页面流中被读屏和搜索引擎视为正文。

## 下一步

- [快速上手](./quickstart)：三种用法的最小示例
- [包与依赖关系](./npm-package-dependency)：各包的依赖关系
