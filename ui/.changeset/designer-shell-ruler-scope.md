---
'@xihan-ui/designer-shell': patch
---

标尺的样式不再穿透到画布里的作者内容：刻度、指示线、光标线、高亮、参考线与预览线等规则改成从 `xh-designer-ruler` 起逐层的子选择器，只认标尺自己生成的部件。此前画布里带 `data-part="marker"`、`"highlight"`、`"guide"` 等同名部件的作者元素会被设成绝对定位并画上背景色。
