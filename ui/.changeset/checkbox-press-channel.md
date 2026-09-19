---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Checkbox 方框接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
机器 context 新增 `pressed`，根级事件 `PRESS.START` / `PRESS.END`；守卫 `canPress` 在禁用或只读时不进；按住途中
转入禁用或只读时由机器自行松开。方框是原生按钮，Space 与 Enter 都是激活键，两键都进按压面；按压与勾选态互相
独立，按住途中勾选态翻转不会丢掉按压面。皮肤按压面由 Action Control 家族配方给出（选择器已是
`:is(:active, [data-pressed])`）；键盘表新增 `checkbox.kbd.press`。三端公开 props 与事件不变。
