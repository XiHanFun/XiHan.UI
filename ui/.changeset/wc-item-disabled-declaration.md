---
'@xihan-ui/web-components': patch
---

条目的禁用随作者的修改来回切换。此前元素把自己每帧写回条目的 `aria-disabled` 当作作者声明读回去：条目用原生 `disabled` 禁用过一次，之后再去掉，条目上留着的 `aria-disabled="true"` 让它一直解不开；整组禁用再解禁时也只能靠快照还原。现在回读时跳过元素自己写回的值，只认作者在条目上写的 `disabled` 或 `aria-disabled`，增删、改写都即时生效。

涉及 Toolbar、ToggleGroup、RadioGroup、CheckboxGroup、Listbox、TagGroup、GridList、ColorSwatchPicker、Combobox、Command、Mention、Menu、ContextMenu、Select 的条目，以及 Tabs 的 trigger 与 close-trigger。
