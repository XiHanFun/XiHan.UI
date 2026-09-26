---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
---

BackTop 补上进出场：滚过线时按钮弹出（`xh-pop-in`），退回线内时先播完 `xh-pop-out`、根上才写 `hidden` 收起（此前出现与消失都是硬切），退场途中不接指针。按钮新增 `id`，机器按它等退场动画、接液态面；Vue / React 两端改用由 useId 派生的 scope，服务端与水合两侧同号。
