---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

其余带可选 label 的组件也新增 `labelled`，与文本字段（TextField）、选择器（Select）等同名同义：作者渲染了 label 部件时由适配器置真，为假时被命名的部件不把 label 的 id 写进 `aria-labelledby`，不再挂着一个落空的 id（axe 的 aria-valid-attr-value 不再报），靠 `aria-label` 或内建文案命名时也不被它压住。

- 涉及：剪贴板（Clipboard）、颜色滑块（ColorSlider）、颜色选择器（ColorPicker）、日期字段（DateField）、时间字段（TimeField）、就地编辑（Editable）、网格列表（GridList）、列表框（Listbox）、签名板（SignaturePad）、标签组（TagGroup）、树（Tree）、文件上传（FileUpload）。
- 颜色选择器的触发钮没有 label 时名字只取当前值；文件上传的投放区没有 label 时名字只取它自己看得见的说明。
- 颜色选择器内嵌的颜色滑块与色板各自按自己有没有 label 决定引用。Web Components 下只给内嵌滑块写了 label 时，取色器不再当自己有标题；内嵌色板写了 label 时现在会被引用，与 Vue、React 一致。
- 三端判断 label 在场的方式与先前一致：Vue 的 label 部件在 setup 里同步登记，React 在 effect 里登记，Web Components 看作者写没写 label 角色节点。
