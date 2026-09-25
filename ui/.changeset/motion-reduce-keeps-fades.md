---
'@xihan-ui/tokens': minor
'@xihan-ui/motion': patch
---

减弱动效改为去掉位移、保留淡变。

减弱动效下（系统 `prefers-reduced-motion: reduce` 或 `data-motion="reduce"`），`--xh-motion-duration-micro`、`--xh-motion-duration-enter`、`--xh-motion-duration-exit` 保留为 120ms：换色、浮层与提示的淡入不再瞬间跳变。位移、缩放、旋转与尺寸变化仍然瞬时完成——组件的几何过渡取 `move` / `nudge` / `expand` / `collapse` / `slide` / `press` / `release`，这些时长在减弱档下为 1ms，位移与缩放幅度归零。

自定义样式如果把几何变化挂在 `micro` / `enter` / `exit` 上，减弱动效下会以 120ms 动起来，请改用上面的几何时长。`@xihan-ui/motion` 的 `readMotion` 在读不到样式时取同样的减弱档取值。
