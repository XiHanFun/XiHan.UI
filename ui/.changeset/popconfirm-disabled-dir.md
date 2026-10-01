---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

Popconfirm 补上文档已列出的 `disabled` 与 `dir`：三端根组件声明并转给 popover 状态机，`disabled` 时触发器转原生 `disabled` 并带 `data-disabled`、点按不展开、展开途中转为禁用即收起；`dir` 写在定位层上，浮层搬到落点后仍按作者给的方向排布。此前这两个属性写上后落到根节点上不起作用。
