---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

`@xihan-ui/headless` 与三个适配器改为依赖 `@xihan-ui/expression`：装了任意一个适配器就有受限表达式，不必再单独安装。只用表达式、不用组件时仍可单独安装。
