# 安装与接入

## 现状：还不能从 npm 装

XiHan.UI 的库包**尚未发布到 npm**，版本号仍是 `0.0.0`。`npm install @xihan-ui/vue` 现在装不到东西。

在发布之前有两条可用路径：

1. **克隆仓库直接开发**——推荐，playground 里 69 个组件都能跑；
2. **本地构建后链接进你的项目**——想先试用的话走这条。

::: warning
`@xihan-ui/icons` 是一个冻结的遗留包：不进构建图、不发布，源码里还引着已经删掉的依赖。在它重建之前，图标请自行准备。
:::

## 环境要求

| 项 | 要求 |
| --- | --- |
| Node | ≥ 24.0.0 |
| pnpm | ≥ 11.0.0 |
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
pnpm gate         # 八项结构门禁
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
    "@xihan-ui/vue": "link:../XiHan.UI/ui/packages/vue",
    "@xihan-ui/styled": "link:../XiHan.UI/ui/packages/styled",
    "@xihan-ui/system": "link:../XiHan.UI/ui/packages/system"
  }
}
```

`@xihan-ui/vue` 会顺着 `dependencies` 把 `core` / `machine` / `behavior` / `headless` / `position` / `highlight` 一并带进来，这几个不用单独链接。`vue` 本身是它的 peer 依赖，由你的项目提供。

## 接入 Vue 项目

```ts
// main.ts
import { createThemeController } from '@xihan-ui/system/runtime'
import { createApp } from 'vue'
import App from './App.vue'

// 令牌必须在皮肤之前：皮肤里不写兜底值，令牌缺席就是缺陷，不是降级
import '@xihan-ui/system/tokens.css'
import '@xihan-ui/styled'

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
import { createThemeController } from '@xihan-ui/system/runtime'
import { defineXhElements } from '@xihan-ui/wc/define'

import '@xihan-ui/system/tokens.css'
import '@xihan-ui/styled'

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

详见 [Web Components 适配器](./adapters/wc)。

## 样式的三种接法

`@xihan-ui/styled` 是纯 CSS 包，与 JS 层无关，三种粒度任选：

```ts
// 1. 全量：令牌 + 层序 + reset + 全部组件皮肤
import '@xihan-ui/styled'

// 2. 按组件挑（层序声明必须最先引，否则级联顺序不成立）
import '@xihan-ui/styled/layers.css'
import '@xihan-ui/system/tokens.css'
import '@xihan-ui/styled/button.css'
import '@xihan-ui/styled/dialog.css'

// 3. 只要令牌，皮肤自己写
import '@xihan-ui/system/tokens.css'
```

第三种是完全可行的：组件不依赖默认皮肤，它只往 DOM 上打 `data-scope` / `data-part` / `data-state` 等属性，样式全由你决定。参见[皮肤与样式分层](./guide/styling)。

令牌的机读形式也可直接取用，用于生成 Figma 变量、Tailwind 主题或别的产物：

```ts
import tokens from '@xihan-ui/system/tokens.json' with { type: 'json' }
// { "--xh-color-brand-500": "oklch(0.623 0.214 258)", ... }
```

## 服务端渲染

- 主题运行时在 `document` / `window` 缺席时自动走 SSR 分支：不读媒体查询、不写 DOM，一律回退到浅色与基线对比度。要让首屏不闪，请在服务端把 `data-theme` / `data-brand` / `data-density` / `data-contrast` / `dir` 五个属性直接渲染到 `<html>` 上。
- 自定义元素在 JS 到达之前不会升级。`@xihan-ui/styled` 里的 `undefined.css` 专门处理这段空窗：用 `:not(:defined)` 选中作者写的 `data-xh-part`，先把浮层族的 `content` / `positioner` / `backdrop` / `viewport` 收起来，避免内容以裸文本堆在页面流里被读屏和搜索引擎当作正文。

## 下一步

- [快速上手](./quickstart)：三种用法各写一遍
- [包与依赖关系](./npm-package-dependency)：每个包依赖谁、被谁依赖
