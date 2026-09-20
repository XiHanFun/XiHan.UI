---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**JsonViewer 的分支行接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（行只换面不缩放）。**
机器 context 新增 `pressedValue`，事件 `PRESS.START` / `PRESS.END` 按行路径记按住的那一行；键盘那一路由 `branch` 代发（焦点落在它身上），触屏按在 `branch-control` 上。
皮肤的按压规则改为 `:is(:active, [data-pressed])`，并补 `forced-colors: active` 下的系统高亮反色。键盘表新增 `json-viewer.kbd.press`。三端公开 props 与事件不变。
