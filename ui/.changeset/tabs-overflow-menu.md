---
'@xihan-ui/core': minor
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

Tabs 放不下时可以在标签带行尾放一颗「更多」下拉：新增 `overflow-trigger` 部件（Vue / React `XhTabsOverflowTrigger`，Web Components 在 root 里、紧跟 list 之后写一颗空的 `<button data-xh-part="overflow-trigger">`）。标签带放不下时钮露面，点开是一张 Menu，列出此刻没有整个露在可见区里的标签（可见区扣掉两端显示着的翻页钮，半露的也列），选中一项即选中那个标签并把它挪进可见区；宽度够时钮收起。标签不会被收起，始终留在标签带与 tablist 里，下拉只是可见区外标签的索引，随标签带位移换项；钮的有无只取决于全部标签放不放得下，与翻页钮同进同退，不会因为钮自己挤窄了标签带而一直留着。

- 键盘：钮在 tablist 之外、紧跟标签带自占一个 Tab 位，不是方向键走位的一站（方向键只在标签之间走、尽头回绕）；Enter / Space / ArrowDown 展开并落到首项，ArrowUp 落到末项，Escape 收起、焦点回到钮上，选中一项后菜单收起、焦点同样回到钮上。
- 钮接 Action Control 的 icon 档、ghost 形态，与两端翻页钮同档、与标签同高；不写内容时皮肤画一枚横排三点，菜单开着时与悬停同档的中性面；竖排时排在标签带那一列的列尾、横贯列宽。可及名缺省 `More tabs`，由新增的 `translations.overflowTrigger` 换成本地文案。
- headless：`TabsApi` 新增 `overflowItems` 与 `getOverflowTriggerProps()`，新增 `tabsOverflowMenuProps(service)`（喂给菜单的机器 props）与类型 `TabsOverflowItem`；`TabsTranslations` 新增 `overflowTrigger`。
- core：新增 `overflowOutsideWindow` 与类型 `OverflowSpan`：滚动带里落在可见窗口之外的条目，与 `fitOverflowCount` 同一把舍入余量。
- Web Components：`<xh-tabs>` 新增 `portalContainer` property；下拉的定位层、列表与条目由元素自己建，与工具条的「更多」菜单共用一套。

皮肤 tabs.css 涨在「更多」钮一节：放了钮的 root 换成两轨网格（钮排在标签带之后、面板横跨两轨），钮的尺寸、兜底字形、打开态、竖排落位与打印时隐藏；另修竖排限了高时标签被压扁到一行字高的问题——标签保持控件高，放不下的那截靠位移露出。
