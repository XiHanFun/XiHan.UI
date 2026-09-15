---
"@xihan-ui/styles": patch
---

Carousel 的分页指示器在粗指针环境下改为首尾相接的 44px 按钮分区，避免以负 inset 扩大命中区时相邻页互相覆盖；16/24px 短线、当前页进度、横向/纵向与 RTL 视觉保持不变，并新增 `--xh-carousel-indicator-target-size` 覆盖槽。
