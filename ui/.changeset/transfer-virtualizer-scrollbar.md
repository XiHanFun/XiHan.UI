---
"@xihan-ui/headless": patch
"@xihan-ui/vue": patch
"@xihan-ui/react": patch
"@xihan-ui/web-components": patch
---

修正 Transfer 与 Virtualizer 组合时的滚动条接线：三端自绘滚动条改为跟随每侧真实的 Virtualizer viewport，隐藏原生滚动条，并保持面板布局与普通 Transfer 一致。
