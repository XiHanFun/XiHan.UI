---
'@xihan-ui/designer-shell': patch
---

属性面板的样式不再穿透到作者内容：面板生成的部件都写上 `data-scope="designer-properties"`，样式只认这个 scope。此前 `header`、`footer` 插槽与宿主编辑器里带 `data-part="title"`、`"group"`、`"property-label"` 等同名部件的作者元素（包括编辑器里用到的 UI 组件自己的 title 部件）会被改字重、排成弹性布局、去掉外边距。
