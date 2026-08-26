---
"@xihan-ui/tokens": minor
"@xihan-ui/styles": minor
---

浮层里的条目之间加 2px 行距，新增语义令牌 `--xh-list-option-gap` 统一这把尺。

**下拉里选中项与悬停项贴成一整块。** a11 的选中蓝底与 b22 的悬停灰底之间没有一丝缝，
两块底色首尾相接，读起来像一条被涂了两截颜色的长条而不是两个条目。

**库内自己就有三种方言**：浮层选项列（time-picker / date-picker 的时间列与预设列）已经是
2px，页面导航列（side-nav / navigation-menu）是 4px，下拉、菜单、树这一族是 0。补上 2px
是把这一族拉回库内既有的口径。

`list` 组的描述原文写着「option-\* 给浮层里的条目——菜单项、下拉选项、树行、时间列」，
新令牌落在这一组：`--xh-list-option-gap: 2px`。compact 档不覆盖，2px 已是最小档。

22 个条目的直接父容器接上这把尺：select 的 `list`；combobox / listbox 的 `content` 与
`item-group`；popselect 与 mention 的 `content`；menu / menubar / context-menu 的 `content`
与 `group`；cascader 的 `column` 与 `search-list`；tree 与 tree-select 的 `tree`、
`branch-content`、`branch`；transfer 的 `list`。装 list 加 footer 的外壳（select /
tree-select 的 `content`）不接——它不是条目的父层。json-viewer 也不接，只读数据视图与
table、log 同为紧排一档。

`tree` 与 `tree-select` 的 `branch` 此前是块盒，为接这把尺改成纵向 flex，tree-select 同时
补上此前缺的 `[hidden]` 兜底。

节奏顺手收一级，加了 gap 之后总量不变：combobox 与 listbox 的组间距 8px → 6px，
menu / menubar / context-menu 的分隔线外边距 4px → 2px。time-picker 那两处等值的
`--xh-space-0_5` 改指新令牌，视觉不变。

这把尺打在容器上，所以分组标题与它下面第一条之间同样多出 2px——分组标题是 `group`
的第一个子元素，与条目同属一层 flex 子项。
