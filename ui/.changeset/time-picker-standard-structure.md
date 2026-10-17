---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

时间选择器改用标准结构：新增 `timePickerStructure` 与 `TimePickerStructureOptions`，次序是标题（原生 `label`）、盒（单选是段组，时、分、秒之间是冒号、挨着上下午段的是空格；多选是带删除钮的标签行；后面是清空钮与触发钮）、表单影子、浮层（快捷选项列、按精度与小时制铺的各列，多选时再加底栏的添加钮）；标签部件按 `component` 委派给标签。Vue 不写默认插槽、React 不给 children 时照它铺，原先这种写法只渲出空的根；Web Components 的 `<xh-time-picker>` 不写部件或只写 `root` 时生成整套节点，精度、小时制与选中变化时随之重铺，标题可用 `slot="label"` 接管。三端新增 `label`：Vue 是标题文字与 `label` 插槽，React 可传任意节点，Web Components 是 `label` 属性，只在不写结构时使用。headless 另增 `TimePickerTranslations.confirmTrigger`（多选添加钮的文字，十种语言包都已补上）与 `TimePickerApi.translations`（解析后的文案）。
