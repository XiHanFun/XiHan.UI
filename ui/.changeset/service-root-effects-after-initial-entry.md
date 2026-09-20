---
"@xihan-ui/core": patch
"@xihan-ui/headless": patch
---

**状态机初始化：初态 entry 先跑，根 effect 最后挂。**

`createService` 首次 mount 的编排改为 state effect → machine entry → state entry → 根 effect（此前根 effect 排在 state entry 之前）。根 effect 是整个生命周期的资源——层、焦点域、观察器——建起那一刻读到的必须是进入完毕的初态。此前 `defaultOpen` / `open` 挂载时，浮层的焦点域在 open 态 entry 挑锚点（高亮项、焦点格）之前就同步落焦：Vue / React 先渲出带 tabindex 的部件再跑效应，焦点因此定死在 time-picker / time-range-picker 的整列容器、select 的列表本体上，方向键与 Enter 没有起点，也与 Web Components（升级晚一拍、锚点已就位）的落点不一致。现在挂载那一拍焦点就落在首格 / 选中项上，三端同构。转移（非初始化）的编排不变。
