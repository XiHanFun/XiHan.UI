---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** Popover、Popconfirm、HoverCard、Tooltip 的定位微调：`flip` 为 false 时守着 `placement` 那一侧不再自动翻面，`boundary` 给一块碰撞边界（元素或带 `getBoundingClientRect()` 的对象），两项原样交给定位引擎。Popover 的 `anchor` 增收虚拟锚点（带 `getBoundingClientRect()` 的对象，如指针落点、文本选区），浮层按它给的矩形落位，收起时焦点归还给触发器。Web Components 的 `boundary` 与 `anchor` 只走 property，`flip` 是属性。
