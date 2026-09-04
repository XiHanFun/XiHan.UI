---
"@xihan-ui/tokens": minor
"@xihan-ui/styles": minor
---

**字段族标签收进一份公共层。** 新增 `css/label.css`，按 `[data-part='label']` 给列出的 18 个 scope 画两条逐值相同的规则：行距取 `--xh-leading-none`，禁用档字色取 `--xh-fg-subtle`。原先这两条散在 18 份皮肤里各写一遍（22 处声明、其中 4 条整块规则），现在收成 2 条。

字色、字号、字重三条仍留在各组件皮肤：它们挂着 `--xh-<组件>-label-*` 覆盖槽，槽名里带组件名，写不进一条共享规则。scope 逐个列出而不写通配：`label` 这个部件名在标签、统计、进度、推理、说明列表上指的是另一种文字。

按需引入的人多引一份：`import '@xihan-ui/styles/label.css'`，位置排在组件皮肤之前。

**`--xh-border-control-focus` 改指聚焦环色。** 它原先指着 `{border.control}`，四个档位下与常态描边逐值相同——输入类控件聚焦时那道描边过渡不出任何变化。现在指 `{ring.focus}`（浅色 brand-500、深色 brand-400），聚焦时描边与聚焦环同色。

跟着换色的还有三处把它当默认值消费的指示条：表格的列宽拖拽条与放置条、标签页的放置条，拖拽中由中性灰变品牌色。要钉回中性色的写 `--xh-table-resize-fg-active` / `--xh-table-drop-fg` / `--xh-tabs-drop-fg`。

覆盖槽名、部件名与 `data-*` 取值一个没删也没改名。
