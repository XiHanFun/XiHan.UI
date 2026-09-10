---
'@xihan-ui/core': patch
---

FocusScope 的存活序列改为按 Document 隔离。iframe 或画中画窗口中较晚建立的焦点域不再阻止当前文档归还焦点；同一文档中更新焦点域的接管语义保持不变。
