---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

开关改用标准结构：新增 `switchStructure` 与 `SwitchStructureOptions`，按钮里一个滑块，给了 `name` 再带一份表单影子。Vue / React 的 `XhSwitch` 照它渲按钮里面这一段，渲出的 DOM 不变；Web Components 的 `<xh-switch>` 不写部件时生成一颗原生按钮当 `root` 连同里面的部件，只写 `root` 时生成在它里面。带文字时 label 包在按钮外面，Web Components 仍要手写 label、root 与 text。
