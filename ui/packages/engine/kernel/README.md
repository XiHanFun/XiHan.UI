# @xihan-ui/kernel

整个运行时的底座：解剖模型（`data-scope` / `data-part`）、属性归一、作用域与 id 生成、诊断通道、框架元数据（`XIHAN_UI_METADATA`，名称/版本/版权与运行时信息的单一事实源，与 XiHan.Framework 的 `XiHanMetadata` 同构），以及四个端口的类型契约（定位、着色、虚拟滚动、图标）。零运行时依赖，不认识任何框架。

**谁会装它**：一般不用直接装——装了适配器就有它。自己写适配器或自研端口实现时才会直接引。

## 用法

```ts
import type { PositionEnginePort } from '@xihan-ui/kernel'
import { createAnatomy, createScope } from '@xihan-ui/kernel'
```

## 装

```bash
pnpm add @xihan-ui/kernel
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `engine/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
