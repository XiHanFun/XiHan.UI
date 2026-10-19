---
"@xihan-ui/designer-kit": minor
"@xihan-ui/designer-shell": minor
---

**新增** 内建编辑方式 `treeOptions`：选项树，供树选择、级联这类组件的选项用。

- designer-kit：每项是 `{ value, label?, disabled?, tone?, description?, children?, hasChildren? }`，按 `findOptionViolation` 严格检查。`value` 只收字符串，同一层里不重复；`requireLabel`、`allowDisabled` 与 `options` 同义；`children` 不是数组、`hasChildren` 不是布尔报 `invalid-type`，超过 32 层报 `invalid-value`。问题落在那一层那一项的那个键上，路径如 `[0, "children", 2, "value"]`。
- designer-shell：编辑器是 `<xh-table>` 的树形表，单元格级导航，四格依次是值、文字、禁用与操作，各行报层级。方向键在格子之间走，Enter / F2 进格内编辑，Esc 回到格子；Alt + 上下键同层换序，Alt + 左右键改一层缩进（各项还是平铺时也行），也可以拖动行，拖到哪一项的中段就放进那一项下面，写回整棵树。操作列里有「加子项」与「删除」，钉在行尾；表格下面是「新增一项」。文案新增 `optionTreeCell`、`optionActions`、`optionAddChild`、`optionRemove`、`optionAdd`，十种语言都有。
