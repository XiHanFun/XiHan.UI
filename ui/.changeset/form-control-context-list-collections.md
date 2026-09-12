---
'@xihan-ui/react': patch
'@xihan-ui/vue': patch
'@xihan-ui/web-components': patch
---

让 Listbox 与 TagGroup 接入统一 FormControlContext 状态继承。

Listbox 消费既有 disabled/readOnly/invalid 三轴，TagGroup 消费 disabled/readOnly 两轴；实例显式
`false` 继续优先于最近 Field 与 Form，Web Components 的条目禁用快照使用解析后的有效状态。
