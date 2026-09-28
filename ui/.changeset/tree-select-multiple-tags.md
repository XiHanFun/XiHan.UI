---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

TreeSelect 多选的已选项在触发器里排成标签，与 Select 同一套呈现：新增 `tag-list` 部件与 `maxTagCount`（默认 3，其余合成 `+N`），标签与 +N 套库里的 tag、走标签行家族配方与列表动效；触发器外可放带删除钮的标签。新增 `api.tags` / `overflowCount` / `overflowText` / `deselect` 与文案 `translations.deleteItem` / `overflowTag`。Vue / React 的自动结构在 `multiple` 时直接铺出标签行，手写时用 `XhTreeSelectTagList`、`XhTreeSelectTag`、`XhTreeSelectTagLabel`、`XhTreeSelectOverflowTag`、`XhTreeSelectItemDeleteTrigger`；Web Components 用 `tag-list` / `tag` / `overflow-tag` / `item-delete-trigger` 角色并按元素的 `tags` 渲染，另补 `deselect` 方法。行距槽 `--xh-tree-select-tag-list-gap`。
