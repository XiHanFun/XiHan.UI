# @xihan-ui/behavior

与框架无关的交互行为：焦点域、消解层、滚动锁、滚动位置观察、出入场存在性、粘底。组件的「交互」那一半从这里来。

**谁会装它**：一般不用直接装。要在自研组件里复用焦点陷阱或消解层时才会直接引。

## 用法

```ts
import { createDismissableLayer, createFocusScope } from '@xihan-ui/behavior'
```

## 装

```bash
pnpm add @xihan-ui/behavior
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `engine/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
