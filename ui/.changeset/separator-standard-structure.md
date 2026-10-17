---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

分隔线改用标准结构：新增 `separatorStructure` 与 `SeparatorStructureOptions`，给了分节文字时排成线、文字、线三段，没给时 `root` 自己就是那条线。Vue / React 的 `XhSeparator` 照它渲，DOM 不变；Web Components 的 `<xh-separator>` 不写部件或只写 `root` 时按它生成，宿主直接子节点写 `slot="content"` 即生成三段并把该节点搬进中间。
