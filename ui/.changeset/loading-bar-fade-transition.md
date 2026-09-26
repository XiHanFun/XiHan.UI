---
'@xihan-ui/headless': major
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

LoadingBar 收尾不再按固定毫秒猜淡出何时结束：冲到 100 之后等根节点上真实的淡出过渡播完才归零收起，作者改了皮肤的淡出时长槽 `--xh-loading-bar-fade` 也对得上（此前机器固定等 200ms，皮肤缺省淡出 120ms，改长淡出时条子会在淡出途中先缩回左边）。

- `fadeDuration` 保留，含义改为淡出时长：给了就写进 `--xh-loading-bar-fade`；不给按退场令牌 `--xh-motion-duration-exit`（此前缺省 200ms）。没有在播的淡出过渡（例如没装皮肤）时即刻收尾。
- 删去导出 `LOADING_BAR_FADE_DURATION`；`resolveLoadingBarFadeDuration` 没给或给了非有限数时返回 `undefined`（此前退回 200）。
- 机器事件 `after.fadeDuration` 改名 `FADE.DONE`。根部件新增 `id`。
