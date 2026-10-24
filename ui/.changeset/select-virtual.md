---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

**新增** 选择器标准结构的虚拟化开关 `virtual`：不写结构（Vue 不写默认插槽、React 不给 children、Web Components 只写 `root`）时加上 `virtual`，浮层里只铺滚到的那一屏条目，一万条选项也只渲十几个节点；方向键、Home / End 与按字跳转仍跨完整 `collection`。条目按 `estimateSize`（缺省 36，Web Components 为 `estimate-size`）起算，渲出后按实测校正，带副文本的两行条目也对得齐。虚拟化那一块按需加载：没开 `virtual` 的选择器不为 Virtualizer 的内核付体积（Vite 构建实测首包与不支持虚拟化时持平，开了才多拉约 7 kB 的异步块）；它还在路上时就展开了，到了之后焦点照样补进列表。手写结构时照旧自己套 Virtualizer，`virtual` 只管标准结构。

headless 新增 `virtualListStructure`、`VIRTUAL_STRUCTURE_DELEGATE` 与 `StructureVirtualItem`、`VirtualStructurePart` 类型：集合组件的标准结构据此把列表包进 Virtualizer 的视口与内容层，三个委派部件的作者名为 `virtual-viewport` / `virtual-content` / `virtual-item`。选择器状态机接到晚到的 `virtualizer` 而浮层已经开着时，按完整 `collection` 补挑锚点、由桥交出焦点，不该有锚点时把焦点交给列表本体；手写结构里 Virtualizer 晚一拍挂上同样适用。

**修复** 选择器接了虚拟化桥时（含手写结构），自绘滚动条跟着 Virtualizer 的视口走，不再挂在不滚的列表上，与 TreeSelect、Transfer 一致。
