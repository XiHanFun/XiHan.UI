---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Cascader 多选的已选路径在触发器里排成标签，与 Select、TreeSelect 同一套呈现：新增 `tag-list` 部件与 `maxTagCount`（默认 3，其余合成 `+N`），标签与 +N 套库里的 tag、走标签行家族配方与列表动效，文字是整条路径按 `separator` 连缀；触发器外可放带删除钮的标签。标签身份写路径的比较键（`api.tags` 里的 `key`）。新增 `api.tags` / `overflowCount` / `overflowText` / `deselect(path)`、`getTagListProps` / `getTagProps({ value })` / `getTagLabelProps` / `getOverflowTagProps` / `getItemDeleteTriggerProps({ value })`、类型 `CascaderTagMeta` / `CascaderTagProps` 与文案 `translations.deleteItem` / `overflowTag`。Vue / React 新增 `XhCascaderTagList`、`XhCascaderTag`、`XhCascaderTagLabel`、`XhCascaderOverflowTag`、`XhCascaderItemDeleteTrigger`；Web Components 用 `tag-list` / `tag` / `overflow-tag` / `item-delete-trigger` 角色并按元素的 `tags` 渲染，另补 `tags` / `overflowCount` / `overflowText` 读口与 `deselect` 方法。行距槽 `--xh-cascader-tag-list-gap`。
