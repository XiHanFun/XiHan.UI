---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

复选框改用标准结构：新增 `checkboxStructure` 与 `CheckboxStructureOptions`，方框里一个勾选标记，给了 `name` 再带一份表单影子。Vue / React 的 `XhCheckbox` 照它渲方框里面这一段，渲出的 DOM 不变；Web Components 的 `<xh-checkbox>` 不写部件时生成一颗原生按钮当 `root` 连同里面的部件，只写 `root` 时生成在它里面，宿主直接子节点写 `slot="indicator"` 时搬进勾选标记。带文字时 label 包在方框外面，Web Components 仍要手写 label、root 与 text。
