---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

标准结构新增出口节点 `StructureOutletNode`（`{ key, outlet: true, slot }`，配 `isStructureOutlet`）：作者给的内容原样放在这个位置，外面不包部件节点。Web Components 把宿主直接子节点里写了对应 `slot` 的那个节点本身挪到出口处，已在位时不再挪动、焦点不丢；Vue / React 在出口处渲作者内容。供作者内容本身就是完整一块（如放进字段的库内控件）的组件结构使用。
