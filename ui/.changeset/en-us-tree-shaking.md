---
'@xihan-ui/headless': patch
---

**修复** 英文默认文案里树的那一份改回逐条写出拖拽播报，不再展开 `DRAG_EN_US`：对象展开打包器不认作无副作用，这一份摇不掉，进了每个引用默认文案的组件的包（只用 `XhMarkdownStreamRoot` 时多出约 250 B）。文案内容不变。
