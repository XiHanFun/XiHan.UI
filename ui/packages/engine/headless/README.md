# @xihan-ui/headless

102 个组件的无视觉实现：解剖、状态机、`connect`（把状态翻成一组 DOM 属性）、键盘规格表。不产生任何 DOM，也不带一行样式。

**谁会装它**：一般不用直接装。给新框架写适配器时，这里是唯一的行为真源。

## 用法

```ts
import { connectDialog, dialogAnatomy, dialogMachine } from '@xihan-ui/headless'
```

## 装

```bash
pnpm add @xihan-ui/headless
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `engine/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
