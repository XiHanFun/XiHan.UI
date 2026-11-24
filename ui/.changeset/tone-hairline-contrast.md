---
'@xihan-ui/styles': patch
---

**修复** 语气色画成细线与色条时取保证 3:1 的那一档：Progress 的填充（线形与环形）、Spinner 的弧与三点、Approval 待决时的语气描边此前取裸主色，浅色档下的 warning 只有 2.70:1，现在与 LoadingBar、Timeline、ToolCall 色条一样取按主题兜过底的那一档（浅色 warning 取 700），缺省品牌色不变。Icon 描边框写了语气时的描边从兑了底色的 40% 档改取控件描边档，与 Tag 的描边档一致。
