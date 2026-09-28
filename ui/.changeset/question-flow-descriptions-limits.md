---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

QuestionFlow 新增选项说明、题目说明与多选的数量要求：

- 选项新增 `description`，写进新部件 `item-description`（Vue / React `XhQuestionFlowItemDescription`），排在选项之内另起一行、与文字左缘对齐，跟着选项名一起念。
- 题目新增 `description`，写进新部件 `description`（Vue / React `XhQuestionFlowDescription`，留空时显示数据里的说明；Web Components 由元素写入），成为选项组的 `aria-describedby`；没有说明时该部件收起。
- 多选题新增 `minSelections`（默认 1，选够之前继续键不可用，写了自由文本同样算作答）与 `maxSelections`（选满之后其余未选项转为 `aria-disabled`，程序化 `toggleOption` 守同一条上限）；选项组带 `data-at-max`。没写题目说明时，数量要求代填进去，文案取新增的 `translations.selectionRange(min, max)`。
- 新增导出 `questionSelectionLimits` 与类型 `QuestionFlowSelectionLimits`；API 新增 `selectionLimitsOf`、`descriptionOf`、`getDescriptionProps`、`getItemDescriptionProps`。
- 外观槽：`--xh-question-flow-description-{fg,font-size}`、`--xh-question-flow-item-description-{fg,font-size}`。
