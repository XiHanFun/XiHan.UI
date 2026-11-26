---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** Popover 与 Popconfirm 的焦点与退场开关：`initialFocus` 给一个选择器，展开后焦点落在 content 里匹配它的元素上（不匹配时照旧落到第一个可聚焦元素），`restoreFocus` 为 false 时收起不归还焦点（缺省 true）；退场动画播完、层与焦点域等资源全部释放后发出 `onExitComplete`（Vue / Web Components 为 `exit-complete` 事件），退场途中重开与卸载不发。Web Components 写作 `initial-focus`、`restore-focus`。
