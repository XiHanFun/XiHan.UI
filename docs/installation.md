# 安装与接入

## 从 npm 安装

XiHan.UI 的 18 个公开包都已发布到 npm，同属一个版本组、始终同号。当前版本号以 npm 为准：`npm view @xihan-ui/vue version`。

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

适配器的引擎侧依赖（`kernel` / `machine` / `motion` / `pointer` / `behavior` / `headless` / `position` / `code-highlight`）写在 `dependencies` 里，装适配器就一并带进来，不用单独列。`@xihan-ui/vue` 的 peer 依赖是 `vue@^3.5.0`，由你的项目提供。

除了从 npm 装，还有两条本地路径：

1. **克隆仓库直接开发**——构建库包后把文档站跑起来，127 个组件的示例都是真实组件；
2. **本地构建后链接进你的项目**——想跟着仓库最新改动走的话走这条。

::: warning
`@xihan-ui/icons` 只收录自研的一等图标集，当前 184 枚，覆盖的是组件与常见界面用得上的那批，不追求成套。
要整套图标请自行准备，或用 `XhIcon` 接任何图标源——它收的是 `IconRecord` 纯数据，任何来源都能转过来。
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
pnpm build
```

看组件在浏览器里跑起来，走文档站：它按 `link:` 指向本仓的库包，示例渲染的是真实组件，Vue 与自定义元素两套写法并排，所以要先 `pnpm build`。

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
pnpm gate         # 90 项结构门禁
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

`@xihan-ui/vue` 会顺着 `dependencies` 把 `kernel` / `machine` / `motion` / `pointer` / `behavior` / `headless` / `position` / `code-highlight` 一并带进来，这几个不用单独链接。`vue` 本身是它的 peer 依赖，由你的项目提供。

## 接入 Vue 项目

```ts
// main.ts
import { createThemeController } from '@xihan-ui/tokens/runtime'
import { createApp } from 'vue'
import App from './App.vue'

// 皮肤入口自带层序声明与令牌，只引这一行；单独引 tokens.css 是「只要令牌不要皮肤」那条路
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

::: tip 中文项目还差一步
组件的内建文案（关闭钮的读屏名、分页的翻页说明这类）默认是英文；日期时间系组件另收一个 `locale`，不给它就跟着浏览器语言走、读不到才落 `en-US`。
要把两样都钉死成中文，在根组件里 `provideXhConfig({ locale: 'zh-CN', translations: { … } })` 全局配一次即可，不必逐实例传
`:translations`——文档站的示例都是孤立片段，所以逐个传，真实应用不该那么写。见[国际化](./guide/i18n)。
:::

## 接入原生 / 非 Vue 项目

```ts
import { createThemeController } from '@xihan-ui/tokens/runtime'
import { defineXhElements } from '@xihan-ui/web-components/define'

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

// 2. 按组件挑（layers.css 与 tokens.css 各自都带完整层序声明，先引任一条即可；组件皮肤不能排在它们之前）
import '@xihan-ui/styles/layers.css'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles/button.css'
import '@xihan-ui/styles/dialog.css'

// 3. 只要令牌，皮肤自己写
import '@xihan-ui/tokens/tokens.css'
```

第三种同样立得住层序：tokens.css 自己带一份完整的层序声明，自己写的皮肤直接写进 `@layer xihan.overrides` 即可。组件不依赖默认皮肤，它只往 DOM 上打 `data-scope` / `data-part` / `data-state` 等属性，样式全由你决定。参见[皮肤与样式分层](./guide/styling)。

::: warning 第二种有两条要自己扛的
1. **漏引原本是静默的。** 少引一份皮肤，那个组件的 `data-scope` / `data-part` 照常都在、别的皮肤
   也确实加载了，只有它渲染成没有内边距、没有底色的裸元素。开发模式下开着下面那个探测器就不会漏掉。
2. **顺序要照 `index.css` 的相对顺序来。** 同一个 `@layer xihan.components` 内，等特异性的规则靠源序定胜负。
   自己另起一套排序（按字母、按目录读取序）今天可能看不出差别，将来加进一条跨组件规则就会与全量引入的人渲染不同。
   要按需，就把 `index.css` 的 `@import` 清单过滤一遍，别自己排。

全量是 134 份皮肤加令牌，压缩后约 66 kB gzip。没有明确的体积压力就用第一种。
:::

### 开发模式下查漏引

每份组件皮肤在自己的 `[data-scope='X']` 上落了一个 `--xh-X-skin` 标记。
`startSkinCheck()` 扫页面上出现过的每个 scope，取不到标记就说明那份 CSS 不在场：

```ts
if (import.meta.env.DEV) {
  const { startSkinCheck } = await import('@xihan-ui/kernel/skin-check')
  startSkinCheck()
}
```

报进[诊断通道](./guide/diagnostics)，码是 `styles.missing-skin`：

```
[xh][button] [styles] button 的皮肤没引：import '@xihan-ui/styles/button.css'，或改引全量的 '@xihan-ui/styles'
```

每个 scope 只探一次（探测要读计算样式，逐实例探是真实的强制样式重算），
用 `MutationObserver` 接住后续进来的节点，返回值是停止函数。全量引入的人开着它也没有额外产出。

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
