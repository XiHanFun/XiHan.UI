---
'@xihan-ui/tokens': patch
---

材质里引用描边、分隔的同源通道（frosted / solid / elevated 的分隔线、solid 描边等）在 `data-contrast` 边界上重新声明：嵌套写在局部区域上的高对比档里，浮层分隔线与内容面描边按高对比档取值，与写在主题边界上的结果一致。
