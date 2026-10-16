---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

字段与库内控件的 `aria-labelledby`、`aria-describedby` 只引用实际渲染了的部件，不再指向页面上不存在的 id（axe 的 aria-valid-attr-value 不再报）。

- 字段（Field）：没写标题、说明或错误文案部件时，控件的名字链与描述链不带它们的 id；说明渲染了但没有文字也按没写处理，补上文字后接上。`connectField` 的 props 新增可选的 `parts`（类型 `FieldRenderedParts`），由适配器统计，省略即按都在场处理；`FieldControlWiring` 的 `labelId`、`describedBy` 在对应部件不在场时为 `undefined`。
- 下列组件新增 `labelled`，与单选组（RadioGroup）、复选框组（CheckboxGroup）、色板选择（ColorSwatchPicker）同名同义：作者渲染了 label 部件时由适配器置真，为假时可聚焦部件不把 label 的 id 写进 `aria-labelledby`。没写自己的 label、靠字段标题或 `aria-label` 命名时，不再挂着一个落空的 id。涉及：级联选择（Cascader）、选择器（Select）、树选择（TreeSelect）、日期选择器（DatePicker）、日期范围选择器（DateRangePicker）、时间选择器（TimePicker）、时间范围选择器（TimeRangePicker）、文本字段（TextField）、数字输入（NumberField）、密码输入（PasswordInput）、颜色输入（ColorField）、组合框（Combobox）、提及（Mention）、标签输入（TagsInput）、分格输入（PinInput）、评分（Rating）、滑块（Slider）。
- Vue 的 label 部件改在 setup 里同步登记（含上面三个组件）：label 排在被命名的节点之前时，首帧与服务端直出就带上名字。React 照旧在 effect 里登记，首帧（含服务端直出）不写这条引用，挂载后补上；Web Components 按作者写没写 label 角色节点判断。
