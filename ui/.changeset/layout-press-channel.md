---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Layout 的 sider-trigger 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 在两个折叠态都接；把手没有禁用态，按住一律进。
键盘表新增 `layout.kbd.press`。三端公开 props 与事件不变。
