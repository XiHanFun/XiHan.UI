---
'@xihan-ui/styles': minor
---

`family/motion.css` 新增七个共享关键帧，覆盖跨组件重复出现的动作：列表条目进场 `xh-item-in`、自上而下的显现 `xh-drop-in`、面板进退场 `xh-sheet-in` / `xh-sheet-out`、整幅滑入滑出 `xh-slide-in` / `xh-slide-out`（方向经 `--xh-_slide-from-x` / `--xh-_slide-from-y` 传入）、流光 `xh-shimmer`。`xh-spin` 与 `xh-countdown` 也收进同一文件，名字不变；`xh-spin` 改写独立的 `rotate` 属性，与元素自身的 `transform` 叠加。
