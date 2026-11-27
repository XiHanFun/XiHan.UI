---
'@xihan-ui/headless': patch
---

**修复** FileUpload 开了 `directory` 时，React 里的隐藏输入没有带上 `webkitdirectory`，点开的仍是选文件而不是选目录：连接层原先给这个属性写布尔 `true`，React 不认这个属性名，会丢掉它并报警告。现在按 DOM 口径写空串表示在场，Vue、React 与 Web Components 都带得上。
