---
'@xihan-ui/styles': minor
'@xihan-ui/web-components': minor
---

字段族控件放进表格格子（就地编辑的单元格）铺满这一格：格子声明 `--xh-control-w: 100%`，与放进 Field、字段数组的行时一样，并排几个就平分。Web Components 里 20 个字段族组件（文本框、数字框、选择器、日期与时间选择器等）的宿主缺省 `display: contents`：宿主不再是外层 flex / grid 里多出来的一层按内容定宽的盒子，作者写的 root 直接参与排布，与 Vue / React 直接渲染 root 一致；作者自己给宿主写了 `display` 就不动。此前放进表格格子的字段在 WC 里只剩几十像素宽，示例只好在宿主上手写 `inline-size` 与 `--xh-control-w`。
