---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

GraphChart 新增三项：

- `layout="preset"` 按节点上写的 `x` / `y` 摆放，整体等比缩放进绘图区；有节点缺有限数的坐标时报 `chart.graph-shape`。
- 连线可写 `label`：画在两端圆心连线的中点（新部件 `link-label`，描一圈承载面色），和节点或名字压住、越出绘图区时不写；数据表多一列关系（新文案 `translations.linkLabel`）。
- 画布视图可受控：`view` / `defaultView` / `onViewChange`（Vue `v-model:view`，事件 `view-change`），几张图接同一份视图即同步平移缩放；`zoom` 关着时视图不生效。新增类型 `GraphViewChangeDetails`。

Web Components 侧原先读此刻视图的 `view` getter 改名为 `currentView`，`view` 成为受控的 JS property。
