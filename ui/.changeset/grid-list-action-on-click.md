---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 网格列表的 `actionOnClick`（Web Components 为 `action-on-click`）：打开后点行触发行主操作（`action` 事件，比如看详情），选择只由行首方框与 Space 改变，一边勾选一批行做批量操作、一边点开某一行看详情。行首方框自己接点击、不冒泡成行的点击，方框不占 Tab 位，点它时焦点落在所在的行上；Shift + 点击仍是扩选。不开时行为不变：点行是选择，Enter 是行主操作。
