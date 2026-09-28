---
'@xihan-ui/headless': major
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Watermark 新增状态机 `watermarkMachine`，承载两件副作用；`connectWatermark` 随之改为 `connectWatermark(service, normalize)`，与其余组件同一种接法（原先的 `connectWatermark(props, normalize)` 不再保留）。

- 防篡改：删掉水印的根节点会被原位放回，改写它的 `data-scope` / `data-part` / `data-state` / `data-fullscreen` 或内联的图样变量会被改回当下 props 算出的值；观察器由机器效应挂在根节点与它的父节点上，组件卸载时先撤，正常卸载不受影响。防的是直接动 DOM 的抹除，不是访问控制。
- `image` 除 `data:image/` 内联图片外，也接受 http(s)、`blob:` 与相对路径的地址：按匿名跨域取回、画进 canvas 转成内联 PNG 再进图样，取回之前只印文字；跨域地址须带 `Access-Control-Allow-Origin`，否则拒载或 canvas 被污染，这张图不印并报一条诊断。`javascript:` 等其余协议一律不收。
- 新增 `fullscreen`（三端同名）：印子固定铺满整个视口、压在模态与轻提示之上，根节点投影 `data-fullscreen` 且不再建层叠上下文；层号经 `--xh-watermark-layer` 覆盖，缺省取 `--xh-layer-tooltip`。

皮肤 watermark.css 涨在全屏档的固定铺满与层号规则上，体积基线随之重落。
