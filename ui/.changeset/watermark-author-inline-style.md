---
'@xihan-ui/headless': patch
'@xihan-ui/web-components': patch
---

Watermark 的图样与步距改为逐条的内联自定义属性：Web Components 只写、只撤自己的那两条 `--xh-watermark-image` 与 `--xh-watermark-tile`，作者写在 root 上的内联样式（如 `max-inline-size: 20rem`）不再被整串覆盖，文字清空时也只撤这两条。此前 `<xh-watermark>` 里写在 root 上的内联样式会在接线时丢掉，文字清空时整条 `style` 还会被一并移除。
