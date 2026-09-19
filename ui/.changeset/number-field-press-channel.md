---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**NumberField 加减按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
context 新增 `pressed`（按 part 键记住正被按住的那颗，新增导出类型 `NumberFieldPressedPart`），事件
`TRIGGER.PRESS.START` / `TRIGGER.PRESS.END` 挂根级——`PRESS.*` 仍是指针按住连发的事件，按压通道只投影按压面、不改
步进；守卫 `canPressTrigger` 与按钮的 disabled 同一口径（禁用、只读或该侧已贴住端点时不进）；按住途中值贴到端点、
区间收紧或转入禁用 / 只读时由机器自行松开。键盘表新增 `number-field.kbd.press`。三端公开 props 与事件不变。
