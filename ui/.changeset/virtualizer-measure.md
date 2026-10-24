---
'@xihan-ui/headless': patch
'@xihan-ui/web-components': patch
---

**修复** Virtualizer 的条目尺寸观察不再把收起或尚未排版的节点量出的 0 记进账本：之前 Web Components 收起的窗口外条目、浮层定位前的条目会把那一条压成 0，总长来回抖动，正赶上尺寸观察的投递时还会报 ResizeObserver 循环、丢掉视口的尺寸通知。`<xh-virtualizer>` 带 `measure` 的条目每个只交给内核量一次，之后的变化由内核的尺寸观察报，不再每轮接线同步重量。
