---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Toast 的关闭按钮与操作按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
机器 context 新增 `pressed`（`ToastPressedPart`：`'close' | 'action'`，记正被按住的那颗），事件 `PRESS.START` / `PRESS.END`；
不可关闭时关闭按钮不进，进入退场（点关闭、点操作、到点自动退场）或按住途中转成不可关闭时由机器松开。
`ToastPressedPart` 类型进入公开面；键盘表新增 `toast.kbd.press`。三端公开 props 与事件不变。
