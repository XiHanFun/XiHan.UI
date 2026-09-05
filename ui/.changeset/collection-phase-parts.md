---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**集合件的三种非条目相位补齐：空 `empty`、在途 `loading`、还有更多 `load-more-trigger`。**

同一个库里「筛完没有结果」这件事，级联和组合框有正式部件、树没有；「远程取数在途」只有表格有；「还有更多，去取下一页」哪家都没有。三条本来就是同一件事——集合件在没有条目可看时处在哪一种相位——现在按同一套名字、同一套收放判据铺开。

**`loading` 部件**给到八家：`select` / `combobox` / `tree-select` / `cascader` / `mention` / `transfer` / `listbox` / `tree`。配一个新的 `loading?: boolean` prop，缺省 `false`，不写即与此前逐像素相同。为真时条目容器报 `aria-busy`，在途占位顶上来、空态占位让位——两者摆在同一个位置，永远不同屏。给了 `collection` 时收放全归连接层；条目手写时库数不出有几条，那一档只按 `loading` 收放，其余归作者。相位判据与 `table` 一致：已经有条目可看时两个占位都不顶上来。

**`empty` 部件**补给 `tree`（放在 `root` 里、`tree` 的兄弟——`role=tree` 只许拥有 `treeitem` 与 `group`）。其余七家此前已有。

**`load-more-trigger` 部件**给 `table` 与 `listbox`，与 `infinite-scroll` 上那一颗同名同角色：还有没有下一页、点了做什么都归作者，连接层只保证取数在途与整列禁用两档点不动，并按 `data-loading` / `data-disabled` 转述给皮肤。它是一颗铺满一行的按钮，带悬停底色与按压缩放。

八家的根节点同时多出 `data-loading` 一位，供作者接线；在途的观感由只在取数期在场的 `loading` 部件承载，不额外压灰任何东西。

**新增部件**：`loading` × 9（含 `table` 已有的那一份不计）、`empty` × 1、`load-more-trigger` × 2。**新增 Vue 组件导出**：`XhSelectLoading`、`XhComboboxLoading`、`XhTreeSelectLoading`、`XhCascaderLoading`、`XhMentionLoading`、`XhTransferLoading`、`XhListboxLoading`、`XhTreeEmpty`、`XhTreeLoading`、`XhListboxLoadMoreTrigger`、`XhTableLoadMoreTrigger`。
