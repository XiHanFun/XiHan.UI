---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

MessageFeed 新增按日期分隔与回到底部的未读数：

- 新部件 `separator`（Vue / React `XhMessageFeedSeparator`）：与条目平级写在内容层里，显示「今天」「9 月 27 日」这类标注，两侧各一道内部分隔线，对读屏隐藏。API 新增 `getSeparatorProps`。
- 新部件 `unread-count`（Vue / React `XhMessageFeedUnreadCount`）：放进回到底部按钮里；离开底部期间 `count` 的增量累加成未读条数，回到底部清零。插槽留空时显示条数（Web Components 由元素写入），没有未读时收起；只放入它时按钮上的向下字形照旧。条数写进按钮的可访问名，文案 `scrollToBottomUnread(count)` 可覆盖。API 新增 `unreadCount` 与 `getUnreadCountProps`。
- 角标与分隔的外观槽：`--xh-message-feed-unread-count-{size,px,radius,bg,fg,font-size}`、`--xh-message-feed-separator-{gap,fg,font-size,line}`。
