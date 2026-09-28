---
'@xihan-ui/headless': minor
'@xihan-ui/styles': patch
---

LoadingBar 收尾先走满再淡出：`loading` 翻假后进入新相位 `complete`，进度段冲向 100 的平移真正播完才进 `finishing`；`finishing` 里满格先停一个 `--xh-motion-duration-micro` 再按淡出时长淡出，淡出播完才归零收起（此前冲满与淡出同一拍开始，填充 200ms、淡出 120ms，条子大约在八成处就看不见了）。

- `LoadingBarPhase` 新增 `complete`，`data-state` 相应多出这一值；`finishing` 仍是淡出那一段。
- 机器新增事件 `FILL.DONE`；进度段部件新增 `id`，机器按它等平移播完。已在满格、没渲染进度段或没装皮肤时直接进淡出。
