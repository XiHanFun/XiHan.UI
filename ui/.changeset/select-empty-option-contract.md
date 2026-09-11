---
'@xihan-ui/headless': patch
---

Select 在初始异步加载或无选项时允许 `list` 内没有 `item`。移除静态元数据中错误的必需选项要求，
保留 trigger / content / list 的结构约束；加载与空态继续由独立的正式部件表达，不用禁用假选项占位。
