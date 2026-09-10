---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/react": major
"@xihan-ui/web-components": major
---

**通知队列的 `max` 缺省从不限改成 5，与轻提示服务同一个数。**

此前 `notification` 不给 `max` 就没有上限：连发多少条，队列里就留多少条、DOM 里就挂多少张卡片。那一摞是一整面固定定位的 flex 列，既不滚动也不折叠，第六张往后直接堆出视口，看不见也关不掉，只能等它们自己到点走。轻提示服务那边一直是「不写 `max` 缺省留 5 条」，同一台队列机器两个出口两种口径。

现在缺省上限住在 headless 机器里，新增导出常量 `NOTIFICATION_MAX = 5`，`visibleNotifications()` 与 `ITEMS.CREATE` 在 `max` 为 `undefined` 时都取它。三条路一并跟着变：声明式的 `XhNotificationRoot` / `<xh-notification>`、三个适配器的 `createNotificationService()`，谁不写 `max` 谁就是每个位置留 5 条。挤条规则不变：先挤低优先级、同级里挤最旧的，非受控队列被挤掉的那条直接从队列删掉、不排队等位；受控队列只是不显示窗口外的，宿主那份 `items` 原样。

**破坏面**：依赖「不写 `max` 就全部显示」的调用方，第六条起会被挤掉。要回到不限，显式写 `max: Infinity`（HTML 属性写 `max="Infinity"`）。`max <= 0` 与 `NaN` 仍按不限处理，这一段没动。

`createToastService()` 的入参、行为与 DOM 全部照旧——它本来就显式传 5；三个适配器的轻提示服务现在改读 `NOTIFICATION_MAX`，同一个数只写在机器一处。
