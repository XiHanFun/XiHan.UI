---
'@xihan-ui/styles': patch
'@xihan-ui/web-components': patch
---

Web Components 字段族宿主的 `display: contents` 改由皮肤声明（零特指度），元素不再在连接时往宿主写内联 `display`。作者给宿主写的 `display` 无论在内联还是样式表里都照层叠胜出，写在宿主上的宽度与外边距随之生效；此前样式表里的规则会被内联的 `contents` 压过。带 `hidden` 的宿主也不再被内联 `contents` 掀开。不加载皮肤时宿主回到行内盒。
