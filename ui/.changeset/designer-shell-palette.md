---
'@xihan-ui/designer-shell': minor
---

新增物料面板 `<xh-designer-palette>` 与通用拖放 `startDrag` / `registerDropTarget`。物料按分组列出，可搜索、分组可折叠；点击、回车、空格或触屏轻点派发 `item-activate`，按下拖动（触屏长按）拖向登记过的放置目标，目标答复能否放下、可藏起预览自己画落点。拖到接受的目标边缘时逐帧派发 `pan-request`；Esc、指针离开窗口、在不接受处松手即取消。
