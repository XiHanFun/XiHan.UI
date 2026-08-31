![logo](../assets/logo.png)

[English](README.md)

# XiHan.UI

框架无关的组件库：状态机与无障碍逻辑沉在无头内核，各框架只写一层薄适配器。

122 个组件，每个都有 headless 内核、Vue 组件、自定义元素与默认皮肤。

> 18 个公开包锁步发版，全部发布在 npm，文档站在 https://ui.docs.xihanfun.com。无障碍扫描跑在真实 Chromium 上，存量违规登记表只剩两条（共用表里 tag 的禁用态对比度、WC 侧 steps 的必需子节点），另有一条 breadcrumb 的步骤重放豁免。

## 包一览

| 包 | 职责 |
| --- | --- |
| `@xihan-ui/kernel` | 结构原语：anatomy、`mergeProps`、`normalizeProps`、Scope、context、id |
| `@xihan-ui/machine` | 状态机运行时：`createMachine`、解释器契约、受控值绑定 |
| `@xihan-ui/behavior` | 行为原语：dismissable layer、焦点域、滚动锁、进出场、集合、typeahead |
| `@xihan-ui/motion` | 动效原语：缓动单一真源、纯补间、帧循环、减弱动效偏好、解析解弹簧、Web Animations 薄封装 |
| `@xihan-ui/pointer` | 指针会话：一根指针从按下到抬起的跟手、过滤与收尾，自研，零依赖 |
| `@xihan-ui/headless` | 122 个组件的 anatomy + machine + `connect`，无样式、无框架 |
| `@xihan-ui/vue` | Vue 3 适配器 |
| `@xihan-ui/web-components` | Web Components 适配器（自研响应式基类，无第三方运行时依赖） |
| `@xihan-ui/styles` | 默认皮肤，按 `@layer` 分层的 CSS |
| `@xihan-ui/tokens` | 设计令牌（源自 DTCG）与主题运行时（明暗 / 品牌 / 密度 / 对比度 / 书写方向） |
| `@xihan-ui/position` | 浮层定位，自研实现，无第三方运行时依赖 |
| `@xihan-ui/chat-stream` | AI 协议内核：SSE 读取 → 协议归一 → parts 归约 → 会话 store（零 DOM、零框架） |
| `@xihan-ui/code-highlight` | 代码着色，自研粗粒度词法器，无第三方运行时依赖 |
| `@xihan-ui/markdown` | 流式 Markdown 渲染内核：增量切块 + 稳定 key + 消毒（CommonMark 子集，一致率 489/652） |
| `@xihan-ui/backgrounds` | 背景层：WebGL2 效果与数据驱动的粒子云，框架无关 |
| `@xihan-ui/sound` | 声音层：纯 Web Audio 程序化 UI 音效，零音频文件，框架无关 |
| `@xihan-ui/animations` | 动画层：可序列化的动效配方、内置进场与注意动效、错开起播、文字拆分 |
| `@xihan-ui/icons` | 首方图标集：`IconRecord` 结构化记录，渲染端逐节点建元素，运行期不解析 SVG 字符串 |

`tooling/*` 放构建、lint、tsconfig、测试与脚本等内部包，不对外发布。

## 目录结构

```
ui/
├── packages/     # 对外发布的库包
└── tooling/      # 内部构建与质量工具
```

## 本地开发

要求 Node ≥ 24、pnpm ≥ 11。

```bash
pnpm install --frozen-lockfile
pnpm test         # 单元测试与跨适配器一致性测试（jsdom）
pnpm test:browser # 真实 Chromium 里的无障碍扫描与浮层定位契约（需先 pnpm exec playwright install chromium）
pnpm typecheck
pnpm lint
pnpm boundaries   # 分层依赖门禁（dependency-cruiser）
pnpm build
pnpm size         # 体积棘轮：先构建，再核对 .size-limit.json 里的 28 条产物限额
```

## 约定

- 内部运行时依赖一律 `workspace:^`（开发期依赖用 `workspace:*`）；第三方版本只从 workspace catalog 取。
- `packages/engine/motion` 运行时零依赖；`kernel` 只依赖 `motion`，`machine` 只依赖 `kernel`。
- 分层顺序由 dependency-cruiser 强制，不靠自觉。
- 提交遵循 conventional commits；发布走 changesets，所有库包同属一个 fixed 版本组。
