---
"@xihan-ui/styles": patch
---

**`virtualizer` 视口不再截住溢出滚动。** `[data-part='viewport']` 删除 `overscroll-behavior: contain`：它是页内结构容器，
真源 §6.6 只把 `contain` 给浮层、模态 body 与粘底视口，其余保持 `auto`——长列表滚到尽头时剩余的滚动量交给外层，
与 Table、Tree、Transfer 面板同一行为。滚动条照旧走 reset 层的原生细条，皮肤不再有任何滚动边界声明。
