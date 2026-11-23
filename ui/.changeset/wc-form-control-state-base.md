---
'@xihan-ui/web-components': patch
---

**改进** 表单控件接收外层 Form / Field 状态的那段接线从 39 个元素各自一份收进了元素基类，行为不变。`custom-elements.json` 里这 39 个元素名下不再单列 `setFormControlState`：它是 Form 与 Field 内部调用的接线方法，不是业务入口，与同类的 `setFieldWiring` 一样由基类提供，在元素上照常可调用。
