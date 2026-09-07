---
"@xihan-ui/headless": patch
---

**修 `image-viewer` 的退场动画在三家适配器上一帧都播不出来。**

`connectImageViewer` 收起时给 `backdrop` / `positioner` / `content` 三层都打了 `hidden`。皮肤对 `positioner` 有 `[hidden] { display: none }`，`backdrop` 干脆没声明 `display`、吃的是 UA 那条——整棵内容因此不生成盒子，退场动画根本不启动。

麻烦在于它看起来是好的：`getComputedStyle` 照常算得出 `animation-name: xh-fade-out`，退场探测据此申领了租约，可 `animationend` 永远不会到来，浮层要一直卡到兜底票（时长 + 200ms）过期才收。用户看到的是没有淡出、而且比该有的多拖约 200ms 才消失。

`dialog` 与 `drawer` 本来就只给 `content` 打 `hidden`，`image-viewer` 是唯一的例外。现在与它们对齐：`backdrop` 与 `positioner` 不再打 `hidden`，真正的收起由宿主兜住——Vue 与 React 卸载整棵，Web Components 写内联 `display`。

Web Components 那份 `wc-image-viewer` 规格里「关闭态三层都带 hidden」是写进契约的，跟着改成「只有 content 带 hidden」。

这个缺陷此前一直没被发现，有两个原因，都记在这里：`jsdom` 不把样式表里的 `animation` 简写算进 `getComputedStyle`（`animationName` 恒为空串），退场探测那条路在 jsdom 里天然走不到；而 `check-hidden-override` 的豁免口径是「部件自己身上挂了 animation」，它的模型里没有「祖先得留在布局里、后代才播得出动画」这一档。判据只查 `animationName` 是不够的——查「`getAnimations()` 里真有这支在跑」才判得出来，新加的 React 退场用例走的是后者。
