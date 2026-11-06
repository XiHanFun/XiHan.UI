---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': minor
---

**调整** 分段控件（RadioGroup `variant="segmented"`）的选中段、切换按钮组（ToggleGroup 缺省形态）的选中段、切换按钮（Toggle）的按下态与工具栏（Toolbar）的 `aria-pressed` 项改为实心主色、字反白，与实心按钮同一块面；原先是品牌淡底 + 品牌字，在一排浅灰的段里不够醒目。

- 令牌：`--xh-bg-segment-selected` 改为与 `--xh-bg-brand` 同值，`-hover` 与 `--xh-bg-brand-hover` 同值，`-disabled` 改为主色往承载面兑一半；`--xh-fg-segment-selected` 与 `-disabled` 都改为与 `--xh-fg-on-brand` 同值。墨色域里分段选中面与实心品牌面同口径（墨色实心 / 88% / 50%，字取域底色）。
- 分段控件：语气档（`tone`）的滑块换成语气的实心面、字取面上前景；选中段拿到键盘焦点时焦点环内侧衬一道底色间隔线；打印时选中段的字换回常规字色（面印不出来，反白字会消失）。
- 切换按钮组：不写 `variant` 时选中段与 `solid` 档同为实心主色（未选中段仍坐在中性淡底的壳上），语气档走语气的实心面；要原来的淡底选中段写 `variant="subtle"`。
- 切换按钮：四档形态按下时一律实心主色，变体只决定未按下时的样子；按下态带实心面的顶边内高光（经影槽交付；`solid` 档原先把这条高光写进了渐变用的颜色槽，从未画出来，一并修正），键盘焦点环内侧衬底色间隔线，打印时字换回常规字色。
- 工具栏：`aria-pressed` 项同为实心主色 + 反白（`--xh-toolbar-item-bg-pressed` / `-pressed-hover` / `-pressed-active` / `--xh-toolbar-item-fg-pressed` 的缺省值跟着换），描边同色；禁用且按下的项底色掺一半中性面、字留反白，新增 `--xh-toolbar-item-bg-pressed-disabled` 可改它；键盘焦点环内侧衬底色间隔线，打印时字换回常规字色。`toolbar.css` 因此涨约 1.3 KB：按下项多映射了聚焦、禁用、描边与高光几支桥接槽，并加了打印规则。

视觉快照里有这几种控件选中段的要更新；覆盖过 `--xh-bg-segment-selected` / `--xh-fg-segment-selected` 或工具栏按下项槽位的主题按新口径核一遍。
