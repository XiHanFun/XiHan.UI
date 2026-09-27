---
'@xihan-ui/core': minor
'@xihan-ui/headless': patch
---

浮层关闭那一刻就把焦点交回触发器，不再等退场动画播完。此前 Dialog、Drawer、Popover、Popconfirm、Command、Tour、ImageViewer 与 Select 等锚定列表在关闭同一拍把内容设为 inert，焦点被浏览器收到 body 上，要等退场结束再过一帧才归还，这段时间里键盘与读屏用户「不在任何地方」。

- `createFocusScope` 的返回值新增 `returnFocus()`：立即按原有规则归还焦点，归还过的域卸载时不再重复归还；`reactivate()` 恢复归还资格。返回值类型以 `FocusScopeHandle` 导出。
- 模态浮层关闭那一刻先撤下背景失活（滚动锁仍保留到退场结束），背景里的触发器才能接住焦点；退场中途重开时补回。
