---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

卡片改用标准结构：新增 `cardStructure` 与 `CardStructureOptions`，给了标题或说明才铺页头（标题在前），给了正文、页脚才铺对应一段。Vue 的 `XhCardRoot` 不写默认插槽时照它铺，新增 `title`、`description`、`content`、`footer` 四个具名插槽；React 的 `XhCardRoot` 不给 children 时照它铺，新增同名的四个属性（取 ReactNode，`title` 与 `content` 不再透传为根节点上的原生属性）；Web Components 的 `<xh-card>` 不写部件或只写 `root` 时按它生成，宿主直接子节点写 `slot="title"` 等即搬进对应部件。
