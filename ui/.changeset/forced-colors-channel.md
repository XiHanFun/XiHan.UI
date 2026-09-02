---
"@xihan-ui/styles": minor
---

**高对比档补上状态通道：新增公共补救层 `forced-colors.css`，八份皮肤各带一块自己的补丁。**

Windows 高对比模式（`forced-colors: active`）里系统接管配色：作者写的每一个颜色取值都被换成系统调色板里的对应角色，`box-shadow` 与 `background-image` 直接丢弃。此前全库只有 `gradient-text` 一份表态，其余皮肤在这一档里普遍失效——列表的悬停档与展开路径档塌成同一个样子、勾上与没勾上分不出来、浮层与页面之间零分界、骨架屏与热力图整块空白。这一档在开发机上一点征兆都没有，所以一直没人发现。

新增的公共补救层按状态词汇表把通道补回来，一处收 133 份皮肤：

- 轻档（`data-highlighted`）画一圈内收的虚线环，强档（`data-selected` / `data-current` / `data-in-path` / `data-in-range` / `data-passed` / `data-indeterminate`，以及 `data-state` 的 `checked` / `indeterminate` / `active` / `on` / `current` / `completed` / `open`）画一圈更粗的实线环，两档一眼分得开；
- 禁用换 `GrayText`，只读改画虚线边；
- 定位层里那张面补一圈实边——三档海拔角色都写在 `box-shadow` 上，这一档里整层丢弃。

自带补丁的八份：`color-picker` 与 `heatmap` 画的就是颜色本身，退出强制着色并各补一圈系统描边；`diff-view` 的新增行与删除行改画一实一虚两圈环；`rating` 的点亮与半颗改用系统的高亮色与不可用色分档；`skeleton` 描一圈边把条子勾出来；`reasoning` 与 `tool-call` 把裁到字形上的填充还回去；`gradient-text` 原有那块保留。

补救块里的颜色一律只写系统调色板关键字（`Canvas` / `CanvasText` / `ButtonFace` / `ButtonText` / `ButtonBorder` / `Highlight` / `HighlightText` / `LinkText` / `GrayText`）——令牌在这一档已经不生效，写了是误导。

新增门禁 `check-forced-colors.mjs`：选择器带状态钩子、声明里只改了底色、又没有 border / outline / 字形通道的规则，那个钩子必须落在公共补救层或本皮肤自己的补救块里；靠 `background-image` 承载信息的皮肤必须自带补救块；补救块里引颜色令牌即判红；公共补救层必须排在最后一条皮肤 `@import` 上，无层版产物里也必须落在最后一个皮肤标记之后——它与组件皮肤同层同特指度，谁赢全看源序，挪到前面去有层版与无层版会一起失效。两份登记名单都做过期反查。扫描面取自状态词汇表全集，新加一个状态属性自动进扫描面。

常态渲染一个像素都没变：新增的规则全部关在 `@media (forced-colors: active)` 里。
