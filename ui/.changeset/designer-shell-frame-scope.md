---
'@xihan-ui/designer-shell': patch
---

外框的样式不再穿透到区里的作者内容：外框生成的结构都写上 `data-scope="designer-frame"`，区容器另写所在位置 `data-position`，样式只认外框自己的 scope。此前画布里带 `data-part="region"` 等同名部件的作者元素会被设成 `display: flex`、`overflow: hidden`，选中节点的类型标签与小工具条被裁掉。
