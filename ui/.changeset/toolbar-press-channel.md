---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Toolbar 的 item 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
机器 context 新增 `pressedValue`，事件 `PRESS.START` / `PRESS.END` 按条目 value 记按住的那一个；整条或条目禁用时不进，按住途中整条转禁用时由机器松开。
键盘表新增 `toolbar.kbd.press`。三端公开 props 与事件不变。
