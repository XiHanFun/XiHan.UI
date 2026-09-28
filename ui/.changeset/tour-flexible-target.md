---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Tour 步骤的 `target` 除 CSS 选择器外，还接受元素与返回元素的函数（新类型 `TourTarget`）；已脱离文档的元素按取不到处理。进入某一步时声明的目标还没挂上，组件盯住组件所在的根节点等它出现，期间气泡不露面；等到了即滚进视口、定位并高亮。新增 `targetTimeout`（Web Components `target-timeout`，缺省 3000ms，0 即不等）：等满仍没有，该步改在视口中居中、不画高亮框与箭头，`anchored` 随之为 false，不再等待；目标之后才挂上来时调用 `remeasure()` 重新锚定。展开与每次换步重新开始等，收起即撤掉观察与计时。headless 新增常量 `TOUR_TARGET_TIMEOUT`。
