---
'@xihan-ui/styles': major
---

**调整** 勾选标记（Checkbox、CheckboxGroup、Transfer、Table、QuestionFlow 多选）由「略缩 → 原尺寸并淡入」改为描线：勾上时勾从左往右描出（`clip-path` 右侧裁掉的那一截收回 0，`nudge` / `enter`）并淡入，取消时倒擦回去并淡出（`exit` / `exit`）；全选与半选之间，勾与横杠两层遮罩以中心为原点交叉缩放（`mask-size`，`nudge` / `enter`），不再瞬间换形。标记不再写 `scale`，覆盖过勾选标记 `::before` / `::after` 缩放的主题改写 `clip-path`。勾的字形不随书写方向镜像，RTL 下同样从左往右描；减弱动效下裁切量取 `--xh-motion-travel` 归零，只剩淡变。
