---
'@xihan-ui/core': minor
'@xihan-ui/headless': patch
'@xihan-ui/designer-shell': patch
---

Core 新增页面级的礼貌播报器 `announce(message, { document? })`：整页一个视觉隐藏的 `role="status"` 播报区，第一次播报时挂到 `body` 末尾；每次先清空、隔一拍再写，同一句话连播两次也会再读，写下约 7 秒后清空；挂在 `body` 下，模态浮层打开时照旧可读；页面上装了几份 core 也共用同一个。组件自带的播报（剪贴板、走马灯、审批）不变，不属于某一个组件的页面级播报改用它。视觉隐藏的内联样式 `VISUALLY_HIDDEN_STYLE` 的真源移到 core 并从 core 导出，headless 照旧转出同一个值。设计器外框的 `announce(message)` 改经这个播报器，不再在外框里生成自己的播报区，模态对话框（如设置）开着时也读得到。
