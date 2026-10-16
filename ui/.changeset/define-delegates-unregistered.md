---
'@xihan-ui/web-components': patch
---

按需注册（`defineXhElement`）只注册 `xh-select`、`xh-date-picker`、`xh-side-nav`、`xh-scroll-area` 这类元素时，开发期不再报「partContract.delegates 登记的 … 不是已注册元素的解剖名」。这些元素把内嵌组件（标签、日期输入与日历、提示、滚动条）的状态机放在自己身上跑、部件由自己接线，从不实例化对应的 `xh-tag`、`xh-calendar-picker` 等元素，所以不必另外注册它们；委派部件接线后的 data-scope 核对照旧。
