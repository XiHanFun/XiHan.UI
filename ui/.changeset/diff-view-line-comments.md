---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

DiffView 新增行评论钩子：

- 新增 `commentable`：每行正文前出现一颗评论钮（新部件 `comment-trigger`，由组件铺），点它报出 `comment-request`，detail 为 `{ side, line, change, text }`；一组钮只占一个 Tab 位，上下方向键在组内走，Home / End 到首末。指针设备上钮平时透明，悬停到这一行或焦点进了视口时显出来。root 带 `data-commentable`。
- 新增 `commentLines`（写 `{ side, line }`）：这些行在代码下方、同一个格里铺出评论容器（新部件 `comment-thread`），内容由作者写——Vue 用 `XhDiffViewBody` 的 `comment` 插槽，React 用 `XhDiffViewBody` 的 `renderComment`，Web Components 监听 `comment-mount`（detail 带 `element`）。单栏里删除行落旧侧、其余落新侧，并排按所在的那一侧。
- 新增类型 `DiffViewLineRef`、`DiffViewCommentRequestDetails`；API 新增 `commentable`、`commentRefAt`、`hasComment`、`getCommentTriggerProps`、`getCommentThreadProps`；文案新增 `commentOn(line, side)`。
- 外观槽：`--xh-diff-view-comment-col`、`--xh-diff-view-comment-trigger-{radius,fg}`、`--xh-diff-view-comment-trigger-icon-size`、`--xh-diff-view-comment-thread-{max-w,my,p,border,radius,bg,fg}`。
