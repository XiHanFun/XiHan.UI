---
'@xihan-ui/headless': patch
'@xihan-ui/web-components': patch
---

Truncate 的行数改为逐条的内联自定义属性：Web Components 只写、只撤自己的那一条 `--xh-_truncate-lines`，作者写在 root 上的内联样式（如 `max-inline-size: 20rem`）不再被整串覆盖。此前 `<xh-truncate>` 里写在 root 上的内联样式会在接线时丢掉。
