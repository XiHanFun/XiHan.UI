---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': minor
---

**调整** 分段控件（RadioGroup `variant="segmented"`）与切换按钮组（ToggleGroup 缺省形态）的选中段改为实心主色、字反白，与实心按钮同一块面；原先是品牌淡底 + 品牌字，在一排浅灰的段里不够醒目。

- 令牌：`--xh-bg-segment-selected` 改为与 `--xh-bg-brand` 同值，`-hover` 与 `--xh-bg-brand-hover` 同值，`-disabled` 改为主色往承载面兑一半；`--xh-fg-segment-selected` 与 `-disabled` 都改为与 `--xh-fg-on-brand` 同值。墨色域里分段选中面与实心品牌面同口径（墨色实心 / 88% / 50%，字取域底色）。
- 分段控件：语气档（`tone`）的滑块换成语气的实心面、字取面上前景；选中段拿到键盘焦点时焦点环内侧衬一道底色间隔线；打印时选中段的字换回常规字色（面印不出来，反白字会消失）。
- 切换按钮组：不写 `variant` 时选中段与 `solid` 档同为实心主色（未选中段仍坐在中性淡底的壳上），语气档走语气的实心面；要原来的淡底选中段写 `variant="subtle"`。单独一枚的 Toggle 与 Toolbar 的按下项不变，仍是品牌淡底。

视觉快照里有这两种控件选中段的要更新；覆盖过 `--xh-bg-segment-selected` / `--xh-fg-segment-selected` 的主题按新口径核一遍。
