---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Transfer 条目、全选格与两颗搬运按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active`
同一副按压面。** 四类部件共用一个机器，context 新增 `pressed`（`TransferPressedKey`：`to-target` / `to-source` /
`item:<side>:<value>` / `select-all:<side>`），根级事件 `PRESS.START { key, disabled? }` / `PRESS.END { key }`；守卫
`canPress` 在禁用、只读或加载时不进，部件自身不可用（条目禁用或被藏起、全选格无可操作条目、搬运按钮没有勾中的
条目）时不进；`endPress` 只松开键对应的那一个，按住途中转入禁用 / 只读 / 加载，或按住 Enter 搬完后按钮失去可搬的
条目（原生 disabled 不再来 keyup）时由机器自行松开。Space 的勾选与搬运语义照旧。Action Control（icon / text 档）
与 Collection Item（page 语境）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增
`transfer.kbd.press`。三端公开 props 与事件不变。
