---
'@xihan-ui/core': minor
'@xihan-ui/web-components': patch
---

Web Components 的 `<xh-config>` 作用域跟着浮层走：对话框、抽屉、下拉面板等打开后内容搬进 Portal 落点，里面的元素照它们在原来 DOM 里的位置取配置，读到包着浮层的那一层 `<xh-config>` 的 `locale`、`size`、`translations`、`scrollRoot` 与 `portalContainer`，与 Vue / React 浮层沿组件树取配置一致；打开期间改这一层的配置，搬走的元素跟着更新。浮层里再放的 `<xh-config>` 承接外层的视觉环境，只改自己声明的轴；禁用的 `xh-fieldset` 压进组里开的浮层内容，legend 里开的不受。此前搬走的元素只剩全局配置：局部文案与尺寸在对话框里回到全局，浮层里的 `<xh-config>` 按系统偏好重算主题、盖掉外层的深色。

Core 的 Portal 视觉桥活着期间把实例壳登记为来源的逻辑子节点，新增 `logicalParentElement(node)`（走到实例壳时返回它的来源，其余节点返回 `parentElement`）与 `logicallyContains(ancestor, node)`（DOM 上包含，或经实例壳在逻辑上包含）。登记挂在 Document 上，页面上装了几份 core 时读到的是同一份。
