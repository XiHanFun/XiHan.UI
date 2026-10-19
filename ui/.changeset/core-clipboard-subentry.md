---
'@xihan-ui/core': minor
'@xihan-ui/headless': patch
---

新子入口 `@xihan-ui/core/clipboard`：`writeToClipboard(source, text)` 往系统剪贴板写一段文本，只走 `navigator.clipboard.writeText`，接口缺席、同步抛错都翻成 promise 拒绝。`source` 给 window，或给能取出 window 的对象（`ClipboardWindowSource`，状态机的 scope 就是），设计器零件这类不在状态机里的代码也能直接用。`@xihan-ui/headless` 的 `writeToClipboard` 改为转出这一份，原来的写法照用。
