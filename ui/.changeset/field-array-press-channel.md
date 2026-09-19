---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**FieldArray 新增把手与行内的删除 / 上移 / 下移把手接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针
`:active` 同一副按压面。** 机器 context 新增 `pressed`（按 key 记住正被按住的那一个，行内把手按机器分配的行序号区分；
新增导出类型 `FieldArrayPressedKey`），事件 `PRESS.START` / `PRESS.END` 挂根级；整体禁用 / 只读，以及到上下限、首末行
这类 aria-disabled 的把手不进。删除 / 换序落地后把手随行离场或换位时由机器当场松开；按住途中转入禁用 / 只读，或作者
整份换掉值使该行离场时同样松开。键盘表新增 `field-array.kbd.press`。三端公开 props 与事件不变。
