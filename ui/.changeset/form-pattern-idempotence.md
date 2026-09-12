---
'@xihan-ui/headless': patch
---

修复表单正则规则复用带 g/y 标志的 RegExp 时，同一输入交替通过和失败的问题。
每次校验独立匹配，不读取或修改调用者的 lastIndex；同步首败即停和异步规则顺序保持一致。
