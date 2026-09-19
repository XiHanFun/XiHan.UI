---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**ContextMenu 条目接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
触发区的长按等待已占用 `PRESS.START` / `PRESS.END`（`closed → pressing`，投影 `data-pressing`），条目的按压另起
事件 `ITEM.PRESS.START { value, disabled }` / `ITEM.PRESS.END { value }`，写入新增的 context `pressedValue`，不复用
`pressing` 状态；守卫 `canPressItem` 在条目禁用（部件声明或 collection）时不进，`endItemPress` 只松开 value 对应的
那一条，open 态 exit 时由机器自行松开。条目 getter 投影 `data-pressed`，Collection Item 家族配方的按压选择器已是
`:is(:active, [data-pressed])`；键盘表新增 `context-menu.kbd.press`。三端公开 props 与事件不变。
