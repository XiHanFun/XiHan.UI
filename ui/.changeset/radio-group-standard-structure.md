---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

单选组改用标准结构：新增 `radioGroupStructure` 与 `RadioGroupStructureOptions`，铺标题、segmented 形态的滑块与 collection 的条目，每个条目带表单影子、圆圈、图标、文字与说明。Web Components 的 `<xh-radio-group>` 新增 `label` 属性，不写部件或只写 `root` 时生成整套节点，标题与条目文字可用 `slot="label"`、`slot="item:<值>"` 接管；Vue / React 不写默认插槽 / 不给 children 时照同一个结构函数铺，DOM 与原来一致。
