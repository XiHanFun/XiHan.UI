---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**MessageFeed 的回到底部按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
message-feed 机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END`；守卫 `canPress` 只在视口离底（按钮在场）时放行，
按住途中回到底部、按钮随之收起时由贴底回报一并松开。键盘表新增 `message-feed.kbd.press`。三端公开 props 与事件不变。
