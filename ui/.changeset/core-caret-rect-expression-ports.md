---
'@xihan-ui/core': minor
---

新增 `caretClientRect(element, index)`：给出 `<input>` / `<textarea>` 里某个字符位置的光标矩形（视口坐标，纵向是光标所在那一行，扣掉输入框自己的滚动），可以直接当浮层的虚拟锚点。多行输入按当前内容宽度软换行。

新增表达式输入框的宿主端口类型：`ExpressionCheck`（检查函数）、`ExpressionInputIssue`，以及宿主补全来源 `ExpressionCompletionSource`、`ExpressionCompletion`、`ExpressionCompletionQuery`、`ExpressionCompletionKind`。
