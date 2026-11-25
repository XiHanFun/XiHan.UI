---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** QuestionFlow 题目的单选 / 多选从 `type` 改叫 `selectMode`，与它投影的 `data-select-mode` 同名；`type` 在全库是原生含义或别的东西，这里一名多义。取值不变：`single`（缺省）、`multiple`。

| 旧名 | 新名 |
| --- | --- |
| 题目字段 `type` | `selectMode` |
| 类型 `QuestionFlowType` | `QuestionFlowSelectMode` |
