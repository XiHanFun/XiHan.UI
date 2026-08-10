# @xihan-ui/machine

薄状态机运行时。声明式的状态 / 事件 / 动作 / 守卫，外加一层响应式适配口——同一份机器在 Vue 的响应式与原生信号上跑出同样的行为。

**谁会装它**：一般不用直接装。自己写新组件的状态机时才会直接引。

## 用法

```ts
import { createMachine } from '@xihan-ui/machine'
```

## 装

```bash
pnpm add @xihan-ui/machine
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `engine/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
