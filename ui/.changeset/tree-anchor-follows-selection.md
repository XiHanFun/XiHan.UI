---
'@xihan-ui/headless': minor
---

树（Tree）的连选锚点跟着从外面换上的选中走：受控时宿主另写了 `selection`、调了 `setSelection`，或挂载时就带着选中，按住 Shift 点击从新选中里多出来的最后一项连起；清空了就没有锚点，Shift 点击退化成点击；宿主照着树提的选中写回、或只去掉了几项时锚点不动。Vue、React 与 Web Components 一样。
