---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

MessageFeed 与 Log 的回到底部按钮补上退场：回到底部时 `data-state` 立即转 `hidden`、播完 `xh-pop-out` 才写 `hidden` 属性藏起（此前一回底就硬消失），退场途中不接指针。按钮新增 `id`，机器按它找节点、等浏览器实际起播的退场动画播完；没有可等的动画（未装皮肤、减弱动效之外的无动画环境）时即刻藏起。
