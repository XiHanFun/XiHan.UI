---
"@xihan-ui/designer-kit": minor
---

**新增** `PropertyEditorContext.issues`：落在这个属性及其里层的问题 `PropertyIssue { path, message }`，路径相对属性，按路径排，同一路径只留一条；复合编辑器据此把里层的问题标到子项上。编辑器实例新增 `nestedIssues`：自己显示里层问题时写 `true`，设计器不在行下重复。

**调整** `issues` 是必填字段：自己拼 `PropertyEditorContext`（如在单测里直接调用编辑器）的地方补上 `issues: []`。
