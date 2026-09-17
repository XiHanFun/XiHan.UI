---
"@xihan-ui/headless": minor
"@xihan-ui/styles": minor
---

**Table 表体行接入 Collection Item 配方，选中行改品牌淡底；把手按下换底，排序把手与取页钮补按压面。**

- 表体行投影 `data-xh-collection-item` / `-size` / `-context='page'`（表头 / 脚注行不投影）；行盒几何逐项盖回：flex、零内衬、零圆角、默认光标，吸附列照旧 inherit 行底。悬停 100、按下 200 只换面（此前按下零反馈）；选中行由中性 `--xh-bg-subtle-active` 改为 `--xh-bg-brand-subtle` 行面 + `--xh-fg-on-brand-subtle` 前景，selected + hover 20%、+ pressed 28%；选中行的焦点环回默认环色。斑马纹改写家族的 rest 槽，悬停 / 选中 / 落点仍按原先先后盖过它。公开槽名不变，新增 `--xh-table-row-bg-pressed` / `--xh-table-row-fg-selected` / `--xh-table-row-cursor`。
- 四颗把手按下在 0.97 缩放之外同时换底：空框与展开箭头落 200 档（`--xh-table-trigger-bg-pressed`），已勾选的品牌实心框落 `--xh-bg-brand-active`（`--xh-table-trigger-bg-checked-pressed`）；勾选方框圆角改 `--xh-shape-inset` 档（与 control 同值，身份归位）。
- 排序把手补悬停 / 按下面：坐在表头淡底上，hover 200 → pressed 300 只换面（`--xh-table-sort-bg-hover` / `-pressed`）。
- 取页钮接 Action Control `row` 档 ghost 形态：铺满一行只换面不缩放（此前缩放且不换底）。
- 拖行「放进这一行里」的落点面由品牌淡底改为 `--xh-bg-subtle-hover`：品牌淡底专属选中。
- 根上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档。
