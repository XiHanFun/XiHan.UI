---
'@xihan-ui/headless': patch
'@xihan-ui/web-components': patch
---

FloatButton 的 root 几何（贴边距离等）改为逐条的内联自定义属性：Web Components 只写、只撤自己的那几条 `--xh-_float-button-*`，作者写在 root 上的内联样式（如 `position: static`）不再被整串覆盖。此前 `<xh-float-button>` 里写在 root 上的内联样式会在接线时丢掉，文档里排在示例框内的浮动按钮全部落到了页面右下角。
