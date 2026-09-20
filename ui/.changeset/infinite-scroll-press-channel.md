---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**InfiniteScroll 的 load-more-trigger 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（row 档只换面不缩放）。**
机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级；取数中与关闭时不进，按住途中进入取数 / 关闭两段时由机器松开。
键盘表新增 `infinite-scroll.kbd.press`。三端公开 props 与事件不变。
