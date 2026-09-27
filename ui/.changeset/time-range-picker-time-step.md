---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

TimeRangePicker 的步进按单位取，逐格判定改收上下文。

- 删除 `step`，新增 `timeStep: { hour?, minute?, second? }`：时、分、秒各有步进，各单位缺省 1；时的步进按 24 小时制的真实小时取，12 小时制下每一端按自己落在上午还是下午排时列。Web Components 的 attribute 由 `step` 改为 `time-step`（JSON 对象）。
- `isTimeUnavailable` 的签名由 `(value, unit, index)` 改为 `(value, unit, context)`：端号挪进 `context.index`，`context` 另带这一端已选的时（24 小时制）与分；时列的 value 恒按 24 小时制给出。
- api 的 `step: number` 改为 `timeStep`（三个单位都已落定的步进）。

迁移：`step={15}` 写成 `timeStep={{ minute: 15 }}`；`(value, unit, index) => …` 写成 `(value, unit, { index }) => …`。
