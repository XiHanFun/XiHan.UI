---
'@xihan-ui/web-components': patch
---

配置变化只叫醒受影响的元素：`<xh-config>` 改了 locale / size / 文案 / 落点、或进出文档时，只通知它子树里的元素重新接线；只改视觉轴（mode、brand、density、direction、contrast、motion、transparency、material）时不再通知——这些轴由视觉环境控制器写到节点上、交给 CSS 生效，元素解析到的配置里本来就没有它们。此前任一 `<xh-config>` 的任何属性变化（包括切主题）都会让页面上所有元素各自遍历子树、沿祖先链重新解析并重新接线一遍。全局配置（`setXhConfig`）变化照旧通知全部元素。`onXhConfigChange` 新增可选的第二个参数 `host`：给了即只在它所在子树的配置变化时收到通知。
