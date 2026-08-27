---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `resizable` 组件：一块能拖着改尺寸的区域，八条边都能推，键盘也能推。

`edges` 决定开放哪几条边（默认八向全开），没开放的边不显示把手。`minWidth` / `maxWidth` / `minHeight` / `maxHeight` 夹住范围，`aspectRatio` 锁宽高比，`step` 吸附到整数倍。两个回调分工明确：`onSizeChange` 拖动途中连着发，`onSizeChangeEnd` 收尾才发一次，存尺寸用后者。

键盘按**屏幕方向**推：推东边时右键变宽、推西边时右键变窄，与拖动完全同义；Home / End 直接推到两端。`edge` 说的是逻辑方向——`e` 是行尾侧，从右往左排版时它落在屏幕左边，机器把逻辑边翻成物理边再算几何。

**推西边与北边时容器的起点会动**，那段位移写成 root 的 `left` / `top`。皮肤已给 `position: relative`，开箱即对；把 root 改成 `static` 会让这两个方向只变尺寸不移位。只用东 / 南 / 东南三向时没有这个前提。
