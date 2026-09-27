---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

`cartesian-chart` 新增缩放与降采样。

- `zoom` 打开缩放：`x` / `y` / `xy`，缺省 `none`。窗口 `window` / `defaultWindow` 用定义域里的值写两根轴各露出的一段（类目轴写首尾两个类目，连续轴写两端的值，数值轴写 `[下, 上]`，`null` 是整条轴），多张图接到同一份窗口上即联动；变化时派发 `onWindowChange`（Vue `window-change` 与 `update:window`，Web Components `window-change`）。类目轴按窗口露出连续的一段类目；连续轴与数值轴换成窗口对着的定义域，系列与注释按绘图区裁剪（新部件 `clip-path` / `clip-rect`）。
- 手势：Ctrl（⌘）滚轮以指针为中心缩放，放大后拖动平移，触屏双指捏合、单指平移，只拦能缩放的方向；键盘在绘图区按 + / − 以焦点为中心缩放，焦点走出窗口时窗口跟过去。
- 竖向图缩放自变量轴时，绘图区下方出一条缩放条：新部件 `zoom-slider`（`role="group"`）、`zoom-track`、`zoom-window` 与两个 `zoom-handle`（`role="slider"`，读出窗口那一端对着的类目或值）。Web Components 侧作者在外壳里放一个空的 `zoom-slider`。新增文案 `zoomLabel`、`zoomStartLabel`、`zoomEndLabel`，组件槽 `--xh-cartesian-chart-zoom-*`。
- 折线的点比绘图区的像素多一倍以上时按 Largest-Triangle-Three-Buckets 降采样，缩放后只采窗口里的一段；焦点、提示框、摘要与数据表仍是全部数据。
