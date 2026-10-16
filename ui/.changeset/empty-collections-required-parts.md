---
'@xihan-ui/headless': patch
'@xihan-ui/web-components': patch
---

可以为空的集合不再把条目列为必需部件，空着时 Web Components 不再在开发期报 `wc.missing-part`：

- 排序（Sortable）：空列表是正当状态，同组的空列表照常接收拖入。
- 标签组（TagGroup）：标签可以全部移除，移除最后一枚后焦点交给列表。原先还把不在自身解剖里的 `item` 列为必需。
- 复选组（CheckboxGroup）、单选组（RadioGroup）、切换组（ToggleGroup）：选项可以由 `collection` 异步给出，取回之前与级联清空之后都是空的。

菜单、分页、步骤条这类空着即不可用的组件，条目照旧是必需部件。
