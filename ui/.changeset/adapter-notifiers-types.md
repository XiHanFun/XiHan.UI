---
'@xihan-ui/vue': major
'@xihan-ui/react': major
---

**破坏性** 组合式函数第二个参数（交给机器的那组回调）的类型统一以 `Notifiers` 结尾，与图表的 `CartesianChartNotifiers`、Dialog 的 `DialogActionNotifiers` 和 headless 的 `PopconfirmNotifiers` 同一个后缀。

| 旧名 | 新名 |
| --- | --- |
| `ApprovalCallbacks`（Vue） | `ApprovalNotifiers` |
| `EditableCallbacks`（Vue） | `EditableNotifiers` |
| `FormCallbacks`（Vue、React） | `FormNotifiers` |
| `PromptInputCallbacks`（Vue） | `PromptInputNotifiers` |
| `QuestionFlowCallbacks`（Vue） | `QuestionFlowNotifiers` |
| `JsonViewerToolEvents`（Vue） | `JsonViewerToolNotifiers` |
