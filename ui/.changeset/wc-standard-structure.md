---
'@xihan-ui/web-components': minor
---

有标准结构的元素可以不写结构：宿主里没有作者写的部件时连 root 一起生成，只写了 root 时生成在它里面；作者写了别的部件就照旧全归作者。排在 root 末尾或经 Portal 的少数部件可以单独接管，作者写的这些部件按缺省结构的先后排到末尾。宿主直接子节点上写 `slot="<名>"` 或 `slot="<名>:<条目键>"` 的作者内容会搬进对应的部件。结构里组合了另一个库内组件的实例时，元素生成那个组件的元素，数据按 property 赋值、回调接成事件监听且不冒出外层宿主；这些组件经元素类的 `static dependencies` 随 `defineXhElement` 连带注册。热力图改用这套规则，现在不写 root 也能生成。`reconcile` 与 `generatedChildren` 新增可选的生成标记参数，只认、只摘这一套生成的节点。
