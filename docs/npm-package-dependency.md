# 包与依赖关系

XiHan.UI 是一个 pnpm workspace。`packages/*` 是对外发布的库包，`tooling/*` 是内部工具（永不发布），`apps/*` 是两个 playground。

## 全部库包

| 包 | 版本 | 依赖 | peer 依赖 | 层 |
| --- | --- | --- | --- | --- |
| `@xihan-ui/kernel` | `0.0.0` | — | — | 1 |
| `@xihan-ui/machine` | `0.0.0` | `core` | — | 1 |
| `@xihan-ui/tokens` | `0.0.0` | — | — | 1 |
| `@xihan-ui/icons` | `0.9.8` | — | — | 1 |
| `@xihan-ui/behavior` | `0.0.0` | `core` | — | 2 |
| `@xihan-ui/position` | `0.0.0` | `core` | — | 2 |
| `@xihan-ui/code-highlight` | `0.0.0` | `core` | — | 2 |
| `@xihan-ui/chat-stream` | `0.0.0` | `core` | — | 2 |
| `@xihan-ui/markdown` | `0.0.0` | — | — | 2 |
| `@xihan-ui/headless` | `0.0.0` | `core` `machine` `behavior` + `@internationalized/date` | — | 3 |
| `@xihan-ui/styles` | `0.0.0` | `system`（只取其 CSS 产物） | — | 3 |
| `@xihan-ui/backgrounds` | `0.0.0` | `core` `behavior` | — | 3 |
| `@xihan-ui/vue` | `0.0.0` | `core` `machine` `behavior` `headless` `position` `highlight` | `vue`、`visual`（可选） | 4 |
| `@xihan-ui/web-components` | `0.0.0` | `core` `machine` `behavior` `headless` `position` `highlight` | `visual`（可选） | 4 |

::: warning 版本状态
除 `@xihan-ui/icons` 外全部是 `0.0.0`——**尚未发布到 npm**。`icons` 是一个冻结的遗留包：不进构建图、不发布，源码里还引着已经删掉的依赖，在它重建之前不要使用。

发布走 changesets，所有库包同属一个 fixed 版本组，届时会一起升到同一个版本号。
:::

## 依赖图

箭头方向 = 依赖方向，只画实际声明的依赖。同层之间除 `machine → core` 外无横向依赖。

```
层 4   ┌─────────────┐          ┌─────────────┐
       │     vue     │          │     wc      │   peer: visual（可选）；vue 另有 peer: vue
       └──────┬──────┘          └──────┬──────┘
              │  core · machine · behavior · headless · position · highlight
              └────────────┬───────────┘
                           ▼
层 3   ┌──────────────┐  ┌──────────┐        ┌────────────────┐
       │   headless   │  │  visual  │        │ styled（纯CSS）│
       └──────┬───────┘  └────┬─────┘        └───────┬────────┘
   core·machine·behavior   core·behavior         system 的 CSS 产物
        + @internationalized/date
              │               │
              ▼               ▼
层 2   ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────┐ ┌──────────┐
       │ behavior │ │ position │ │ highlight │ │  ai  │ │ markdown │
       └────┬─────┘ └────┬─────┘ └─────┬─────┘ └──┬───┘ └──────────┘
            └────────────┴─────────────┴──────────┘         无依赖
                           ▼
层 1   ┌──────────┐  ┌──────────┐   ┌──────────┐  ┌───────┐
       │   core   │◄─┤ machine  │   │  system  │  │ icons │
       └──────────┘  └──────────┘   └──────────┘  └───────┘
        零运行时依赖   零运行时依赖      无依赖        冻结
```

三个包完全独立、可以单独用：

- **`@xihan-ui/tokens`**——只要设计令牌与主题运行时，不要组件；
- **`@xihan-ui/markdown`**——只要流式 Markdown 渲染内核；
- **`@xihan-ui/styles`**——纯 CSS，它对 `system` 的依赖只是为了 `@import` 令牌产物，不引入任何 JS。

## 依赖规则

分层拓扑写在 `tooling/eslint-config/src/layers.json` 里，由 dependency-cruiser 在 `pnpm boundaries` 时强制。层级越低越基础，只能依赖 `canDependOn` 列出的包。

除分层外还有四条规则：

| 规则 | 内容 |
| --- | --- |
| `no-circular` | 禁止循环依赖 |
| `no-unresolvable` | 解析不出来的 import——最常见的成因正是「伸手够了邻层却没在 `package.json` 里声明依赖」 |
| `styled-no-js-deps` | `styled` 是纯 CSS，不得依赖任何 JS 包 |
| `no-external-in-packages` | 库包的运行时代码不得引第三方 |

`icons` 因为是冻结的遗留包，暂时豁免 `no-unresolvable`。

## 第三方运行时依赖

**全库只有一个**：`@internationalized/date`，只在 `@xihan-ui/headless` 的日期族里用（零框架的纯数据包，无副作用）。

以下东西都是自研的，不引第三方：

| 能力 | 包 | 常见的第三方选择 |
| --- | --- | --- |
| 浮层定位 | `position` | Floating UI |
| 代码着色 | `highlight` | Shiki / Prism |
| Web Components 响应式基类 | `wc` | Lit |
| Markdown 渲染 | `markdown` | markdown-it / marked |
| 状态机 | `machine` | XState |

要新增第三方运行时依赖，必须逐条登记进白名单并写明理由与摘除条件，`check-runtime-deps` 门禁盯着这件事。

::: tip 开发期第三方是另一回事
`@lit/reactive-element` 与 `commonmark-spec` 出现在 workspace catalog 里，但它们只供测试对拍——前者用于差分校验自研响应式基类，后者用于读 CommonMark 官方用例。两者都不进任何包的运行时依赖。
:::

## 版本约定

- 内部依赖一律 `workspace:*`；
- 第三方版本只从 workspace catalog 取，包内写 `catalog:`，**不得内联版本号**（`check-exact-pins` 门禁）；
- 升级只改 `pnpm-workspace.yaml` 的 catalog 一处。

## 产物契约

| 项 | 值 |
| --- | --- |
| 模块格式 | ESM only，不提供 CJS |
| Node | `>= 24` |
| 类型 | 每个入口一份 `.d.ts` |
| 副作用 | 全部 `sideEffects: false`，`styled` 与 `system/tokens.css` 除外 |

`pnpm gate:publish` 逐包跑 publint 与 attw，按 ESM-only 的支持面校验 exports 条件与类型解析（`node16-from-ESM` 与 `bundler` 两列）。

## 子路径导出

大多数包只有主入口。有子路径的：

| 包 | 子路径 |
| --- | --- |
| `@xihan-ui/tokens` | `./runtime` `./tokens.css` `./tokens.json` |
| `@xihan-ui/machine` | `./vanilla` |
| `@xihan-ui/behavior` | `./presence` |
| `@xihan-ui/vue` | `./visual` |
| `@xihan-ui/web-components` | `./define` `./visual` `./custom-elements.json` |
| `@xihan-ui/styles` | 每个组件一份 CSS，共 74 条 |

组件**没有**单独的子路径导出——按需引入靠 tree-shaking，不靠手写路径。

## 相关

- [架构总览](./overview#分层与依赖矩阵)
- [安装与接入](./installation)
- [测试与质量门禁](./guide/testing#结构门禁)
