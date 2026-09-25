---
'@xihan-ui/viz': minor
---

`@xihan-ui/viz` 新增无障碍模型：只算事实，文案模板由调用方按语言提供。

- `buildSummaryModel` / `summarize`：系列数、自变量范围、各系列的最小值与最大值及其位置、首末值与变化率；缺失值不计，最值相同时取先出现的。
- `buildTableModel`：第一列是自变量、其后每个系列一列，行是全部系列的键按首次出现的次序去重，缺失值显示调用方给的文字；数据表部件与作者自建的表格视图共用。`buildLinkTableModel` 输出 source / target / value 三列。
- `buildTraversal` / `navigate`：数据层里可聚焦的标记按系列分行、行内按数据位置排序，折线与面积按点展开成遍历项（焦点代理以「标记键:点键」为 id）；系列内移动到头不回绕，换系列保持位置，支持首尾与翻页。
