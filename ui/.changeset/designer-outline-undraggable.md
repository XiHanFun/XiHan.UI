---
'@xihan-ui/designer-shell': patch
---

页面结构 `<xh-designer-outline>` 里 `movable: false` 的行按住拖不起来、行上不报可拖（交给 Tree 节点的 `draggable: false`），Alt + 方向键也挪不动；它照常能选、能展开，也照样能当落点。原先这一行按住仍会开始拖，只是放不下。
