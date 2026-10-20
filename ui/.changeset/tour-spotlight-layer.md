---
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

**修复** Tour 的高亮框（`spotlight`）接上引导这一层的层号，与遮罩、定位层同层，排在遮罩之后。引导开在模态对话框或抽屉里时，锚定步照常压暗、框出目标；原先高亮框落回模态层的基数，被外层对话框盖住，周围不压暗、目标也没有描边。
