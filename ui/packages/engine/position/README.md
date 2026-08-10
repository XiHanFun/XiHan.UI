# @xihan-ui/position

浮层定位引擎，`kernel` 里 `PositionEnginePort` 的默认实现。自研、零第三方，翻转 / 平移 / 尺寸约束 / 箭头定位都在里面。

**谁会装它**：一般不用直接装。要换一套定位算法时，照 `PositionEnginePort` 自己实现一份替换它。

## 用法

```ts
import { createPositionEngine } from '@xihan-ui/position'
```

## 装

```bash
pnpm add @xihan-ui/position
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `engine/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
