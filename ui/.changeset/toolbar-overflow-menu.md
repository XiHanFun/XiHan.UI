---
'@xihan-ui/core': minor
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Toolbar 放不下时可以把条目收进行尾的「更多」菜单：新增 `overflow-trigger` 部件（Vue / React `XhToolbarOverflowTrigger`，Web Components 在 root 末尾写一颗空的 `<button data-xh-part="overflow-trigger">`）。放了它的工具条不再折行，宽度不够时放不下的条目按文档序从尾部起收起，钮露面，点开是一张 Menu：菜单里的文字取条目的可及名，写了 `aria-pressed` 的开关条目是勾选项，工具条上的分组与分隔线在菜单里画成分隔线，选中一项即替收起的条目触发它自己的点击；全部放得下时钮收起。容器变宽变窄、条目增减或改写、字体加载后自动重算，焦点所在的条目被收起时焦点交给「更多」钮。没放钮的工具条照旧折行。

- 键盘：「更多」钮是方向键走位的最后一站（End 落到它上面，收起的条目跳过）；横排时 ArrowDown / ArrowUp / Enter / Space 展开菜单，竖排时上下键仍归工具条走位；Escape 收起菜单、焦点回到钮上。工具条只接没被条目处理过的方向键：菜单触发器用上下键展开菜单时不再同时走位。
- 钮接 Action Control 的 icon 档、ghost 形态，与条目同档；不写内容时皮肤画一枚横排三点，菜单开着时与悬停同档的中性面。可及名缺省 `More`，由新增的 `translations.overflowTrigger` 换成本地文案（Toolbar 新增 `translations` prop）。
- headless：`ToolbarApi` 新增 `overflowItems` 与 `getOverflowTriggerProps()`，新增 `toolbarOverflowMenuProps(service)`（喂给菜单的机器 props）、`toolbarOverflowTriggerQuery` 与类型 `ToolbarOverflowItem`、`ToolbarRefs`；机器新增 `getRootEl` ref，适配器在挂载前交出 root 节点。
- core：新增溢出收纳原语 `fitOverflowCount`、`measureOverflowLayout`、`trackOverflowLayout` 与类型 `OverflowAxis`、`OverflowLayout`、`MeasureOverflowOptions`、`TrackOverflowOptions`。
- Web Components：`<xh-toolbar>` 新增 `translations` 与 `portalContainer` 两个 property；「更多」菜单的定位层、列表与条目由元素自己建。

皮肤 toolbar.css 涨在收纳一节：放了钮的根不折行、条目不压缩，收起后多出的分隔线与收空的分组让开，组里留下的最后一段补回末端圆角，以及钮的兜底字形、打开态与收起规则，体积基线随之重落。
