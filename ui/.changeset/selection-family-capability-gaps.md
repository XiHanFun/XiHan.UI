---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**选择与开关族补七项能力，全部是加法：不渲染新部件、不写新 prop 的既有用法逐值不变。**

**`select` / `cascader` / `transfer` 补 `group` 与 `group-label` 两个部件。** 段落壳是 `role=group`（列表框允许拥有的两种子节点之一），段标题经 `aria-labelledby` 挂上来；条目照旧归到同一份集合，方向键与连打检索跨段贯通。三家的段标题与条目同一个 `padding-inline`，标题与条目文字因此在一条竖线上。`transfer` 的分组两侧各挂一份，身份连 `side` 一起算，两边的标题 id 不会撞；组内条目搬空或被搜索筛净时整段连标题一起收起。Vue 侧新增 `XhSelectGroup` / `XhSelectGroupLabel`、`XhCascaderGroup` / `XhCascaderGroupLabel`、`XhTransferGroup` / `XhTransferGroupLabel`，Web Components 侧各新增两个 `csspart`（段落壳自报 `value`）。新增类型 `SelectGroupProps` / `CascaderGroupProps` / `TransferGroupProps`。

**`cascader` / `tree-select` 补 `footer` 部件**，与 `select` 的那条同一件事：浮层底部的操作区，写在 `content` 里，不进列表框与树的拥有关系，方向键与连打检索都走不到。`cascader` 的底栏横跨全部列——底栏在场时浮层壳才允许换行，没写它的浮层列多到放不下时仍是整体横向滚动。Vue 侧新增 `XhCascaderFooter` / `XhTreeSelectFooter`。新增覆盖槽 `--xh-cascader-footer-gap` / `-py` / `-px` / `-border` / `-font-size` 与同名的 `--xh-tree-select-footer-*` 五支。

**`select` / `listbox` / `tree-select` / `transfer` 补 `empty` 部件。** 它一律待在列表框（或 `role=tree`）之外：`select` 与 `tree-select` 放 `content` 里当 `list` / `tree` 的兄弟，`listbox` 放 `root` 里当 `content` 的兄弟，`transfer` 放面板里当 `list` 的兄弟。露不露面的判据分两档：`transfer` 按本侧此刻可见的条目数由连接层收放；另外三家给了 `collection` 才由连接层按条数判定，条目手写时库数不出有几条，那一档不写 `hidden`，收放归作者。Vue 侧新增 `XhSelectEmpty` / `XhListboxEmpty` / `XhTreeSelectEmpty` / `XhTransferEmpty`。新增覆盖槽为四家各三支 `--xh-<组件>-empty-py` / `-px` / `-fg`（另有 `-font-size`）。

**`slider` 补 `value-text` 部件**：挂在拇指里的值气泡，跟着拇指走位，默认只在推动那一刻露面（多拇指时只有手真正推着的那一个冒出来）。它是 `aria-hidden` 的，读屏仍走拇指自己的 `aria-valuetext`。新增 api `valueText(index)`：给了 `getValueText` 就是它的产出，否则是值本身；Web Components 侧留空的气泡由元素代填。新增覆盖槽 `--xh-slider-value-text-offset` / `-py` / `-px` / `-radius` / `-bg` / `-fg` / `-font-size`。

**`rating` 补 `value-text` 部件**：写在 `root` 里、`control` 的兄弟，显示当前该点亮到的那个数（指针预览期间跟着预览值走），数字等宽因此不会带着星星左右挪。它在场时根改成两列栅格，星星带与分值并排、标题仍独占一整行；没写这个部件的评分不命中那条规则，还是原来的竖排。新增 api 只读字段 `valueText`。新增覆盖槽 `--xh-rating-value-text-fg` / `-font-size`。

**`listbox` 与 `transfer` 补 `tone` / `size` / `invalid` / `readOnly` 四条轴，`checkbox-group` 补 `tone` / `size` 两条。** 尺寸只换根上的几个私有槽（条目内边距、间距、字号，以及 `transfer` / `checkbox-group` 的勾选方框直径），中档逐值等于此前写死的那一份；语气把勾选标记与勾中填色接到语气层派生好的档上，不写 `data-tone` 时退回品牌色。`listbox` / `transfer` 的只读改不动选中值但照常浏览与聚焦（`transfer` 连搬运一起封住、搜索照旧可用），校验失败在 `listbox` 落到列表框描边、在 `transfer` 落到两侧面板描边，两者同时发 `aria-readonly` 与 `aria-invalid`。两件随之登记进 `check-field-wiring` 的分组名单：它们的根有分组角色、焦点在各条目上，不是单一可聚焦控件。
