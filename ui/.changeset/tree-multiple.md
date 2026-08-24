---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

树补 `multiple` 布尔，`selectionMode` 转为它的旧写法。

`TreeSelectionMode` 只有 `single | multiple` 两个取值，与一个布尔完全等价；而同族的
`tree-select` 与另外六家（accordion / cascader / combobox / listbox / select / toggle-group）
表达同一件事时用的都是 `multiple?: boolean`。同一个概念，树上要写
`selection-mode="multiple"`、下拉树上要写 `multiple`——记不住是必然的。

树现在也收 `multiple`（Vue 的 prop、自定义元素的 `multiple` 属性、api 上的 `multiple` 布尔）。
`selectionMode` 保留一个大版本，标为 deprecated；**两者同时给时以 `selectionMode` 为准**，
与 listbox 的规矩一致——所以已经在用 `selectionMode` 的代码行为一点不变，不必赶着改。

`listbox` 的 `selectionMode` 不动：它有 `single | multiple | extended` 三个取值，
不是布尔能表达的。`calendar` / `date-picker` 的同名 prop 同理。
