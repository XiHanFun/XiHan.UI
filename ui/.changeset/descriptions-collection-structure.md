---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** Descriptions 新增 `collection`（条目字段 `value`、`label`、`content`、`span`；`value` 是条目身份），只给它时按标准结构在 `dl` 里一组一格铺出 `dt` / `dd`；取值可由 Vue 的 `value` 插槽、React 的 `renderValue`、Web Components 的 `slot="value:<身份>"` 接管，头部照旧经 `header`。headless 新增 `descriptionsStructure`、`DescriptionsNode`、`DescriptionsNodeMeta`、`DescriptionsStructureOptions` 与 api 的 `collection`。
