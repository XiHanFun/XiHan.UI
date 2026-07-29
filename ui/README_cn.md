![logo](../assets/logo.png)

[English](README.md)

# XiHan.UI

框架无关的组件库：状态机与无障碍逻辑沉在无头内核，各框架只写一层薄适配器。

65 个组件，每个都有 headless 内核、Vue 组件、自定义元素与默认皮肤。

> **实验阶段**：尚未发布到 npm，尚无文档站；无障碍扫描已跑在真实 Chromium 上，但首轮扫出的存量问题尚未修完。请勿在生产环境依赖。

## 包一览

| 包 | 职责 |
| --- | --- |
| `@xihan-ui/core` | 结构原语：anatomy、`mergeProps`、`normalizeProps`、Scope、context、id |
| `@xihan-ui/machine` | 状态机运行时：`createMachine`、解释器契约、受控值绑定 |
| `@xihan-ui/behavior` | 行为原语：dismissable layer、焦点域、滚动锁、进出场、集合、typeahead |
| `@xihan-ui/headless` | 65 个组件的 anatomy + machine + `connect`，无样式、无框架 |
| `@xihan-ui/vue` | Vue 3 适配器 |
| `@xihan-ui/wc` | Web Components 适配器（基于 `@lit/reactive-element`） |
| `@xihan-ui/styled` | 默认皮肤，按 `@layer` 分层的 CSS |
| `@xihan-ui/system` | 设计令牌（源自 DTCG）与主题运行时（明暗 / 密度 / 书写方向） |
| `@xihan-ui/position-floating-ui` | 浮层定位，唯一允许依赖 `@floating-ui/dom` 的包 |
| `@xihan-ui/ai` | AI 协议内核：SSE 传输、Data Stream v1 归一、parts 归约、会话容器 |
| `@xihan-ui/icons` | 图标集 |

`tooling/*` 放构建、lint、tsconfig、测试与脚本等内部包，不对外发布。

## 目录结构

```
ui/
├── packages/     # 对外发布的库包
├── tooling/      # 内部构建与质量工具
└── apps/
    ├── playground-vue   # Vue 适配器演示
    └── playground-wc    # Web Components 适配器演示
```

两个 playground 覆盖同一批组件，便于逐帧对照两套适配器的行为。

## 本地开发

要求 Node ≥ 24、pnpm ≥ 11。

```bash
pnpm install --frozen-lockfile
pnpm dev          # 启动 playground
pnpm test         # 单元测试与跨适配器一致性测试（jsdom）
pnpm test:browser # 真实 Chromium 里的无障碍扫描（需先 pnpm exec playwright install chromium）
pnpm typecheck
pnpm lint
pnpm boundaries   # 分层依赖门禁（dependency-cruiser）
pnpm build
pnpm size         # 体积棘轮
```

## 约定

- 内部依赖一律 `workspace:*`；第三方版本只从 workspace catalog 取。
- `packages/core` 与 `packages/machine` 运行时零依赖。
- 分层顺序由 dependency-cruiser 强制，不靠自觉。
- 提交遵循 conventional commits；发布走 changesets，所有库包同属一个 fixed 版本组。
