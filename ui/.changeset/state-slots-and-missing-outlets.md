---
"@xihan-ui/styles": patch
---

**修复**六处「改一处视觉改不动、或改一处坏另一处」。新增 22 个使用者槽，没有删名也没有改名。

**同一个槽既做常态又做状态，一调就把两档焊死。** `card` 的 `--xh-card-border` / `--xh-card-shadow` 同时写在常态与 `hoverable` 的悬停上，而两档的缺省本就不同（`border-default` 与 `border-strong`）——作者设了卡片描边，指针停上去就再也看不出变化，悬停这一档从此调不回来。`accordion` 的 `--xh-accordion-trigger-fg` 同时管常态与展开态，改了常态字色，展开那一条的语气高亮跟着被抹平。各另立 `--xh-card-border-hover` / `--xh-card-shadow-hover` / `--xh-accordion-trigger-fg-open`，缺省值原封不动，写法与 `float-button` 的悬停档、`navigation-menu` 的当前项一致。

**四家浮层的关闭钮没有前景槽。** `dialog` / `drawer` / `popover` / `tour` 的那颗叉把 `--xh-fg-muted` 与 `--xh-fg-default` 直接写在 `color` 上，要单独调淡或调深这一颗只能提高特指度去压整条规则；同为角落关闭钮的 `alert` / `notification` / `toast` / `floating-panel` 四家都留了槽。四家一起补 `--xh-<组件>-close-fg` 与 `-close-fg-hover`。`dialog` 的说明字号也补上 `--xh-dialog-description-font-size`——紧邻的标题一直都有。`check-clear-trigger` 同时加了这条判据：角落关闭钮的常态前景必须走本组件的使用者槽，悬停换了字色的那条也得走；`image-viewer` 的叉随整块 chrome 继承颜色、自己不定前景，作为例外登记在案，哪天它自己留了槽，登记过期会当场报出来。

**三件下拉的标签禁用色没有槽。** `cascader` / `select` / `combobox` 的 `[data-part='label'][data-disabled]` 直接写 `--xh-fg-subtle`，而输入族另外 11 件（`text-field` / `date-field` / `number-field` …）缺省值一模一样却都留了 `-label-fg-disabled`。三件补齐。

**三处最常被调的地方没有出口。** 卡片说明的色与字号（`alert` 的同名部件两样都有）补 `--xh-card-description-fg` / `-font-size`；侧栏当前页的品牌高亮（底色、字色、字重三样全写死，menu 族五家都有 `-bg-active`）补 `--xh-side-nav-row-bg-active` / `-fg-active` / `-font-weight-active`，指向当前页的那条祖先枝补 `--xh-side-nav-row-fg-in-path`；`timer` 的 `item` 部件此前在皮肤里一条规则都没有，数字段的颜色只能连着记号一起改，补 `--xh-timer-item-fg`，缺省取 `inherit`——计时走完时间区整体退一档，数字段照着继承才跟得上。

**分页省略位补齐悬停与按下。** 它此前已并进可点观感组与聚焦环组，但漏了 `:hover` 与 `:active` 两组：有手型光标、有聚焦环，划过却不换底，指针用户会以为它坏了。两组各加一条，与页码走同一个 `--xh-pagination-item-bg-hover` / `-bg-active`；省略位没有当前页一说，不带页码那条的 `:not([data-current])` 守卫。
