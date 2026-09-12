---
'@xihan-ui/headless': major
'@xihan-ui/styles': minor
---

建立由单一 JSON 真源生成的 Field Chrome Family Recipe，统一 single-line、textarea、multi-tag 三类布局，sm/md/lg 与 compact 尺寸，以及 rest、hover、focus、invalid、readOnly、disabled、loading 状态。

TextField 首批迁入：Headless 改用 `data-xh-field-*` 投影字段视觉角色，并让 clear 复用 Action Control 的 `field-inset` / `has-value` 合同；移除旧 `data-multiline`、`data-auto-resize` 视觉钩子。独立皮肤与 full bundle 均包含同一份 Field Chrome、placeholder/autofill/forced-colors/reduced-motion 与粗指针 clear 规则。
