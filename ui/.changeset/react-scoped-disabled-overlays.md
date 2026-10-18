---
'@xihan-ui/react': patch
---

React 的 Tooltip、Popover、Menu 与 DownloadTrigger 放进禁用的 Fieldset（或经 `XhConfigProvider` 给了 `disabled`）时一并禁用，与 Vue、Web Components 一致；Tooltip 的浮层也跟随 `XhConfigProvider` 给的全局 `size`。此前作者没在这几个组件上写 `disabled` 时，作用域禁用压不进来；Tooltip 没有接全局配置，全局尺寸到不了它的浮层。
