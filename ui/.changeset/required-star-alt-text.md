---
'@xihan-ui/styles': patch
---

Field 标签与 Fieldset 组标题前的必填星号不再进控件的可及名：`content` 带一段空的替代文本，读屏不再先念「星号」，必填照旧由 `aria-required` 表达。不支持替代文本写法的引擎（Firefox 128、Safari 17.4 以前）经 `@supports` 退回原写法，星号照常显示。皮肤体积基线随之上调。
