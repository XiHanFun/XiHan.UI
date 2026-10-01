---
'@xihan-ui/headless': minor
---

Table 列的 `minWidth` / `maxWidth` 同时管布局：连接层把它们写成列头格与数据格的内联 `min-inline-size` / `max-inline-size`，伸缩分剩余空间时不越过这两条（此前只约束拖动改宽）。`width` 仍是伸缩的基准，三者写成同一个数就是一列定宽；分组表头与横向合并格的上下限按跨过的各列相加。没写上下限的列不变。
