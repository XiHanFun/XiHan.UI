---
'@xihan-ui/core': patch
---

浮层落焦时只整段选中单行文本类输入框（text、search、url、tel、email、password、number）的内容：第一个可聚焦元素是多行的 textarea 时只把焦点放上去，不再全选里面的文字，勾选框这类 input 也不再调 `select()`。对话框、抽屉、弹出层等用焦点作用域的组件三端一样。
