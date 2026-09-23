---
'@xihan-ui/styles': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
---

TagGroup 选中标签的对号从文字前移到文字后，与集合行「对号一律在行尾」统一。

- 皮肤按顺序排：对号排在文字与作者内容之后、摘除钮之前，作者在格里把 `item-indicator` 写在哪儿都一样。
- Vue / React 不传结构时的默认渲染同步改成「文字 → 对号 → 摘除钮」。
- 选中的淡底、配对前景与按压反馈不变。
