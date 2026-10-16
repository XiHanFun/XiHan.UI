---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': minor
---

热力图（Heatmap）的事件、受控键、加载与空态改为与其余图表同一套约定，Web Components 端只写 `root` 时由元素生成整套结构。

破坏性改动：

- 事件改名：`cell-press` → `datum-press`（`onCellPress` → `onDatumPress`），`cell-active` → `datum-active`（`onCellActive` → `onDatumActive`）。
- 删除 `cell-focus` / `onCellFocus`：键盘聚焦与指针悬停都经 `datum-active` 报告。
- 类型 `HeatmapCellDetails` 改名为 `HeatmapDatumDetails`，并新增 `key`（日期形态是 ISO 日期，矩阵形态是 `heatmapMatrixKey(row, column)`）与 `formatted.value`（按 `format` 写好的数值）；删除 `HeatmapCellFocusDetails`。
- `translations.cellLabel` / `matrixCellLabel` 的参数换成 `HeatmapDatumDetails`，各语言的内建文案改写 `formatted.value`，数值按 `locale` 带千分位。
- `heatmapDetailsOf` 的返回值随之换成 `HeatmapDatumDetails`。

新增：

- `activeKey`（受控）与 `onActiveKeyChange` / `active-key-change`：指针与键盘都不在网格上时，键命中的那一格描出与悬停相同的一圈，用来联动；Vue 可写 `v-model:active-key`。联动键只认字符串：日期形态写 ISO 日期串，矩阵形态写 `heatmapMatrixKey(row, column)`，`Date` 对象不匹配。
- `pending`：网格保留上一帧并按 `--xh-chart-pending-alpha` 淡下去，根上 `aria-busy`。
- `empty` 部件（Vue / React 组件 `XhHeatmapEmpty`，Vue 插槽 `empty`，React `renderEmpty`）：网格里一条数据都没有时叠在热力图上；取数中改写加载文案。`translations` 新增 `emptyText`、`loadingText`，`api` 新增 `empty`、`emptyText`、`activeKey`、`getEmptyProps`。
- `format`：数值格式（`NumberFormatSpec` 或函数），详情、格子的可访问名称与发散色阶对照条两端共用。
- 标准结构：headless 新增 `heatmapStructure(api, options)`（选项类型 `HeatmapStructureOptions`）与通用的结构节点类型 `StructureNode`。三端的缺省树都照它渲：Vue / React 不写默认插槽时、Web Components 只写 `root` 时，铺出的是同一棵树。
- Web Components：`root` 里没有作者写的 `grid` 时，元素按形态生成与 Vue / React 缺省树一致的结构（带 `data-xh-gen`，按身份复用）；作者另写的 `tooltip`、`empty`、`legend` 保留。写了 `grid` 时照旧由作者手写。

迁移：

- 全文搜索 `cell-press`、`cell-active`、`cell-focus`、`onCellPress`、`onCellActive`、`onCellFocus`，换成 `datum-press` / `datum-active` / `onDatumPress` / `onDatumActive`；只关心键盘聚焦的改听 `datum-active`。
- 全文搜索 `HeatmapCellDetails`、`HeatmapCellFocusDetails`，换成 `HeatmapDatumDetails`。
- Web Components 端手写整棵树、只为铺出缺省结构的，删掉 `root` 里的节点与铺设脚本即可。
