---
'@xihan-ui/styles': minor
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

浮在内容之上的圆钮（Action Control `floating` 档）整体下移一档：sm / md / lg 由 40 / 48 / 56px 改为 32 / 40 / 48px（compact 28 / 36 / 44px），图标 16 / 20 / 24px，缺省 md 即 40px。48px 的钮在矮视口与小卡片里会叠住内容与彼此（走马灯的翻页钮与播放钮、纵向轨道压住正文）。

视觉默认变化：BackTop、FloatButton（含展开列表里的动作项）缺省由 48px 变为 40px，`size="lg"` 由 56px 变为 48px；ImageViewer 翻页钮由 48px 变为 40px、关闭钮由 40px 变为 32px；Carousel 翻页与播放钮为 40px。Log / MessageFeed 的回到底部钮缺省仍是 32px。

新增尺寸档：
- Carousel 新增 `size`（sm / md / lg，缺省 md），翻页、播放三颗钮同档。
- ImageViewer 新增 `size`（sm / md / lg，缺省 md），翻页钮同档，关闭钮比它低一档、最低 sm。
- Log、MessageFeed 的回到底部钮随组件已有的 `size` 换档：比组件低一档、最低 sm（sm / md 时 32px，lg 时 40px）。

新增的 `size` 与其他组件一样接全局配置，没写时取全局尺寸。
