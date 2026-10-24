---
'@xihan-ui/headless': minor
---

**新增** `virtualWindowStructure` 与 `forwardCollectionVirtualizer`：前者只铺 Virtualizer 自己那一段（视口 > 内容层 > 条目外壳），放进宿主已有的容器里用，表格的表体就是这样包住窗口里那几行；后者是一条不变的转交桥，只在被读、被调时才去取 Virtualizer 交出的真桥，宿主求自己的 props 时不必碰 Virtualizer 的 api，条数要经宿主自己的数据算时不会绕回自己。Vue、React 与 Web Components 里标准结构的虚拟化部件也抽成了共享的一块，选择器与表格共用，开了 `virtual` 才加载。
