---
'@xihan-ui/headless': patch
---

**优化** TextField 多行自动增高（`autoSize`）：值、占位符、行数配置、样式表给的上限与排字样式都没变的更新不再重新量高，属性面板这类频繁刷新的场景不再每次强制排版；宽度变化由 ResizeObserver 盯着，变宽变窄照样重量，网页字体加载完后的下一次更新也照样重量。需要量高时两只测量节点一起挂上、一次排版读完，不再读写交替。Vue、React、Web Components 行为不变。
