---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

气泡确认框（Popconfirm）的 content 只引用作者渲染了的标题与说明，与对话框同一套写法：没写 title 时不写 `aria-labelledby`，名字由作者在 content 上写 `aria-label`；没写 description、或说明读不出一句话时不写 `aria-describedby`。它跑的是弹出层那台机器，在场情况经 `PopoverSchema` 的 `parts` 交给 connect。
