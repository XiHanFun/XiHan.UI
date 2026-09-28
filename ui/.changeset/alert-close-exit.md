---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/web-components': patch
---

Alert 关闭补上退场：先淡出，再把占位从整块高度收到 0（内缩与描边一起收掉），下方内容随之平移上来，播完连接层才给根写 `hidden`（此前关闭即 `hidden`，下面的内容整块跳上来）。退场途中根带 `inert`，关闭钮与作者操作不再响应；减弱动效下收占位瞬时完成，淡出照常。

- 根部件新增 `id`：机器在收起前按它量下整块高度，写进内联私有槽，并等根上的退场动画播完再藏起。
- 机器新增 context `rendered` / `exitBlockSize` 与事件 `ROOT.RENDERED`。
- 新增皮肤关键帧 `xh-alert-collapse`（收占位，登记为布局动画例外）；皮肤体积基线随之上调。
- Web Components 的根显隐改照连接层给的 `hidden`。
