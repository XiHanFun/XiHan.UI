---
"@xihan-ui/headless": minor
"@xihan-ui/styles": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

**分页浮层里的视觉轴、拖动中的海拔档、树选择器的叶子对齐，以及折叠区域补上指示符部件。**

**分页展开省略号后，面板里的页码格子不再塌。** `pagination` 的三档尺寸私有槽（`--xh-_pagination-item-size` / `-item-px` / `-font-size`）与四个语气派生槽此前只声明在 `root` 上，而 `positioner` 会被搬到 portal 落点、不再是 `root` 的后代。面板里的 `item` 取不到这几个槽，`var()` 没有第二层默认值即整条声明在计算值阶段失效：真实浏览器里量到的是最小宽 `auto`（应为 28/32/40px）、行高与字号 16px（应为 13/14/16px）、行内内衬 0（应为 8/12/16px）——三档尺寸全部退回初值，折叠页码丢掉等宽骨架。三轴私有槽现在在 `root` 与 `positioner` 上各声明一次，与同仓其余 11 份浮层皮肤同一种写法。`--xh-icon-size` 也从 `content` 上那份单独声明并进这一处，不再写两遍。

面板与主区逐项同值这件事由一条浏览器态用例焊住（`overlay-visual-axes.spec.ts` 加了 `pagination`，量最小宽、高、行内内衬、行高与字号五项）。

**滑杆拖动中的拇指改引 `--xh-elevation-lifted`。** 此前它借的是 `floating`——那是 portal 出去的锚定浮层那一档，浮层为自己调深时跟着手走的拇指会一起变重。新档在 `raised` 与 `floating` 之间，语义独立。`check-elevation-role` 的角色表随之从三档扩到四档，`slider` 的 `thumb` 登记成 `raised` + `lifted`。

**树选择器的叶子行补上首格对齐。** 分支行的首格是展开箭头，叶子行没有这一格；作者摆了 `item-indicator` 时由它顶着，没摆（勾选档首位直接是作者自己的方框）就得由行盒自己补出来，否则叶子比同级分支往行首缩 24px，层级关系读不出来。`tree` 早有这条补偿，但那条规则的选择器带 `[data-orientation='vertical']` 前置，而 `tree-select` 的连接层一处都不发这个属性，照抄过去一条都不命中，所以这里写的是等价而真能命中的一条。摆了指示符的那档不受影响（`:has()` 匹配即不命中，不会重复缩进）。两档都由新的浏览器态用例 `tree-select-leaf-indent.spec.ts` 量住。

**`collapsible` 新增 `indicator` 部件。** 折叠区域此前只有 `root` / `trigger` / `content` 三件，开箱的触发器看不出能展开——而触发器的皮肤是按两端对齐排的，却没有第二个部件可排；同构的 `accordion` / `reasoning` / `tool-call` 三家都有这个部件。现在 `connect` 产出 `getIndicatorProps()`（`aria-hidden` + `data-state` + `data-disabled`；开合语义仍由 `trigger` 的 `aria-expanded` 承担），两个适配器各接一处：Vue 是新组件 `XhCollapsibleIndicator`，Web Components 是新 csspart `indicator`。皮肤在部件空着时画一枚兜底箭头（`--xh-glyph-mark-chevron-down`），展开时转 180°；作者往部件里塞了自己的图形，兜底那条即不命中，转向照旧由皮肤按 `data-state` 打。新增使用者覆盖槽 `--xh-collapsible-icon-size`。纯新增，原有的三件与它们的属性一个都没动。
