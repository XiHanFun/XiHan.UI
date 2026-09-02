# @xihan-ui/styles

默认皮肤：133 份纯 CSS，零 JS。只按 `[data-scope][data-part]` 与 `data-*` 选中，不匹配标签名也不匹配 class——所以整套换掉它不影响任何行为。

**谁会装它**：不想自己写样式的人装它。要做自己的设计语言，就不装，照解剖文档写一套自己的。

## 用法

```ts
/* 全量 */
import '@xihan-ui/styles'

/* 或按需：令牌与层序先行，tone 决定语气轴，缺了它 tone 会静默回落品牌色 */
import '@xihan-ui/styles/layers.css'
import '@xihan-ui/styles/tone.css'
import '@xihan-ui/styles/button.css'
```

## 装

```bash
pnpm add @xihan-ui/styles
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `design/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
