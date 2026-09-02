---
"@xihan-ui/styles": minor
---

**修复**十二处槽名与它作用的部件对不上——使用者按名字找过去，改的是另一处，或者干脆找不到名字。全部加法式：新名排在外层、旧名留在它的兜底位上，照旧名写的覆盖一条不失效。

**number-field 的一体式盒挂着输入框的名字。** 描边、底、落影、圆角与悬停/聚焦/校验失败/只读/禁用五档全画在 `control` 上，槽却叫 `--xh-number-field-input-*`，而 `input` 是同一份解剖里另一个真实部件——同为一体式盒的 text-field 与 password-input 用的都是 `-control-`。补出 `--xh-number-field-control-bg` / `-border` / `-border-hover` / `-border-focus` / `-border-invalid` / `-bg-readonly` / `-bg-disabled` / `-shadow` / `-radius` 九个。写 `-control-` 只改一体式盒那一档，独立输入框那一档不再跟着走；写旧的 `-input-` 照旧两档一起改。

**notification 的卡片十二个槽没有部件段。** 卡片是 `item` 部件，其余六个角色都带 `item-` 前缀，只有卡片自己的间距、宽度、内衬、描边、圆角、底、前景、落影、字号与行距不带；其中管内衬的 `--xh-notification-px` / `-py` 与管摞贴边的 `--xh-notification-inset` 只差一个词，改错了要在九个落位上逐个试。十二个槽各补一个 `--xh-notification-item-*`。

**另十处走样一并收口。** `password-input` 大写锁定提示的槽叫 `-hint-`（补 `--xh-password-input-caps-lock-*`）；`transfer` 面板里的头、标题与计数丢了 `panel-` 段（补 `--xh-transfer-panel-header-*` / `-panel-title-*` / `-panel-count-*`）；`tree` 叶子勾的前景少了 `item-` 段而分支那条没少（补 `--xh-tree-item-indicator-fg`）；`tree-select` 的 `--xh-tree-select-indicator-size` 名指触发器上那枚箭头、实改下拉行里的勾与展开箭头（补 `-item-indicator-size` 与 `-branch-indicator-size`）；`date-picker` 的确认钮劈了 `-confirm-trigger-` 与 `-confirm-` 两套前缀且高度无槽（统一到 `-confirm-trigger-`，并补 `-confirm-trigger-h`）；`highlight` 三个 mark 槽丢了部件名（补 `--xh-highlight-mark-radius` / `-bg` / `-fg`）；`back-top` 十三个槽里唯一带部件名的那个反向不一致（补 `--xh-back-top-size`，与 `float-button` 同形）；`layout` 两个宽度拼全成 `-width` 而同处的高度用 `-h` 缩写（补 `--xh-layout-sider-w` / `-sider-collapsed-w`）；`popconfirm` 的 `--xh-popconfirm-cancel-trigger-px` 同时管着确认钮（补两颗共用的 `--xh-popconfirm-action-px`）；`progress` 的 `--xh-_thickness` 与 `--xh-_diameter` 是全库仅有的两个不带组件前缀的私有槽，直接改名成 `--xh-_progress-thickness` / `--xh-_progress-diameter`（私有槽不在公开面里）。

**`check-spacing-slots` 加了一条名字判据**：一个槽的部件段若正好是本组件另一个真实部件的名字，这条规则又不作用在那个部件上，就判失败。跨部件读取确实有意的（图例方块取格子的形状、表头单元格取表头行的底色、标签的上下留白由控件高度算出来等）写进 `CROSS_PART` 并逐条说明理由，登记过期即报。默认渲染逐像素未变。
