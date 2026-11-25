---
'@xihan-ui/core': minor
---

**新增** 层的 `passesEscape`：登记了它的层不收 Escape，Escape 越过它交给下面最近一个收 Escape 的层；栈里只剩这类层时，Escape 照常落到页面的 Escape 兜底。给只管焦点、自己不消解的层用（焦点圈定），放进对话框里时 Escape 仍然关掉对话框。
