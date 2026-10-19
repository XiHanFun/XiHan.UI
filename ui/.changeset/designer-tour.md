---
'@xihan-ui/designer-shell': minor
---

**新增** 新手引导零件 `<xh-designer-tour>`：库内 `<xh-tour>` 包一层，designer-shell 的通用步骤（欢迎、工具栏、物料、画布、属性、问题、状态栏、设置）加上设计器交进来的步骤按 `order` 排；目标是外框的面板、区、工具栏上的命令或选择器，目标面板隐藏或命令没有按钮的那一步跳过，进入一步前让外框把面板亮出来。方法 `start()`、`stop()`、`plannedSteps()`，只读 `running`，收起时派发 `tour-end { reason, step }`。

- 步骤类型 `DesignerTourStep`（文字可以按上下文现算，`when` 返回 false 时跳过），`resolveTourSteps` 按上下文取好交给零件，`collectTourSteps` 合起各来源（名字空间 `tour-step`，`shell.` 前缀留给 designer-shell）；扩展新增 `tourSteps` 字段。
- 设置里的 `help.tourDone`（`DESIGNER_TOUR_DONE_KEY`、`tourDoneOf`）记引导已经完成或跳过。
- 内置命令 `start-tour`：`designerShellCommands` 给了 `startTour` 才有，不上工具栏。
- 文案新增 `xh-designer-tour` 一桶与共用命令的 `startTour`，十种语言。
