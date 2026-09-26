---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

BackTop、FloatButton（缺省 outline 档）、Carousel 控制钮、Log 与 MessageFeed 的回到底部改走材质家族配方：交互阶梯统一为悬停 / 按下换不透明淡底一档、二档、键盘聚焦铺 focus surface、带 1px 顶光——Log 与 MessageFeed 的回到底部此前悬停取半透明淡底、键盘聚焦时面变透明、没有顶光，现与其余浮动钮一致。`data-material="liquid"` 下的液态面由配方在同一组私有槽上换值，外观不变。
