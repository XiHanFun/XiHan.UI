---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': minor
---

新增 `--xh-list-option-h-sm` / `-md` / `-lg`（32 / 36 / 40px，紧凑 28 / 32 / 36px）。锚定浮层里的集合行（Select、Combobox、Cascader、Menu、ContextMenu、Menubar 菜单、Mention、Command）一行文字时定高到这一档，比同档字段高一级；带说明的行照常撑高。页内列表、树、TreeSelect 与日期时间面板的时间格不变。行高可经各组件的 `--xh-<组件>-item-h` 覆盖；集合家族新增桥接槽 `--xh-collection-row-h`，皮肤接上它即得定高行。
