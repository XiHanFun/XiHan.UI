---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Combobox 多选时已选项在输入框前排成标签，与 Select 同一套呈现：新增 `tag-list` 部件与 `maxTagCount`（默认 3，其余合成 `+N`），标签与 +N 套库里的 tag，标签里的删除钮不占 Tab 位、按下不夺焦，删完焦点仍在输入框；新增 `api.tags` / `overflowCount` / `overflowText` / `deselect`，文案 `translations.deleteItem` / `overflowTag`。已选项被宿主筛出候选后，标签仍显示选中那一刻的文字。Vue / React 的自动结构在 `multiple` 时直接铺出标签行；手写时用 `XhComboboxTagList`、`XhComboboxTag`、`XhComboboxTagLabel`、`XhComboboxOverflowTag`、`XhComboboxItemDeleteTrigger`，Web Components 用 `tag-list` / `tag` / `tag-label` / `overflow-tag` / `item-delete-trigger` 角色并按元素的 `tags` 渲染。输入框缺省最小宽取 `--xh-control-input-min-w`（`--xh-combobox-input-min-w` 可覆盖），行距槽 `--xh-combobox-tag-list-gap`。
