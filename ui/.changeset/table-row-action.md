---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

表格（Table）新增行主操作 `onAction`（事件名 `action`，Vue `@action`，React `onAction`）：指针主键点在数据行上时报 `{ value, column }`，`value` 是行 id、`column` 是点中那一格的列 id（纵向合并格算它的起点行）；焦点停在行上按 Enter 时 `column` 为 null。表格卡片据此可以下钻，或作为联动源。

点在行内的交互控件与表格自己的把手上、行拖动松手的那一次点击、禁用行、详情行、表头与脚注都不触发；选中、展开与 Space 的语义不变。新增类型 `TableActionDetails`。
