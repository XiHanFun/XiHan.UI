---
'@xihan-ui/core': minor
'@xihan-ui/headless': patch
---

Carousel 在开发期核对张数：挂载后与 `slideCount` 改写时，若渲染出来的条目比 `slideCount` 多（常见是漏传、按 0 张处理），经诊断通道报 `carousel.slide-count-mismatch` 并在控制台告警，不必再靠读文档排查「没有指示点、翻页禁用、播报总数为 0」。按需渲染时 DOM 里的条目少于张数是正常的，不报。core 新增诊断码 `DIAGNOSTIC_CODES.carouselSlideCountMismatch`。
