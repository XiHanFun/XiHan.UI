---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

命令面板改用标准结构：新增 `commandStructure` 与 `CommandStructureOptions`，触发按钮（给了内容才铺）、遮罩，定位层里的面板依次是检索框、按整份清单分好组的结果列表、空态与在途占位、页脚（给了内容才铺）。Vue / React 不写默认插槽时照它铺；Web Components 的 `<xh-command>` 不写部件时直接在自己里面生成，触发按钮、空态、页脚与条目文字可用 `slot="trigger"`、`slot="empty"`、`slot="footer"`、`slot="item:<值>"` 等给出。结构节点的标签新增 `footer`。
