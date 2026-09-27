---
'@xihan-ui/headless': major
---

时间列的约束收进一份共享算子，时间选择器、时间范围选择器、日期选择器与日期范围选择器的时间列共用。

- 新增 `timeColumns` / `timeColumnsFor`：按精度、小时制、按单位的步进（`timeStep: { hour?, minute?, second? }`）与 min / max 生成每列的可选值。时的步进按 24 小时制的真实小时取，12 小时制下的显示值与上下午列随之换算。
- 新增 `resolveTimeStep(step?: TimeStep)`：三个单位各自落定，写坏的值回退为 1。
- 新增逐值可选性的上下文 `TimeUnavailableContext`（已选的时、分，所属日期，区间的端）与判定签名 `TimeUnavailablePredicate`；`isTimeItemUnavailable` 把时格按 24 小时制换算后交给判定，`timeUnavailableValue` 给出这份换算。
- 新增 `timeBoundsOnDate`：min / max 带时间段时，与它同一天的那一天取它的时间段作界，界外的日子整天不可选；`laterTimeBound` 取两个下界中较晚的那个。
- 删除 `timePickerColumns`、`timePickerColumnsFor`、`timePickerItemValue`、`TIME_PICKER_STEP` 与 `TimePickerColumnsOptions`，改用上面的 `timeColumns`、`timeColumnsFor`、`timeItemValue` 与 `TimeColumnsOptions`（入参 `step: number` 改为 `timeStep: TimeStep`）；`resolveTimeStep` 的入参由分钟数改为 `TimeStep`、返回三个单位的步进。`TimePickerColumn` 与 `TimePickerColumnUnit` 保留，与新的 `TimeColumn`、`TimeColumnUnit` 同一类型。

迁移：`timePickerColumns({ step: 15 })` 写成 `timeColumns({ timeStep: { minute: 15 } })`；`resolveTimeStep(15)` 写成 `resolveTimeStep({ minute: 15 }).minute`。
