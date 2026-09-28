---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Segmented 新增段内图标：节点新增 `icon` 字段（图标文本），新增 `item-icon` 部件（Vue / React 为 `XhSegmentedItemIcon`，Web Components 写 `data-xh-part="item-icon"`），排在文字前、对读屏隐藏，状态标记与段一致；只传 `collection` 时写了 `icon` 的段自动铺出图标位。皮肤在根上按尺寸档下发 `--xh-icon-size`（sm / md / lg 对应三档图元直径），放进来的图标组件与裸 svg 取同一直径，颜色随段的前景色；新增组件槽 `--xh-segmented-icon-size`。需要放置图形时手写部件，把图标组件或 svg 放进 `item-icon`。
