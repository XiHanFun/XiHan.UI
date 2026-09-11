---
'@xihan-ui/headless': patch
---

所有浮层机器的 layer effect 现在通过统一的初始化事务登记 LayerRegistry、DismissableLayer、FocusScope、ScrollLock 与背景失活资源。同步步骤或宿主 flush 中延后执行的背景失活初始化失败时，已经取得的 layer 资源都会逆序完整回滚，不再留下占据共享栈顶但没有 effect cleanup 的半初始化 layer。

正常拆除也复用同一份幂等逆序 cleanup；多项清理同时失败时继续释放其余资源，并通过 AggregateError 完整报告。
