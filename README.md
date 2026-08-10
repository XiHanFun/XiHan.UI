<div align="center">
<img src="./assets/banner.png" alt="XiHan.UI" />
<h1>XiHan.UI</h1>

<p><b>快速、轻量、高效、用心的跨框架组件库</b></p>

<p>无头内核 + Vue / Web Components 双适配器 · 69 个组件 · 14 个 workspace 包 · TypeScript Monorepo</p>

<p>
  <a href="https://github.com/XiHanFun/XiHan.UI/stargazers"><img alt="GitHub Stars" src="https://img.shields.io/github/stars/XiHanFun/XiHan.UI?style=flat-square&logo=github&label=Stars&color=1f6feb" /></a>
  <a href="https://gitee.com/XiHanFun/XiHan.UI"><img alt="Gitee Stars" src="https://gitee.com/XiHanFun/XiHan.UI/badge/star.svg" /></a>
  <a href="https://gitcode.com/XiHanFun/XiHan.UI"><img alt="GitCode Stars" src="https://gitcode.com/XiHanFun/XiHan.UI/star/badge.svg" /></a>
</p>

<p>
  <img alt="Vue" src="https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img alt="Turborepo" src="https://img.shields.io/badge/Turborepo-2.10-EF4444?style=flat-square&logo=turborepo&logoColor=white" />
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-11-F69220?style=flat-square&logo=pnpm&logoColor=white" />
  <img alt="Components" src="https://img.shields.io/badge/Components-69-1f6feb?style=flat-square" />
  <img alt="npm" src="https://img.shields.io/badge/npm-unpublished-orange?style=flat-square&logo=npm&logoColor=white" />
</p>

<p>
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/github/license/XiHanFun/XiHan.UI?style=flat-square&color=green" /></a>
  <a href="https://github.com/XiHanFun/XiHan.UI/commits"><img alt="Last Commit" src="https://img.shields.io/github/last-commit/XiHanFun/XiHan.UI?style=flat-square&color=blueviolet" /></a>
  <img alt="Commit Activity" src="https://img.shields.io/github/commit-activity/m/XiHanFun/XiHan.UI?style=flat-square" />
  <a href="https://github.com/XiHanFun/XiHan.UI/issues"><img alt="Issues" src="https://img.shields.io/github/issues/XiHanFun/XiHan.UI?style=flat-square" /></a>
  <a href="https://github.com/XiHanFun/XiHan.UI/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/XiHanFun/XiHan.UI?style=flat-square" /></a>
  <img alt="Repo Size" src="https://img.shields.io/github/repo-size/XiHanFun/XiHan.UI?style=flat-square" />
</p>

<p>
  <a href="https://deepwiki.com/XiHanFun/XiHan.UI"><img alt="Ask DeepWiki" src="https://deepwiki.com/badge.svg" /></a>
  <a href="https://ui.docs.xihanfun.com"><img alt="Docs" src="https://img.shields.io/badge/Docs-ui.docs.xihanfun.com-2496ED?style=flat-square&logo=readthedocs&logoColor=white" /></a>
  <a href="https://qm.qq.com/q/qYp1Urv3z2"><img alt="QQ Group" src="https://img.shields.io/badge/QQ_Group-462371834-EB1923?style=flat-square&logo=tencentqq&logoColor=white" /></a>
</p>

</div>

> **实验性项目**：69 个组件的内核、Vue 适配器、Web Components 适配器与默认皮肤均已实现，无障碍扫描跑在真实 Chromium 上、存量违规登记表已从 24 条降到 2 条（WC 侧 `steps` 一条，外加一条步骤重放豁免），但**尚未发布到 npm**。请勿在生产环境依赖。

## 概述

XiHan.UI 是面向跨框架场景的组件库：一个组件的状态、交互与无障碍逻辑沉在框架无关的无头内核里，各框架只写一层薄适配器。同一份 `connect()` 产出在 Vue 与 Web Components 两端跑同一套一致性测试，逐帧比对归一化后的 DOM，以此证明「框架无关」不是口号。

内核自研有限状态机与行为原语，样式走构建期 CSS 与设计令牌，运行时不做 CSS-in-JS。整个 workspace 的运行时第三方依赖只剩一个 —— `@internationalized/date`（headless 日期族的历法运算）。浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 均为自研。

## 设计原则

- **框架无关** - 状态与无障碍逻辑住在无头内核，适配器只做属性铺设与生命周期桥接
- **零运行时依赖** - 能自己实现的不引第三方；引之前先问它值不值一个长期维护面
- **判据外化** - 键盘表是可达性的分母、无障碍存量违规逐条登记、Markdown 一致率钉成基线，靠门禁而非自觉
- **分层强制** - 依赖拓扑写在单一事实源里，由 dependency-cruiser 拦截，不靠约定
- **构建期样式** - 令牌从 DTCG 源产出 CSS 变量，皮肤按 `@layer` 分层，运行时不生成样式
- **端口与实现分离** - 浮层定位、代码着色这类可替换能力只在核心留契约，实现另装一包

## 技术栈

| 类别 | 技术 | 版本 |
| --- | --- | --- |
| 语言 | TypeScript | 6.0 |
| 适配器 | Vue | 3.5 |
| 适配器 | Web Components（自研响应式基类） | - |
| 构建 | tsdown / Vite / Turborepo | 0.22 / 8.1 / 2.10 |
| 包管理 | pnpm workspace + catalog | 11 |
| 测试 | Vitest | 4.1 |
| 浏览器态测试 | @vitest/browser + Playwright + axe-core | 4.1 / 1.62 / 4.12 |
| 代码检查 | ESLint + oxlint | 10.7 / 1.75 |
| 样式检查 | Stylelint（配好了但未进脚本） | 16.19 |
| 依赖门禁 | dependency-cruiser | 18.1 |
| 发布 | changesets | 2.31 |
| 日期运算 | @internationalized/date | 3.12 |

## 架构概览

包按层组织，层级越低越基础，只能向下依赖。依赖拓扑的单一事实源是 `tooling/eslint-config/src/layers.json`，dependency-cruiser 据它生成门禁规则：

```text
┌─────────────────────────────────────────────────────────────────┐
│                        4. 适配器层                              │
│  vue                            wc                              │
├─────────────────────────────────────────────────────────────────┤
│                        3. 组件层                                │
│  headless (69 个组件的 anatomy + machine + connect)             │
│  styled   (默认皮肤，纯 CSS，不依赖任何 JS 包)                  │
├─────────────────────────────────────────────────────────────────┤
│                        2. 能力层                                │
│  behavior  position  highlight  ai  markdown  visual            │
├─────────────────────────────────────────────────────────────────┤
│                        1. 基础层                                │
│  core (结构原语与端口契约)      machine (FSM 运行时)            │
│  system (设计令牌与主题运行时)  icons (首方图标集)              │
└─────────────────────────────────────────────────────────────────┘
```

### 命名约定

- `@xihan-ui/[包名]` — npm 作用域固定为 `@xihan-ui`
- `Xh[组件名]` — Vue 组件前缀，与消费方自有的 `X*` 组件隔离
- `<xh-[组件名]>` — 自定义元素，Light DOM 行为宿主
- `data-scope` / `data-part` — 解剖属性，样式与测试都以它定位，不用类名

## 包清单

### 基础层

| 包 | 说明 |
| --- | --- |
| `core` | 结构原语：anatomy、`mergeProps`、`normalizeProps`、Scope、context、id 生成；以及浮层定位、虚拟滚动、代码着色三个端口的类型契约 |
| `machine` | 自研薄 FSM 运行时：`createMachine`、解释器契约、受控值绑定、效应生命周期 |
| `system` | 设计令牌产物（DTCG 源 → CSS / JSON / TS 三种形态）与主题运行时（明暗 / 品牌 / 密度 / 对比度 / 书写方向） |
| `icons` | 首方图标集：`IconRecord` 结构化记录，渲染端逐节点建元素，运行期不解析 SVG 字符串 |

### 能力层

| 包 | 说明 |
| --- | --- |
| `behavior` | 交互行为原语：消解层、焦点域、滚动锁、进出场、集合导航、typeahead、粘底滚动 |
| `position` | 浮层定位实现：包含块解析、缩放换算、翻面与避让、跟随更新。自研，零第三方 |
| `highlight` | 代码着色实现：单趟扫描的粗粒度词法器，十来种语言。自研，零第三方 |
| `ai` | AI 协议内核：SSE 读取 → 协议归一 → parts 归约 → 会话 store。零 DOM、零框架 |
| `markdown` | 流式 Markdown 渲染内核：增量切块 + 稳定 key + 消毒。CommonMark 子集，一致率 489/652 |
| `visual` | 视觉层：WebGL2 背景效果与数据驱动的粒子云，框架无关 |

### 组件与适配器

| 包 | 说明 |
| --- | --- |
| `headless` | 69 个组件的 anatomy + machine + `connect`，无样式、无框架 |
| `styled` | 默认皮肤，按 `@layer` 分层的纯 CSS，靠 `data-part` 定位 |
| `vue` | Vue 3 适配器：`useMachine`、属性归一、复合组件 |
| `wc` | Web Components 适配器：自研响应式基类，Light DOM 行为宿主 |

`tooling/*` 放构建、lint、tsconfig、测试与脚本等内部包，不对外发布。

## 组件清单

69 个组件，每个都有 headless 内核、Vue 组件、自定义元素与默认皮肤：

| 组 | 组件 |
| --- | --- |
| 浮层 | dialog · drawer · popover · tooltip · hover-card · tour |
| 导航 | menu · context-menu · menubar · navigation-menu · tabs · breadcrumb · pagination · steps · anchor · toolbar |
| 表单 | field · form · text-field · number-field · pin-input · tags-input · editable · file-upload |
| 选择 | checkbox · checkbox-group · radio-group · switch · toggle · toggle-group · select · combobox · listbox · cascader · transfer |
| 日期时间 | calendar · date-field · date-picker · time-field · time-picker |
| 取值 | slider · rating · color-picker |
| 数据 | table · tree · tree-select · virtualizer |
| 展示 | avatar · badge · image · carousel · accordion · collapsible · separator |
| 反馈 | toast · toaster · progress · loading-bar · alert · spinner · skeleton · empty-state |
| AI | thread · composer · code-block |
| 其他 | button · scroll-area · splitter · clipboard |

两个 playground 逐组件对照两套适配器的行为：`apps/playground-vue` 与 `apps/playground-wc`。

## 快速开始

> 尚未发布至 npm，眼下只能在本仓 workspace 内使用。下面的导入路径即最终形态。

### 样式与主题

两个适配器共用同一份令牌与皮肤，入口处各引一次：

```ts
import { createThemeController } from '@xihan-ui/system/runtime'
import '@xihan-ui/system/tokens.css'
import '@xihan-ui/styled'

// 把主题写到根元素（明暗 / 品牌 / 密度 / 对比度 / 书写方向五个属性）
createThemeController({ storageKey: 'app-theme' })
```

### Vue

```vue
<script setup lang="ts">
import { XhDialogContent, XhDialogRoot, XhDialogTitle, XhDialogTrigger } from '@xihan-ui/vue'
</script>

<template>
  <XhDialogRoot v-slot="{ setOpen }">
    <XhDialogTrigger>打开对话框</XhDialogTrigger>
    <XhDialogContent>
      <XhDialogTitle>确认操作</XhDialogTitle>
      <button @click="setOpen(false)">关闭</button>
    </XhDialogContent>
  </XhDialogRoot>
</template>
```

### Web Components

元素不生成结构：作者写带 `data-xh-part` 的 Light-DOM 子节点，元素把 `connect()` 产出打上去。

```ts
import { defineXhElements } from '@xihan-ui/wc/define'

defineXhElements()
```

```html
<xh-dialog>
  <button data-xh-part="trigger">打开对话框</button>
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <h2 data-xh-part="title">确认操作</h2>
      <button data-xh-part="close-trigger">关闭</button>
    </div>
  </div>
</xh-dialog>
```

### 本地开发

```bash
cd ui
pnpm install --frozen-lockfile
pnpm dev          # 启动 playground
pnpm test         # 单元测试与跨适配器一致性测试（jsdom）
pnpm test:browser # 真实 Chromium 里的无障碍扫描与浮层定位契约
pnpm typecheck
pnpm lint
pnpm boundaries   # 分层依赖门禁
pnpm build
pnpm size         # 体积棘轮：先构建，再核对 .size-limit.json 里的 17 条产物限额
```

首次跑浏览器态测试前需 `pnpm exec playwright install chromium`。

## 项目结构

```text
XiHan.UI/
├── ui/
│   ├── packages/                    # 对外发布的库包（14 个）
│   │   ├── core/                    #   结构原语与端口契约
│   │   ├── machine/                 #   FSM 运行时
│   │   ├── system/                  #   设计令牌与主题运行时
│   │   ├── behavior/                #   交互行为原语
│   │   ├── position/                #   浮层定位（自研）
│   │   ├── highlight/               #   代码着色（自研）
│   │   ├── ai/                      #   AI 协议内核
│   │   ├── markdown/                #   流式 Markdown 内核（自研）
│   │   ├── visual/                  #   WebGL2 视觉层
│   │   ├── headless/                #   69 个组件的无头实现
│   │   ├── styled/                  #   默认皮肤
│   │   ├── vue/                     #   Vue 适配器
│   │   ├── wc/                      #   Web Components 适配器
│   │   └── icons/                   #   首方图标集
│   ├── tooling/                     # 内部工具，不发布
│   │   ├── build/                   #   tsdown 统一配置
│   │   ├── eslint-config/           #   lint 配置与分层拓扑事实源
│   │   ├── stylelint-config/        #   样式检查配置
│   │   ├── tsconfig/                #   四层 tsconfig
│   │   ├── testing/                 #   一致性 / 无障碍 / 定位三套判据
│   │   └── scripts/                 #   清理与运维脚本
│   └── apps/
│       ├── playground-vue/          # Vue 适配器演示
│       └── playground-wc/           # Web Components 适配器演示
└── assets/                          # README 资源文件
```

## 依赖关系

```text
core (零依赖)
  ├── machine
  │     └── behavior
  ├── position     (端口在 core，实现在此)
  ├── highlight    (端口在 core，实现在此)
  ├── ai
  ├── markdown
  └── visual       (另依赖 behavior)
system (零依赖)
icons  (零依赖，纯数据)

headless  ── core / machine / behavior / system
styled    ── 零 JS 依赖，纯 CSS
vue · wc  ── core / machine / behavior / headless / position / highlight / system
```

`styled` 不得依赖任何 JS 包，`core` 与 `machine` 运行时零依赖 —— 这两条由 dependency-cruiser 单独立规则守着。

## 环境要求

| 依赖 | 版本 |
| --- | --- |
| Node.js | 24+ |
| pnpm | 11+ |
| 支持平台 | Windows / Linux / macOS |

## 现状与边界

已经能用的：69 个组件的内核与双适配器、默认皮肤、设计令牌与主题运行时、跨适配器一致性套件、真实 Chromium 里的无障碍扫描与浮层定位契约。

还没做的：

| 事项 | 现状 |
| --- | --- |
| 文档站 | 已有（<https://ui.docs.xihanfun.com>，源码在 `docs/`），但 API 表、状态图、键盘表、令牌浏览器等自动产出物仍未生成 |
| npm 发布 | 未发布，本地用 `pnpm pack` 验证 |
| 组件文案国际化 | 未落地，面向用户的字符串内置英文，可经 `translations` 逐条覆盖 |
| 令牌产物格式 | 仅 CSS / JSON / TS 三种 |
| AI 组件族 | 协议内核与渲染内核已落地，Thread / Composer / CodeBlock 三件可用，代码着色走端口（内置自研粗粒度词法器，可换 Shiki）；MarkdownStream、Reasoning / ToolCall 折叠、工具审批仍在做 |
| 企业业务组件 | 未开始 |

## 质量门禁

改动需通过六道门禁，CI 与本地同一套命令：

| 门禁 | 命令 | 管什么 |
| --- | --- | --- |
| 代码检查 | `pnpm lint` | oxlint + ESLint；样式检查还没进这条命令 |
| 类型检查 | `pnpm typecheck` | 逐包 `tsc --noEmit`，Vue 侧走 `vue-tsc` |
| 分层门禁 | `pnpm boundaries` | 依赖拓扑、循环依赖、解析失败的 import |
| 测试 | `pnpm test` | 单元测试与跨适配器一致性套件（jsdom） |
| 构建 | `pnpm build` | 全包打包与类型产物 |
| 体积棘轮 | `pnpm size` | 先构建，再核对 `.size-limit.json` 里的 17 条产物限额（gzip） |

浏览器态另起一路：`pnpm test:browser` 在真实 Chromium 里跑无障碍扫描与浮层定位契约 —— 对比度、目标尺寸、翻面与避让这些，jsdom 没有布局，一概演不出来。

## 相关项目

- [XiHan.Framework](https://github.com/XiHanFun/XiHan.Framework) - .NET 模块化开发框架
- [XiHan.BasicApp](https://github.com/XiHanFun/XiHan.BasicApp) - 基于 XiHan.Framework 与 Vue 3 的企业级中后台内核

## 贡献

欢迎提交 Issue 和 Pull Request。提交遵循 conventional commits 规范，改动需通过上述六道门禁。

## 诚挚致谢

排名不分先后。

| 项目 | 致谢 |
| --- | --- |
| [Zag.js](https://github.com/chakra-ui/zag) | 作为组件状态图与 ARIA 接线的规格参考 |
| [W3C APG](https://www.w3.org/WAI/ARIA/apg/) | 作为无障碍交互模式的规范依据 |
| [CommonMark](https://spec.commonmark.org/) | 作为 Markdown 语义与一致率判据的规范来源 |
| [axe-core](https://github.com/dequelabs/axe-core) | 作为无障碍自动化扫描的引擎 |
| 其他第三方依赖 | 作为项目功能丰富与拓展的基石 |

## 支持&赞助

如果此项目对你的开发有助益，也欢迎请作者一杯咖啡。

官方赞助页 https://docs.xihanfun.com/cosmos/sponsor

## 版权&授权

Copyright (c) 2021-Present XiHanFun and contributors.

本项目采用 MIT 授权，详见 [License](./LICENSE)

XiHan.UI Logo、XiHan.UI名称、界面视觉设计与原创视觉表达归作者所有，第三方依赖和第三方服务分别遵循其各自授权与服务条款。

项目仅供学习参考，作者不承担任何软件的使用风险。
