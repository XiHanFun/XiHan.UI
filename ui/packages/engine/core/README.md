# @xihan-ui/core

整个运行时的底座，三段合在一个包里：

- **结构原语**：解剖模型（`data-scope` / `data-part`）、属性归一、作用域与 id 生成、诊断通道、框架元数据（`XIHAN_UI_METADATA`，名称/版本/版权与运行时信息的单一事实源，与 XiHan.Framework 的 `XiHanMetadata` 同构），以及四个端口的类型契约（定位、着色、虚拟滚动、图标）。
- **状态机**：声明式的状态 / 事件 / 动作 / 守卫，外加一层响应式适配口——同一份机器在 Vue 的响应式与原生信号上跑出同样的行为。
- **交互行为**：焦点域、消解层、滚动锁、滚动位置观察、出入场存在性、粘底。

**谁会装它**：一般不用直接装——装了适配器就有它。自己写适配器、自研端口实现或在自研组件里复用焦点陷阱与消解层时才会直接引。

## 用法

```ts
import type { PositionEnginePort } from '@xihan-ui/core'
import { createAnatomy, createDismissLayer, createFocusScope, createMachine, createScope } from '@xihan-ui/core'
```

子入口：`@xihan-ui/core/metadata`（锁步版本检查与框架元数据）、`@xihan-ui/core/skin-check`（皮肤缺失诊断）、`@xihan-ui/core/vite`（终端启动横幅，只跑在 Node 侧）、`@xihan-ui/core/vanilla`（原生信号响应式运行时）、`@xihan-ui/core/presence`（出入场存在性）。

## 装

```bash
pnpm add @xihan-ui/core
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `engine/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
