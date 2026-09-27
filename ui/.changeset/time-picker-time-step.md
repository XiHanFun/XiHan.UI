---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

TimePicker 的步进按单位取，逐格判定带上已选的时。

- 删除 `step`，新增 `timeStep: { hour?, minute?, second? }`：时、分、秒各有步进，各单位缺省 1；时的步进按 24 小时制的真实小时取，12 小时制下的显示值与上下午列随之换算。Web Components 的 attribute 由 `step` 改为 `time-step`，写 JSON 对象（`time-step='{"minute":15}'`），也可通过 property 传对象。
- `isTimeUnavailable` 的签名改为 `(value, unit, context)`：时列的 value 恒按 24 小时制给出（12 小时制下也换算成真实的时），`context` 带这份值里已选的时（24 小时制）与分，写得出「9 点只能选 30 分以后」；`date` 与 `index` 在本组件恒为 `null`。
- api 的 `step: number` 改为 `timeStep`（三个单位都已落定的步进）。

迁移：`step={15}` 写成 `timeStep={{ minute: 15 }}`（Vue `:time-step="{ minute: 15 }"`，WC `time-step='{"minute":15}'`）；12 小时制下按显示值判定时列的 `isTimeUnavailable` 改按 24 小时制的值判定。
