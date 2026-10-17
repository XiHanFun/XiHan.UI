---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

对话框（Dialog）的 content 只引用作者渲染了的标题与说明：

- 没写 title 时不写 `aria-labelledby`，名字由作者在 content 上写 `aria-label`；没写 description、或说明读不出一句话时不写 `aria-describedby`。此前两条恒写，部件不在场时引用落空。
- headless：`DialogSchema` 的 props 新增 `parts`（类型 `TitleDescriptionParts`），由适配器统计两个部件在不在场；省略即按都在场处理，服务端直出与挂载前的输出不变。
- 三端照字段（Field）的写法统计：Vue / React 的标题与说明部件挂载时登记、卸载时撤销，Web Components 看作者写没写这两个角色节点，并观察说明的文字。对话框服务（dialog service）经同一套部件渲染，一并生效。
