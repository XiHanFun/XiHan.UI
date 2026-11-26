# 架构总览

XiHan.UI 是一个 pnpm + turbo 的 monorepo。它的组织方式服务于一个目标：让组件的行为独立于渲染它的框架存在。

## 一个组件的五份产物

以对话框为例，`dialog` 这个组件在仓库里落成五处：

| 产物 | 位置 | 内容 |
| --- | --- | --- |
| 无头内核 | `packages/engine/headless/src/dialog/` | 解剖、状态机、键盘规格表、`connect` |
| Vue 组件 | `packages/adapters/vue/src/components/dialog/` | `XhDialogRoot` 等一组 `defineComponent` |
| React 组件 | `packages/adapters/react/src/components/dialog/` | `XhDialogRoot` 等函数组件与 hooks |
| 自定义元素 | `packages/adapters/web-components/src/elements/dialog.ts` | `<xh-dialog>`，Light-DOM 行为宿主 |
| 皮肤 | `packages/design/styles/css/dialog.css` | 纯 CSS，按 `data-*` 选中 |

组件行为由无头内核定义；三个适配器分别将属性与事件接到 Vue、React 和作者的 DOM，皮肤决定这些状态的外观。

## 分层与依赖矩阵

层级越低越基础，只能向下依赖。拓扑写在 `tooling/eslint-config/src/layers.json`，由 dependency-cruiser 在 `pnpm boundaries` 时强制执行。

| 层 | 包 | 可依赖 |
| --- | --- | --- |
| 1 | `core` | `motion` |
| 1 | `motion` | — |
| 1 | `icons` | — |
| 1 | `pointer` | — |
| 1 | `viz` | — |
| 1 | `expression` | — |
| 1 | `xlsx` | — |
| 2 | `tokens` | `core` |
| 2 | `position` | `core` |
| 2 | `code-highlight` | `core` |
| 2 | `chat-stream` | `core` |
| 2 | `markdown` | `core` |
| 2 | `sound` | `core` |
| 2 | `designer-kit` | `core` `pointer` `expression` `viz` |
| 2 | `animations` | `core` `motion` |
| 3 | `headless` | `core` `tokens` `motion` `pointer` `viz` `expression` |
| 3 | `styles` | —（纯 CSS，不得依赖任何 JS 包） |
| 3 | `backgrounds` | `core` `motion` |
| 4 | `vue` | `core` `headless` `position` `code-highlight` `tokens` `backgrounds` `sound` `motion` `pointer` `expression` |
| 4 | `react` | `core` `headless` `position` `code-highlight` `tokens` `backgrounds` `sound` `motion` `pointer` `expression` |
| 4 | `web-components` | `core` `headless` `position` `code-highlight` `tokens` `backgrounds` `motion` `pointer` `expression` |
| 5 | `designer-shell` | `core` `pointer` `designer-kit` `web-components` `tokens` `viz` |
| 5 | `cli` | — |

除分层外还有三条硬规则，同样由门禁执行：

- 库包的运行时代码不引入第三方依赖。登记在案的例外只有适配器的宿主框架（`vue`、`react` 与 `react-dom`）。
- `styles` 是纯 CSS。它不依赖任何 JS 包，可以脱离整个 JS 层单独使用。
- 依赖版本只从 workspace catalog 取。包内一律使用 `catalog:` 或 `workspace:` 协议引用，不内联版本号。

## 一次交互经过哪些层

以点击对话框的触发器为例：

```
用户点击
   │
   ▼
适配器把 DOM 事件交给 connect 产出的 onClick        （vue / react / web-components）
   │
   ▼
service.send({ type: 'TRIGGER.CLICK' })            （core）
   │
   ▼
状态机转移 closed → open，执行 entry 动作           （core）
   │
   ├─► 行为原语接管：锁滚动、建焦点域、压入层栈      （core）
   ├─► 浮层族还会请定位引擎算坐标                    （position）
   │
   ▼
适配器重新读 connect，把新的 aria-* / data-* 铺到部件上
   │
   ▼
皮肤按 [data-state='open'] 命中新规则，动画播放      （styles）
```

中间三步与框架无关，Vue、React 与 Web Components 适配器各自负责首尾两步。

## 包一览

公开包按职责分五组，各包做什么、依赖谁、在第几层见[包与依赖关系](./npm-package-dependency)。

- **内核与原语**：`core`、`motion`、`position`、`pointer`、`viz`、`expression`
- **组件与适配器**：`headless`、`vue`、`react`、`web-components`
- **表现**：`tokens`、`styles`、`icons`
- **内容与效果**：`chat-stream`、`markdown`、`code-highlight`、`backgrounds`、`sound`、`animations`、`designer-kit`、`designer-shell`、`xlsx`
- **开发工具**：`cli`

`tooling/*` 下的构建、lint、tsconfig、测试与门禁脚本等内部包一律不发布。

## 目录结构

```
XiHan.UI/
├── ui/                      # 组件库工作区（pnpm workspace）
│   ├── packages/            # 对外发布的库包，按角色分五组
│   │   ├── adapters/        # vue · react · web-components，按宿主选择
│   │   ├── design/          # tokens · styles · icons，外观
│   │   ├── features/        # markdown · chat-stream · backgrounds · sound · animations · code-highlight · designer-kit · designer-shell · xlsx，按需选用
│   │   ├── engine/          # core · motion · pointer · position · viz · expression · headless
│   │   └── tools/           # cli，开发时用，不进应用产物
│   └── tooling/             # 内部构建与质量工具
│       ├── build/           # 打包配置与 exports 回写
│       ├── eslint-config/   # lint 规则 + 分层拓扑事实源
│       ├── stylelint-config/
│       ├── testing/         # 一致性 / 无障碍 / 定位三套判据的运行时
│       └── scripts/         # 门禁脚本
└── docs/                    # 文档站（VitePress），通过 link: 引用上述库包
```

文档站提供 Vue、React 与自定义元素的真实组件示例；示例源文件在 `docs/.vitepress/demos/<组件>/` 下。各框架覆盖由 `check-demo-frameworks` 核对，不适用项和缺席项分别登记。

## 技术选型

| 位置 | 选型 |
| --- | --- |
| 语言 | TypeScript |
| 支持面 | Node、模块格式与浏览器硬底线见[版本与兼容性政策 · 支持面](./guide/versioning#八、支持面) |
| 构建 | tsdown（库包）+ turbo（任务编排） |
| 样式 | 原生 CSS，`@layer` 分层，`oklch` 色彩空间，无预处理器 |
| 测试 | vitest（jsdom）+ Playwright（真实 Chromium） |
| 发布 | changesets，全部库包同属一个 fixed 版本组 |

## 下一步

- [安装与接入](./installation)：完成接入并运行
- [快速上手](./quickstart)：四种写法的最小示例
- [解剖与部件契约](./guide/anatomy)：`data-scope` / `data-part` 约定
