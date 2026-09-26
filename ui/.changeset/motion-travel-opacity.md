---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': minor
---

新增动效令牌 `--xh-motion-travel-opacity`：整幅位移起止两端的不透明度，缺省 1，减弱动效下 0。配套共享关键帧 `xh-slide-fade-in` / `xh-slide-fade-out` 与整幅滑入并列播放、时长取淡变档：缺省档两端都是不透明、看不出来，减弱动效下整幅位移归零，进出场改由这段淡变表达。

Drawer 的进出场在整幅滑入旁并列 `xh-slide-fade-in` / `xh-slide-fade-out`：减弱动效下不再位移，改为 120ms 淡入淡出。

Layout 覆盖档侧栏的整幅位移改取 `--xh-motion-travel`，减弱动效下不再位移：展开淡入、收起淡出，淡完才藏起；遮罩收起时的淡出改走退场档。
