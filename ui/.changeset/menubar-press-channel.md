---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/testing': minor
---

**Menubar 入口与条目接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
机器 context 新增 `pressedPart`（`trigger` / `item`）与 `pressedValue`，根级事件 `PRESS.START { part, value,
disabled }` / `PRESS.END { part, value }` 两个状态都认；守卫 `canPress` 在整条菜单栏禁用或部件自身禁用（部件声明或
collection）时不进，`endPress` 只松开 part + value 对应的那一颗；trigger 的开合与按压互不影响，条目随 open 态 exit
一并松开，按住途中整条菜单栏被禁用时由机器自行松开。trigger 与 item 的 getter 投影 `data-pressed`，Collection Item
家族配方（nav / overlay 语境）的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `menubar.kbd.press`。

`@xihan-ui/testing` 的共享步骤 `heldPress` / `heldPressIgnored` 新增可选 `{ value }`，多条目部件可按 `data-value`
指定按哪一条（Web Components 只把展开的浮层搬到落点，文档序里第一条不一定是它的）。三端公开 props 与事件不变。
