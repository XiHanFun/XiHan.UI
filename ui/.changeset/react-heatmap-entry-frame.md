---
"@xihan-ui/react": patch
---

修正 React Heatmap 首次挂载时先短暂显示完整终态、再退回填色起点的问题，使首个可见帧直接进入扫描填色动画，与 Vue 和 Web Components 一致。
