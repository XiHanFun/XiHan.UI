---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Tree 叶子行与分支行接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
机器 context 新增 `pressedPart`（`item` / `branch-control`）与 `pressedValue`（节点 value），事件
`PRESS.START { part, value, disabled? }` / `PRESS.END { part, value }`；守卫 `canPress` 在整棵树禁用或加载时不进，
节点自身禁用时不进；`endPress` 只松开 part + value 对应的那一个，按住途中整棵树转入禁用 / 加载时由机器自行松开。
叶子行自己接键盘与触屏；分支行的焦点落在 branch 上，键盘按压由 branch 代发（只认落在自己身上的按键与失焦，
子树里冒泡上来的不算），`branch-control` 投影 `data-pressed` 并只接触屏；同一个值按住分支行时叶子不亮。
Space / Enter 的选中与展开语义照旧由 tree 容器承担，按压只记事实。Collection Item（page 语境）家族配方的按压
选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `tree.kbd.press`。三端公开 props 与事件不变。
