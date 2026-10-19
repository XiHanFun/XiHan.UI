---
'@xihan-ui/core': minor
'@xihan-ui/headless': minor
'@xihan-ui/styles': patch
---

core 新增页面级窗口叠放序 `getWindowStack(doc)` 与类型 `WindowStack`：`raise(key)` 提到最上面、`remove(key)` 移出、`depthOf(key)` 从上往下数第几扇（最上 0，不在栈里 -1）、`subscribe(fn)` 订阅变化；按 Document 各一份，页面上几份 core 共用，不进层栈。

浮动面板（Floating Panel）接上叠放序：几个面板同时开着时，后展开的在上面，在哪个面板上按下或焦点进到哪个面板里，哪个就提到最上；收起或卸载时移出。定位层的私有层号 `--xh-_layer` 取抽屉层减去从上往下数的序号（最上面的就在抽屉层上，往下每一扇减一），最上面的面板仍在模态层之下；写了 `--xh-floating-panel-layer` 就按写的来。
