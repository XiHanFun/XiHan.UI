---
"@xihan-ui/designer-shell": patch
---

属性面板换了选中对象时，复用的那一行交给宿主自定义编辑器的 `context.target` 跟着换成新选中的对象。原来 `update` 收到的 `target` 一直是这一行第一次建出来时的对象，值与 `setValue` 却已经是新的，编辑器按选中对象给的提示会给错。
