---
'@xihan-ui/core': minor
---

`@xihan-ui/core/visual-environment` 新增液态面 `trackLiquidSurface(el)`：同一文档的液态部件共用一个协调器，只在最近祖先的 `data-material` 为 `liquid` 时生效。它按部件下层的计算底色与作者声明（`data-xh-backdrop="light | dark"`，杂乱时加 `data-xh-backdrop-busy`）在部件上写 `data-xh-ink` 选色调（相对亮度 0.179 ± 0.04 滞回），下层均匀时写 `data-xh-liquid-clarity="clear"`；细指针下把光源方向写进 `--xh-_liquid-light-x/-y`，减弱动效时不跟随；Chromium 内核下以 SVG 位移滤镜折射边缘，其余引擎、超过 640 × 120 或同一视口超过 3 个时只模糊。返回的清理函数撤回写过的全部属性、行内样式与滤镜库。

Portal 视觉桥把材质轴 `data-material` 一并投影到实例壳。
