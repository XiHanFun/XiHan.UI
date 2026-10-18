---
'@xihan-ui/web-components': patch
'@xihan-ui/styles': patch
---

按钮组（ButtonGroup）里放菜单组成分体按钮（主按钮加一枚下拉触发器）时，下拉钮与主按钮连成一条。

- Web Components：组的 `variant` / `tone` / `size` 原来只写给直接放在组里的 `<xh-button>`，放在 `<xh-menu>` 里的触发器拿不到，下拉钮保持单独一枚按钮的缺省形态。现在段是包着触发器的宿主时，写到它直接带的触发器 `<xh-button>` 上；菜单自己的 `tone` / `size` 管的是弹出内容，不动它。Vue / React 本来就经组的上下文下发，行为不变。
- 皮肤：outline 形态下组内按钮不再各画描边、组内按下不缩放这两条，覆盖到放在菜单触发器里的按钮，主题调了按压缩放时接缝不会被撕开。
- 文档：按钮组新增「分体按钮」示例。
