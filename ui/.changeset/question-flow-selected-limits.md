---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** QuestionFlow 题目上的多选上下限改名，与 CalendarPicker、ColorPicker、DatePicker、TimePicker 的 `maxSelected` 同一个词。

| 旧名（`questions[].…`） | 新名 |
| --- | --- |
| `maxSelections` | `maxSelected` |
| `minSelections` | `minSelected` |
