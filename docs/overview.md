# 架构总览

XiHan.UI 是一个 pnpm + turbo 的 monorepo。它的组织方式只服务于一件事：**让「组件的行为」独立于「渲染它的框架」存在**。

## 一个组件的四份产物

以对话框为例，`dialog` 这个组件在仓库里落成四处：

| 产物 | 位置 | 内容 |
| --- | --- | --- |
| 无头内核 | `packages/engine/headless/src/dialog/` | 解剖、状态机、键盘规格表、`connect` |
| Vue 组件 | `packages/adapters/vue/src/components/dialog/` | `XhDialogRoot` 等一组 `defineComponent` |
| 自定义元素 | `packages/adapters/web-components/src/elements/dialog.ts` | `<xh-dialog>`，Light-DOM 行为宿主 |
| 皮肤 | `packages/design/styles/css/dialog.css` | 纯 CSS，按 `data-*` 选中 |

四份里只有第一份包含逻辑。后三份分别回答「怎么把属性挂到 Vue 的 vnode 上」「怎么把属性挂到作者手写的 DOM 上」「这些属性长什么样」。

## 分层与依赖矩阵

层级越低越基础，只能向下依赖。这套拓扑写在 `tooling/eslint-config/src/layers.json` 里，由 dependency-cruiser 在 `pnpm boundaries` 时强制，不靠自觉。

| 层 | 包 | 可依赖 |
| --- | --- | --- |
| 1 | `kernel` | `motion` |
| 1 | `machine` | `kernel` |
| 1 | `motion` | — |
| 1 | `tokens` | — |
| 1 | `icons` | — |
| 1 | `pointer` | — |
| 2 | `behavior` | `kernel` `machine` `motion` |
| 2 | `position` | `kernel` |
| 2 | `code-highlight` | `kernel` |
| 2 | `chat-stream` | `kernel` |
| 2 | `markdown` | `kernel` |
| 2 | `sound` | `kernel` |
| 2 | `animations` | `kernel` `motion` |
| 3 | `headless` | `kernel` `machine` `behavior` `tokens` `motion` `pointer` |
| 3 | `styles` | —（纯 CSS，不得依赖任何 JS 包） |
| 3 | `backgrounds` | `kernel` `behavior` `motion` |
| 4 | `vue` | `kernel` `machine` `behavior` `headless` `position` `code-highlight` `tokens` `backgrounds` `sound` `motion` `pointer` |
| 4 | `web-components` | `kernel` `machine` `behavior` `headless` `position` `code-highlight` `tokens` `backgrounds` `motion` `pointer` |

除分层外还有三条硬规则，同样由门禁执行：

- **库包的运行时代码不得引第三方。** 唯一登记在案的例外是 `@internationalized/date`，只有 `headless` 的日期族在用。
- **`styles` 是纯 CSS。** 它不依赖任何 JS 包，因此可以脱离整个 JS 层单独使用。
- **依赖版本只从 workspace catalog 取。** 包内一律写 `catalog:` 或 `workspace:` 协议引用，不得内联版本号。

## 一次交互经过哪些层

以「点击对话框的触发器」为例：

```
用户点击
   │
   ▼
适配器把 DOM 事件交给 connect 产出的 onClick        （vue / web-components）
   │
   ▼
service.send({ type: 'TRIGGER.CLICK' })            （machine）
   │
   ▼
状态机转移 closed → open，执行 entry 动作           （machine）
   │
   ├─► 行为原语接管：锁滚动、建焦点域、压入层栈      （behavior）
   ├─► 浮层族还会请定位引擎算坐标                    （position）
   │
   ▼
适配器重新读 connect，把新的 aria-* / data-* 铺到部件上
   │
   ▼
皮肤按 [data-state='open'] 命中新规则，动画播放      （styles）
```

关键在于中间那三步与框架无关。Vue 适配器和 Web Components 适配器各自只负责最外两步。

## 包一览

按职责分四组。详细依赖关系见[包与依赖关系](./npm-package-dependency)。

**内核与原语**

| 包 | 职责 |
| --- | --- |
| `@xihan-ui/kernel` | 结构原语：解剖、`mergeProps`、`normalizeProps`、Scope、层栈、诊断通道 |
| `@xihan-ui/machine` | 薄状态机运行时：`createMachine`、解释器契约、受控值绑定 |
| `@xihan-ui/behavior` | 交互行为原语：消隐层、焦点域、滚动锁、进出场、集合导航、typeahead |
| `@xihan-ui/motion` | 动效原语：缓动单一真源、纯补间、帧循环、减弱动效偏好、解析解弹簧 |
| `@xihan-ui/position` | 浮层定位引擎，自研，零第三方依赖 |
| `@xihan-ui/pointer` | 指针会话：一根指针从按下到抬起的跟手、过滤与收尾，自研，零依赖 |

**组件与适配器**

| 包 | 职责 |
| --- | --- |
| `@xihan-ui/headless` | 121 个组件的解剖 + 状态机 + `connect`，无样式、无框架 |
| `@xihan-ui/vue` | Vue 3 适配器 |
| `@xihan-ui/web-components` | Web Components 适配器，自研响应式基类 |

**表现**

| 包 | 职责 |
| --- | --- |
| `@xihan-ui/tokens` | 设计令牌（DTCG 源）与主题运行时（明暗 / 品牌 / 密度 / 对比度 / 书写方向） |
| `@xihan-ui/styles` | 默认皮肤，按 `@layer` 分层的纯 CSS |
| `@xihan-ui/icons` | 图标集 |

**内容与效果**

| 包 | 职责 |
| --- | --- |
| `@xihan-ui/chat-stream` | AI 协议内核：SSE 读取 → 协议归一 → parts 归约 → 会话 store |
| `@xihan-ui/markdown` | 流式 Markdown 渲染内核，增量切块 + 稳定 key |
| `@xihan-ui/code-highlight` | 代码着色，自研粗粒度词法器 |
| `@xihan-ui/backgrounds` | WebGL2 背景效果与数据驱动粒子点云 |
| `@xihan-ui/sound` | 纯 Web Audio 程序化 UI 音效，零音频文件 |
| `@xihan-ui/animations` | 现成的进场与注意动效、错开起播、文字拆分 |

`tooling/*` 下还有构建、lint、tsconfig、测试与门禁脚本等内部包，一律不发布。

## 目录结构

```
XiHan.UI/
├── ui/                      # 组件库工作区（pnpm workspace）
│   ├── packages/            # 对外发布的库包，按角色分四组
│   │   ├── adapters/        # vue · web-components——你选一个
│   │   ├── design/          # tokens · styles · icons——外观
│   │   ├── features/        # markdown · chat-stream · backgrounds · sound · animations——按需自选
│   │   └── engine/          # kernel · machine · motion · pointer · behavior · position · code-highlight · headless
│   └── tooling/             # 内部构建与质量工具
│       ├── build/           # 打包配置与 exports 回写
│       ├── eslint-config/   # lint 规则 + 分层拓扑事实源
│       ├── stylelint-config/
│       ├── testing/         # 一致性 / 无障碍 / 定位三套判据的运行时
│       └── scripts/         # 门禁脚本
└── docs/                    # 文档站（VitePress），按 link: 指回上面的库包
```

文档站每个组件页的示例渲染的是真实组件，且 Vue 与自定义元素两套写法并排，是对照两套适配器行为的主要手段；示例源文件在 `docs/.vitepress/demos/<组件>/` 下。

## 技术选型

| 位置 | 选型 |
| --- | --- |
| 语言 | TypeScript，ESM only（不提供 CJS） |
| 运行时要求（消费端） | Node ≥ 18；浏览器为 2024 年常青版（皮肤用了 `@layer`、`color-mix`、`oklch`） |
| 运行时要求（开发本仓） | Node ≥ 24、pnpm ≥ 11 |
| 构建 | tsdown（库包）+ turbo（任务编排） |
| 样式 | 原生 CSS，`@layer` 分层，`oklch` 色彩空间，无预处理器 |
| 测试 | vitest（jsdom）+ Playwright（真实 Chromium） |
| 发布 | changesets，全部库包同属一个 fixed 版本组 |

## 下一步

- [安装与接入](./installation)：先把它跑起来
- [快速上手](./quickstart)：三种用法各写一遍
- [解剖与部件契约](./guide/anatomy)：理解 `data-scope` / `data-part` 这套约定
