---
'@xihan-ui/core': major
'@xihan-ui/headless': major
'@xihan-ui/styles': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**形态轴收敛为一套词。**

**字段类默认落 `outline`。** text-field 的 `variant` 未提供时由 connect 落成 `data-variant="outline"`
（root 与 control 两处一致；此前不发属性，由皮肤基础规则按缺省档绘制）。Field Chrome 家族的基础规则已是
描边式（canvas 底 + `--xh-border-control` 描边 + 无影），显式落值后皮肤不再依赖缺省档，外观不变；
自定义皮肤若以"无 `data-variant`"判定默认态需改为读取 `outline`。

**number-field 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，
皮肤基础规则按缺省档绘制）。默认外观从「透明描边 + raised 落影」改为「`--xh-bg-canvas` 底 +
`--xh-border-control` 描边」；皮肤未改，outline 档仍保留 raised 落影，与 Field Chrome 家族的无影对齐留给
后续配方矩阵。自定义皮肤若以「无 `data-variant`」判定默认态需改为读取 `outline`。

**color-field 默认落 `outline`。** `variant` 未提供时 root 与 control 都落 `data-variant="outline"`（此前
不发属性，由 Field Chrome 家族基础规则按缺省档绘制）。家族基础规则与 outline 逐值相同，外观不变；
自定义皮肤若以「无 `data-variant`」判定默认态需改为读取 `outline`。

**password-input 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，
由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
`--xh-border-control` 描边，raised 落影两处都保留），外观不变；自定义皮肤若以「无 `data-variant`」
判定默认态需改为读取 `outline`。

**pin-input 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
`--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态
需改为读取 `outline`。

**date-field 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
基础规则按缺省档绘制）。基础规则的常态描边是透明、悬停才浮出 `--xh-border-default`；outline 档把常态
描边换成 `--xh-border-control`、悬停换成 `--xh-border-control-hover`，底色仍是 `--xh-bg-canvas`，raised
落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以「无 `data-variant`」
判定默认态需改为读取 `outline`。

**time-field 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
基础规则按缺省档绘制）。基础规则的常态描边是透明、悬停才浮出 `--xh-border-default`；outline 档把常态
描边换成 `--xh-border-control`、悬停换成 `--xh-border-control-hover`、悬停底换成 `--xh-bg-subtle`，
底色仍是 `--xh-bg-canvas`，raised 落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；
自定义皮肤若以「无 `data-variant`」判定默认态需改为读取 `outline`。

**editable 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
基础规则按缺省档绘制）。editable 的基础规则本就是 `--xh-bg-canvas` 底 + `--xh-border-control` 描边 +
raised 落影，与 outline 档逐值相同，默认外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需改为
读取 `outline`。

**tags-input 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 + `--xh-border-control`
描边，raised 落影保留），外观不变；内嵌标签仍按 `tagVariantForControl(outline)` 落 subtle，与此前一致。
自定义皮肤若以「无 `data-variant`」判定默认态需改为读取 `outline`。

**prompt-input 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
基础规则按 M1 柔和实体面绘制）。默认外观从「`--xh-material-soft-bg` 底 + `--xh-material-soft-border`
描边 + 顶光与背景模糊」改为「`--xh-bg-canvas` 底 + `--xh-border-control` 描边，关掉顶光与背景模糊」，
`--xh-material-soft-shadow` 落影保留；皮肤未改，去掉 soft 材质本身留给后续配方矩阵。自定义皮肤若以
「无 `data-variant`」判定默认态需改为读取 `outline`。

**select 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
属性，由皮肤基础规则按缺省档绘制）。默认外观从「`--xh-bg-canvas` 底 + 透明描边 + raised 落影」改为
「`--xh-bg-canvas` 底 + `--xh-border-control` 描边 + 无影」；皮肤未改，由既有 outline 规则承担。内嵌标签
仍按 `tagVariantForControl(outline)` 落 subtle，与此前一致。自定义皮肤若以「无 `data-variant`」判定默认态
需改为读取 `outline`。

**combobox 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
属性，由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
`--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需
改为读取 `outline`。

**cascader 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
属性，由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
`--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需
改为读取 `outline`。

**tree-select 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
属性，由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
`--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需
改为读取 `outline`。

**mention 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
属性，由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
`--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需
改为读取 `outline`。

**date-picker 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前
不发属性，由皮肤基础规则按缺省档绘制）。基础规则的输入行常态描边是透明；outline 档把常态描边换成
`--xh-border-control`、悬停换成 `--xh-border-control-hover`，底色仍是 `--xh-bg-canvas`，raised 落影保留。
默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以「无 `data-variant`」判定默认态需
改为读取 `outline`。

**date-range-picker 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前
不发属性，由皮肤基础规则按缺省档绘制）。基础规则的输入行常态描边是透明；outline 档把常态描边换成
`--xh-border-control`、悬停换成 `--xh-border-control-hover`、悬停底换成 `--xh-bg-subtle`，底色仍是
`--xh-bg-canvas`，raised 落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以
「无 `data-variant`」判定默认态需改为读取 `outline`。

**time-picker 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前
不发属性，由皮肤基础规则按缺省档绘制）。基础规则的输入行常态描边是透明；outline 档把常态描边换成
`--xh-border-control`、悬停换成 `--xh-border-control-hover`、悬停底换成 `--xh-bg-subtle`，底色仍是
`--xh-bg-canvas`，raised 落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以
「无 `data-variant`」判定默认态需改为读取 `outline`。

**time-range-picker 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`
（此前不发属性，由皮肤基础规则按缺省档绘制）。基础规则的输入行常态描边是透明；outline 档把常态描边换成
`--xh-border-control`、悬停换成 `--xh-border-control-hover`、悬停底换成 `--xh-bg-subtle`，底色仍是
`--xh-bg-canvas`，raised 落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以
「无 `data-variant`」判定默认态需改为读取 `outline`。

**input-group 改用 `outline` / `subtle` / `ghost`。** `primary` → `outline`、`secondary` → `subtle`，新增
`ghost`（静息不画底、描边与落影，悬停与聚焦沿用现有规则浮出）；`variant` 未提供时 root 落
`data-variant="outline"`（此前不发属性，皮肤基础规则按缺省档绘制，与 outline 逐值相同，外观不变）。
`InputGroupVariant` 类型删除，改用 `ControlVariant`，与组内字段同一套词。皮肤只把 `secondary` 选择器映射到
`subtle`，outline 基础规则仍是 `--xh-border-subtle` 假边 + raised 落影，回归 `--xh-border-control` 留给后续
Field Chrome 配方矩阵。

**card 改用 `outline` / `subtle` / `ghost`。** `default` → `outline`、`secondary` → `subtle`、`tertiary` → `ghost`、
`transparent` → `ghost`；`variant` 未提供时 root 落 `data-variant="outline"`（此前落 `default`，皮肤基础规则即
该档，默认外观不变）。`CardVariant` 类型删除，三端改用 `ControlVariant`。皮肤只把 `secondary` / `transparent`
选择器映射到 `subtle` / `ghost`，规则体不动；`tertiary` 的 `--xh-bg-subtle-hover` 底色档退役，原 tertiary 作者
迁到 `ghost` 后卡面不再画底与影。本节覆盖未发布 changeset `card-semantic-surfaces.md` 里的四值旧词。

**tree 改用 `outline` / `subtle` / `ghost`。** `surface` → `outline`、`plain` → `ghost`；`variant` 未提供时 root 落
`data-variant="outline"`（此前落 `surface`，皮肤基础规则即该档，默认外观不变）。`TreeVariant` 类型删除，三端改用
`ControlVariant`。皮肤只把 `plain` 选择器映射到 `ghost`，规则体不动；`subtle` 为新增最小规则（描边透明 +
`--xh-bg-subtle` 底），此前没有对应外观。

**json-viewer 改用 `outline` / `subtle` / `ghost`。** `surface` → `outline`、`plain` → `ghost`；`variant` 未提供时 root 落
`data-variant="outline"`（此前落 `surface`，皮肤基础规则即该档，默认外观不变）。`JsonViewerVariant` 类型删除，三端改用
`ControlVariant`。皮肤只把 `plain` 选择器映射到 `ghost`，规则体不动；`subtle` 为新增最小规则（描边透明 +
`--xh-bg-subtle` 底），此前没有对应外观。

**toolbar 改用 `outline` / `subtle` / `ghost`。** `plain` → `ghost`、`surface` → `outline`；`variant` 未提供时 root 落
`data-variant="ghost"`（此前不发属性，皮肤基础规则即该档，默认外观不变）。`ToolbarVariant` 类型删除，三端改用
`ControlVariant`。皮肤只把 `plain` / `surface` 选择器映射到 `ghost` / `outline`，规则体不动：outline 本阶段仍是
`--xh-bg-surface` 底 + raised 落影、无描边，补 `--xh-border-default` 留给后续配方矩阵；`subtle` 为新增最小规则
（带内距 + `--xh-bg-subtle` 底，无描边无影），此前没有对应外观。

**accordion 改用 `outline` / `subtle` / `ghost`。** `plain` → `ghost`、`surface` → `outline`、`bordered` → `outline`；
`variant` 未提供时 root 落 `data-variant="ghost"`（此前不发属性，皮肤基础规则即该档，默认外观不变）。
`AccordionVariant` 类型删除，三端改用 `ControlVariant`。皮肤把 `surface` 选择器映射到 `outline`，规则体不动；
`bordered` 的逐条外框形态退役（其 `gap` 与条目 `border` / `border-radius` 规则删除，公开覆盖槽
`--xh-accordion-item-gap` 随之退役），原 bordered 作者迁到 `outline` 后得到单一连续表面；`subtle` 为新增最小规则
（同 outline 的连续表面，底换成 `--xh-bg-subtle`），此前没有对应外观。

**list 的 `bordered` 并入形态轴。** `bordered` → `variant="outline"`；新增 `variant` 轴，取值 `outline` / `subtle` /
`ghost`，未提供时 root 落 `data-variant="ghost"`（此前不发属性，皮肤基础规则即该档，默认外观不变）。DOM 属性
`data-bordered` 不再由 list 发出；三端的 `bordered` prop / attribute 删除。皮肤把 `[data-bordered]` 选择器映射到
`[data-variant='outline']`，规则体不动；`subtle` 为新增最小规则（不画描边，surface 圆角 + `--xh-bg-subtle` 底），
此前没有对应外观。示例 `list/03-bordered-hoverable` 改名 `list/03-outline-hoverable`。

**descriptions 的 `bordered` 并入形态轴。** `bordered` → `variant="outline"`；新增 `variant` 轴，取值 `outline` /
`subtle` / `ghost`，未提供时 root 落 `data-variant="ghost"`（此前不发属性，皮肤基础规则即该档，默认外观不变）。DOM
属性 `data-bordered` 不再由 descriptions 发出；三端的 `bordered` prop / attribute 删除。皮肤把 `[data-bordered]`
选择器（含逐档网格线共 17 处）映射到 `[data-variant='outline']`，规则体不动；`subtle` 为新增最小规则（不画描边也不补
网格线，surface 圆角 + `--xh-bg-subtle` 底），此前没有对应外观。示例 `descriptions/04-bordered` 改名
`descriptions/04-outline`。

**table 的 `borderless` 并入形态轴。** `borderless` → `variant="ghost"`；新增 `variant` 轴，取值 `outline` /
`subtle` / `ghost`，未提供时 root 落 `data-variant="outline"`（此前由 `borderless` 取反发 `data-bordered`，皮肤
外框规则即该档，默认外观不变）。DOM 属性 `data-bordered` 不再由 table 发出；三端的 `borderless` prop /
attribute 删除。皮肤把 `[data-bordered]` 选择器映射到 `[data-variant='outline']`，规则体不动；`subtle` 为新增
最小规则（不画描边，surface 圆角 + `--xh-bg-subtle` 底），此前没有对应外观。

**page-header 改用 `outline` / `subtle` / `ghost`，`bordered` 改名 `split`。** `plain` → `ghost`、`surface` →
`outline`、`raised` → `outline`；`variant` 未提供时 root 落 `data-variant="ghost"`（此前不发属性，皮肤基础规则
即该档，默认外观不变）。`PageHeaderVariant` 类型删除，三端改用 `ControlVariant`。`bordered` 改名 `split`：
它画的是页头与下方内容之间的分隔线而非有框/无框，DOM 属性 `data-bordered` 改 `data-split`，且只在 `ghost` 上
画；有面的两档由描边承担边界。皮肤把 `surface` 映射到 `outline` 并合并原 `raised` 的整圈描边，outline 因此恒带
`--xh-border-subtle` 描边（原 surface 不写 bordered 时无描边）；`raised` 的抬起投影退役，公开覆盖槽
`--xh-page-header-shadow` 随之删除；`subtle` 为新增最小规则（描边透明 + `--xh-bg-subtle` 底 + 无影），此前没有
对应外观。示例 `page-header/02-bordered-footer` 改名 `page-header/02-split-footer`。

**layout 的 `bordered` 改名 `split`。** 它画的是头部、侧栏、脚部与内容之间的分隔线而非有框/无框（layout 根本身
无壳），与 `data-split` 既有语义一致，因此不加 `variant` 轴；三端的 `bordered` prop / attribute 改名 `split`，DOM
属性 `data-bordered` 改 `data-split`，皮肤只把 `[data-bordered]` 选择器映射到 `[data-split]`，规则体不动，外观不变。
至此库内不再有任何组件发出 `data-bordered`，该属性名进入退役清单。

**tabs 默认变体改为 `line`。** `variant` 未提供时 root 落 `data-variant="line"`（此前不发属性，皮肤基础规则按
segment 绘制）。默认外观从「浅色标签带 + 浮起选中面」改为「透明标签带 + 底部指示条 + 品牌字色」；原默认外观写
`variant="segment"` 取得。皮肤基础规则改为 line 取值（Web Components 升级前无 `data-variant` 的一帧与默认一致），
`segment` 与 `card` 块补齐原来靠基础规则继承的私有槽（触发器描边、选中描边、选中字色），显式写这两档的外观逐值不变。
指示条不再对「无 `data-variant`」的根隐藏，只对 `segment` / `card` 隐藏。示例 `tabs/03-variant` 改为展示 segment。

**text-field 清空钮改走 field-inset ghost 档，标签字号不随档。** connect 在 clear-trigger 上补投影
`data-xh-action-variant="ghost"`；皮肤删除自写的 `--xh-action-bg-rest/-hover/-pressed` 取值（原悬停
`--xh-bg-subtle-hover`、按下 `--xh-bg-subtle-active` 属淡底承载阶梯），改由家族 ghost 档给：字段底是 canvas，
清空钮悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）；使用者槽 `--xh-text-field-action-bg`
/`-bg-hover`/`-bg-active` 保留为覆盖入口，缺省指向家族档值。label 的私有 `--xh-_text-field-label-font-size` 删除，
`--xh-text-field-label-font-size` 缺省改为 `--xh-text-label-size`：sm 档标签由 13px 升为 14px、lg 档由 16px 降为
14px，md 不变。control 上补映射 `--xh-field-glyph-size`，`--xh-text-field-icon-size` 使用者槽在视觉盒内重新生效
（此前被家族 chrome 的 `--xh-icon-size` 覆盖）；清空钮内字形改按 field-inset 档取 `--xh-_action-profile-glyph-size`。

**color-field 清空钮改走 field-inset ghost 档，标签字号不随档。** connect 在 clear-trigger 上补投影
`data-xh-action-variant="ghost"`；皮肤不再自写 200/300 的淡底阶梯，清空钮悬停 `--xh-bg-subtle`（100）、按下
`--xh-bg-subtle-hover`（200），使用者槽 `--xh-color-field-action-bg`/`-bg-hover`/`-bg-active` 保留为覆盖入口。
label 的私有 `--xh-_color-field-label-font-size` 删除，`--xh-color-field-label-font-size` 缺省改为
`--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。control 补映射 `--xh-field-glyph-size`，
`--xh-color-field-icon-size` 在视觉盒内重新生效；清空钮内字形按 field-inset 档取 `--xh-_action-profile-glyph-size`。

**number-field 接入 Field Chrome 与 Action Control，默认去 raised 落影，加减钮改为 field-inset 正方盒。**
connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省
`outline`），input 上投影 `data-xh-field-input` / `data-xh-field-layout="single-line"` / `data-readonly`，
prefix / suffix 投影 `data-xh-field-affix`，increment / decrement 投影 `data-xh-action-control` +
`field-inset` + `ghost` + `always` + size。皮肤删除 control 自画盒与五态、input / affix 自写重置、三档
variant 块与 `--xh-_number-field-*` 形态私有槽，改为向家族桥接槽映射。默认外观变化：outline 档不再带
`--xh-elevation-raised` 落影（字段家族不消费 raised）；focus 与 invalid 时底色保持 canvas（原聚焦换
`--xh-bg-subtle` 底）；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；加减钮由「占满控件高度、
圆角 0、悬停透明、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 / lg 36px，
compact 依令牌）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，
粗指针下不再放大真实按钮盒与控件最小高度，改由家族伪元素外扩 44px 命中区，control 不再 `overflow: hidden`；
输入与动作组之间的半高分隔线改画在减钮的 `background-image` 上（`::after` 让给粗指针热区），RTL 由
`[dir='rtl']` 换边，forced-colors 用 `ButtonText` 重画。label 的 `--xh-number-field-label-font-size` 缺省改为
`--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。公开覆盖槽退役：`--xh-number-field-touch-target-size`
（家族热区不读组件槽）、`--xh-number-field-control-bg-focus`、`--xh-number-field-control-bg-invalid`（家族聚焦与
无效态不换底）；新增 `--xh-number-field-control-fg`、`--xh-number-field-trigger-radius`；
`--xh-number-field-trigger-bg-active` 改指向家族按压桥接槽，`--xh-number-field-trigger-divider-h` 改按钮高的
百分比解析（缺省仍 50%）。

**password-input 接入 Field Chrome 与 Action Control，默认去 raised 落影，无 control 结构不再画盒。**
connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省
`outline`），input 上投影 `data-xh-field-input` / `data-xh-field-layout="single-line"` / `data-readonly`，
visibility-trigger 投影 `data-xh-action-control` + `field-inset` + `ghost` + `always` + size。皮肤删除 control
自画盒与五态、独立 input 自画盒与五态、四条 autofill、三档 variant 块、tone 语气块与 `--xh-_password-input-*`
形态私有槽，改为向家族桥接槽映射。默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律
`--xh-border-control-focus`，不再随 `tone`（subtle / ghost 的语气淡底改由家族 `--xh-_tone-subtle` 链给）；不写
`control` 时输入框与按钮是独立元素，不再绘制描边、底与落影的外壳；自动填充由家族用 `--xh-bg-canvas` 实体底
与 `--xh-fg-default` 前景重绘，不再按形态 / 只读 / 禁用派生；切换钮由「`--xh-control-action-size` 方盒、control
圆角、悬停 `--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 /
md 32 / lg 36px，compact 依令牌）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+
0.97 按压，粗指针命中区由家族伪元素外扩 44px；切换钮占 Tab 位，control 内仍保留自己的焦点环以区分两个停靠点。
输入与切换钮之间的半高分隔线改画在切换钮的 `background-image` 上（`::after` 让给粗指针热区），贴在靠输入的
那一侧、长度按钮高的 50% 解析，RTL 由 `[dir='rtl']` 换边，forced-colors 用 `CanvasText` / `GrayText` 重画。
label 的 `--xh-password-input-label-font-size` 缺省改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。
公开覆盖槽退役（独立 input 不再画盒）：`--xh-password-input-input-bg`、`-input-bg-disabled`、`-input-bg-hover`、
`-input-bg-readonly`、`-input-border`、`-input-border-focus`、`-input-border-hover`、`-input-border-invalid`、
`-input-h`、`-input-min-w`、`-input-px`、`-input-radius`、`-input-shadow`；新增 `--xh-password-input-control-fg`。

**pin-input 每格接入 Field Chrome，默认去 raised 落影，焦点边不随 tone。** connect 在每一格 input 上投影
`data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；格子自身就是视觉盒，
不投影 `data-xh-field-input`（否则家族会重置格子的边框）。皮肤删除格子自画的描边、底、圆角、落影、悬停与
invalid / readonly / disabled 面、三档 variant 块与 `--xh-_pin-input-box-*` 形态私有槽，改为向家族桥接槽映射
（`--xh-pin-input-box-*` 使用者槽全部保留）；自动填充仍由皮肤自写（家族规则命不中），但不再叠加落影。默认
外观变化：outline 档格子不再带 `--xh-elevation-raised` 落影；当前格与聚焦格的描边一律
`--xh-border-control-focus`，不再随 `tone`（subtle / ghost 的语气淡底改由家族 `--xh-_tone-subtle` 链给）；
填满态品牌描边不变。label 的 `--xh-pin-input-label-font-size` 缺省改为 `--xh-text-label-size`（sm 13px → 14px、
lg 16px → 14px）。

**date-field 接入 Field Chrome 与 Action Control，默认去 raised 落影，清空钮改走 field-inset ghost 档，段位前景改
淡底前景。** connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、
缺省 `outline`）；段位是 div 而非原生输入，不投影 `data-xh-field-input`；clear-trigger 投影 `data-xh-action-control` +
`field-inset` + `ghost` + `has-value` + size 与 `data-xh-action-has-value`。皮肤删除 control 自画盒与悬停 / 聚焦 /
invalid / readonly / disabled 五态、三档 variant 块与 `--xh-_date-field-control-*` 形态私有槽，改为向家族桥接槽映射
（`--xh-date-field-control-*` 使用者槽全部保留，`--xh-date-field-control-shadow` 缺省改为 `none`）。默认外观变化：
outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`（subtle / ghost
的语气淡底改由家族 `--xh-_tone-subtle` 链给）；disabled 描边由家族落 `--xh-border-default`；盒上的指针改为
`default`（段位靠键盘编辑，不是文本光标）。清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停
`--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 /
lg 36px，compact 依令牌）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，
粗指针命中区由家族伪元素外扩 44px；使用者槽 `--xh-date-field-action-bg`/`-bg-hover`/`-bg-active`/`-action-radius`
保留为覆盖入口，`--xh-date-field-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。当前段反白的
前景由 `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`（淡底前景一律 on-brand-subtle）。label 的私有
`--xh-_date-field-label-font-size` 删除，`--xh-date-field-label-font-size` 缺省改为 `--xh-text-label-size`
（sm 13px → 14px、lg 16px → 14px）。

**time-field 接入 Field Chrome 与 Action Control，默认去 raised 落影，清空钮改走 field-inset ghost 档，段位前景改
淡底前景。** connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、
缺省 `outline`）；段位是 div 而非原生输入，不投影 `data-xh-field-input`；clear-trigger 投影 `data-xh-action-control` +
`field-inset` + `ghost` + `has-value` + size 与 `data-xh-action-has-value`。皮肤删除 control 自画盒与悬停 / 聚焦 /
invalid / readonly / disabled 五态、三档 variant 块与 `--xh-_time-field-control-*` 形态私有槽，改为向家族桥接槽映射
（`--xh-time-field-control-*` 使用者槽全部保留，`--xh-time-field-control-shadow` 缺省改为 `none`）。默认外观变化：
outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`（subtle / ghost
的语气淡底改由家族 `--xh-_tone-subtle` 链给）；disabled 描边由家族落 `--xh-border-default`；盒上的指针改为
`default`。段位悬停底由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载阶梯）；当前段反白的前景由
`--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`。清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停
`--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 /
lg 36px，compact 依令牌）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，
粗指针命中区由家族伪元素外扩 44px；使用者槽 `--xh-time-field-action-bg`/`-bg-hover`/`-bg-active`/`-action-radius`
保留为覆盖入口，`--xh-time-field-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。label 的私有
`--xh-_time-field-label-font-size` 删除，`--xh-time-field-label-font-size` 缺省改为 `--xh-text-label-size`
（sm 13px → 14px、lg 16px → 14px）。

**editable 接入 Field Chrome 与 Action Control，默认去 raised 落影，三颗动作钮改为 field-inset 正方盒。** connect
在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）与
`data-readonly`，input 上投影 `data-xh-field-input` / `data-xh-field-layout="single-line"` / `data-readonly`，
edit / submit / cancel 三颗钮投影 `data-xh-action-control` + `field-inset` + `ghost` + `always` + size。皮肤删除
control 自画盒与悬停 / 聚焦 / invalid / readonly / disabled 五态、input 自写重置 / 五态 / 两条 autofill、三档
variant 块与 `--xh-_editable-control-*` 形态私有槽，改为向家族桥接槽映射。默认外观变化：outline 档不再带
`--xh-elevation-raised` 落影；聚焦与 invalid 不再换底（此前聚焦底 `--xh-bg-subtle`）；焦点描边一律
`--xh-border-control-focus`，不再随 `tone`；disabled 描边由 `--xh-border-subtle` 改为家族的 `--xh-border-default`；
control 不再 `overflow: hidden`（家族粗指针热区伪元素会被它裁掉）。三颗钮由「占满控件高度、圆角 0、悬停透明、
按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 / lg 36px，compact 依令牌）、inset
圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，粗指针下不再放大真实按钮盒与
控件最小高度，改由家族伪元素外扩 44px 命中区；动作组与内容段之间的半高分隔线改画在编辑钮 / 确认钮的
`background-image` 上（`::after` 让给粗指针热区），RTL 由 `[dir='rtl']` 换边，forced-colors 用 `ButtonText` 重画。
label 的私有 `--xh-_editable-label-font-size` 删除，`--xh-editable-label-font-size` 缺省改为 `--xh-text-label-size`
（sm 13px → 14px、lg 16px → 14px）。公开覆盖槽退役：`--xh-editable-touch-target-size`（家族热区不读组件槽）、
`--xh-editable-control-bg-focus`、`--xh-editable-control-bg-invalid`（家族聚焦与无效态不换底）、`--xh-editable-input-h`
（盒内 input 由家族撑满控件高度）；新增 `--xh-editable-control-fg`、`--xh-editable-control-px`（缺省 0）、
`--xh-editable-trigger-radius`；`--xh-editable-trigger-bg` / `-bg-hover` / `-bg-active` / `-bg-disabled` 改指向家族
ghost 档桥接槽。

**tags-input 接入 Field Chrome 与 Action Control，默认去 raised 落影，清空钮改走 field-inset ghost 档，键盘走到的
标签改为当前项淡底。** connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` /
`data-xh-field-layout="multi-tag"` / `data-variant`（与 root 同源、缺省 `outline`），input 上投影
`data-xh-field-input`（布局落在 control 上，不重复投影），clear-trigger 投影 `data-xh-action-control` +
`field-inset` + `ghost` + `has-value` + size 与 `data-xh-action-has-value`。皮肤删除 control 自画盒与悬停 / 聚焦 /
invalid / readonly / disabled 五态、input 自写重置 / 两条 autofill、三档 variant 块与 `--xh-_tags-input-control-*`
形态私有槽，改为向家族桥接槽映射（`--xh-tags-input-control-*` 使用者槽保留，`--xh-tags-input-control-shadow`
缺省改为 `none`）。默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律
`--xh-border-control-focus`，不再随 `tone`（subtle / ghost 的语气淡底改由家族 `--xh-_tone-subtle` 链给）；disabled
描边由家族落 `--xh-border-default`；纵向内衬由 `--xh-space-0_5` 改为家族 multi-tag 布局的 `--xh-space-1`，
**公开覆盖槽 `--xh-tags-input-control-py` 退役**（纵向内衬由家族布局给，不再读组件槽）；新增
`--xh-tags-input-input-fg`。键盘走到的标签（`data-highlighted`）由品牌实心 `--xh-bg-brand` + `--xh-fg-on-brand`
改为当前项淡底 `--xh-bg-brand-subtle` + `--xh-fg-on-brand-subtle`（写了 `tone` 时取 `--xh-_tone-subtle` /
`--xh-_tone-fg`），删除钮字色随之换成淡底前景；就地编辑框的焦点环改直接取 `--xh-ring-focus`，invalid 时
`--xh-ring-invalid`。清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停 `--xh-bg-subtle-hover`（200）、
按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 / lg 36px，compact 依令牌）、inset
圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，粗指针命中区由家族伪元素外扩
44px；`--xh-tags-input-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。label 的私有
`--xh-_tags-input-label-font-size` 删除，`--xh-tags-input-label-font-size` 缺省改为 `--xh-text-label-size`
（sm 13px → 14px、lg 16px → 14px）。

**mention 输入框接入 Field Chrome，默认去 raised 落影；候选行接入 Collection Item，补上按下面。** connect 在
input 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-xh-field-layout="single-line"` / `data-variant`
（与 root 同源、缺省 `outline`）与 `data-readonly`；输入框自身就是视觉盒，不投影 `data-xh-field-input`。item 投影
`data-xh-collection-item` / `data-xh-collection-size` / `data-xh-collection-context="overlay"`，item-text 投影
`data-xh-collection-slot="text"`。皮肤删除 input 自画盒与悬停 / 聚焦 / invalid / readonly / disabled 五态、三档
variant 块与 `--xh-_mention-input-*` 形态私有槽，改为向家族桥接槽映射（`--xh-mention-input-*` 使用者槽保留，
`--xh-mention-input-shadow` 缺省改为 `none`）；自动填充仍由皮肤自写（家族按 input 角色给的规则命不中），不再叠
落影。默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再
随 `tone`；disabled 描边由家族落 `--xh-border-default`。候选行删除自写的网格 / 内衬 / 圆角 / 字色 / 高亮底 / 禁用
色，改为映射家族桥接槽：悬停与高亮 `--xh-bg-subtle`（100）不变，新增按下 `--xh-bg-subtle-hover`（200）与按压时长
（此前零 `:active` 面）；新增 `--xh-mention-item-bg-pressed` 覆盖槽。候选面加 `overscroll-behavior: contain`；三端
自绘条改传 `size: 'sm'`，条子厚度由 6px 改为浮层 4px 档。label 的 `--xh-mention-label-font-size` 缺省由随档的
`--xh-_mention-font-size` 改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

**combobox 接入 Field Chrome / Action Control / Collection Item，默认去 raised 落影，`data-multiline` 视觉钩子与
`--xh-combobox-control-py` 槽退役。** connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` /
`data-variant`（与 root 同源、缺省 `outline`）；input 投影 `data-xh-field-input` 与 `data-xh-field-layout`
（单行 `single-line`、textarea 宿主 `textarea`），旧 `data-multiline` 属性不再产出，自定义皮肤改读布局值，不提供
双写兼容。trigger（展开钮，`display="always"`）与 clear-trigger（`display="has-value"` + `data-xh-action-has-value`）
投影 field-inset ghost 档；item 投影 `data-xh-collection-item` / `-size` / `-context="overlay"`，item-text 与
item-indicator 各投影 `data-xh-collection-slot`。皮肤删除 control 自画盒与悬停 / 聚焦 / invalid / readonly /
disabled 五态、三档 variant 块与 `--xh-_combobox-control-*` 形态私有槽，改为映射家族桥接槽（`--xh-combobox-control-*`
使用者槽保留，`--xh-combobox-control-shadow` 缺省改为 `none`）；多行宿主的 `padding-block` 由家族 textarea 布局给
（写在 textarea 自身），`--xh-combobox-control-py` 槽删除。input 删除自写重置、占位与两条 autofill，改映射
`--xh-field-input-*` / `--xh-field-placeholder-fg` / `--xh-field-autofill-*`，新增 `--xh-combobox-input-fg` 覆盖槽。
默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随
`tone`；disabled 描边由家族落 `--xh-border-default`。展开钮与清空钮由「`--xh-control-action-size` 方盒、control
圆角、悬停 `--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒
（sm 24 / md 32 / lg 36px）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97
按压，粗指针命中区由家族伪元素外扩；`--xh-combobox-action-radius` 缺省由 `--xh-shape-control` 改为
`--xh-shape-inset`。候选行删除自写的排布 / 内衬 / 圆角 / 字色 / 高亮底 / 禁用色，改为映射家族桥接槽：悬停与高亮
`--xh-bg-subtle`（100）不变，新增按下 `--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面）；新增
`--xh-combobox-item-bg-pressed` 与 `--xh-combobox-item-check-fg` 覆盖槽（旧 `--xh-combobox-item-indicator-fg`
留在兜底位）；对号显隐由家族按 `aria-selected` 给。候选面加 `overscroll-behavior: contain`；三端自绘条改传
`size: 'sm'`，条子厚度由 6px 改为浮层 4px 档。label 的 `--xh-combobox-label-font-size` 缺省由随档的
`--xh-_combobox-label-font-size` 改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

**select 接入 Field Chrome 与 Action Control，默认去 raised 落影，列表接自绘条。** connect 在 control 上投影
`data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；trigger 是撑满盒的
按钮，不投影 `data-xh-field-input`；clear-trigger 投影 field-inset ghost 档（`display="has-value"` +
`data-xh-action-has-value`）。皮肤删除 control 自画盒与悬停 / invalid / 聚焦 / readonly / disabled 五态、三档 variant
块与 `--xh-_select-control-*` 形态私有槽，改为映射家族桥接槽（`--xh-select-control-*` 使用者槽保留，
`--xh-select-control-shadow` 缺省改为 `none`，盒上指针 `pointer`）。默认外观变化：不写 variant 时描边由透明改为
`--xh-border-control`（与 outline 档逐值相同），不再带 `--xh-elevation-raised` 落影；焦点描边一律
`--xh-border-control-focus`，不再随 `tone`；disabled 描边由家族落 `--xh-border-default`。清空钮由
「`--xh-control-action-size` 方盒、control 圆角、悬停 `--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`
（300）」改为 field-inset 档正方盒（sm 24 / md 32 / lg 36px）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下
`--xh-bg-subtle-hover`（200）+ 0.97 按压，粗指针命中区由家族伪元素外扩；`--xh-select-action-radius` 缺省由
`--xh-shape-control` 改为 `--xh-shape-inset`。list 三端接入自绘条（壳 positioner、浮层 4px 档）并加
`overscroll-behavior: contain`；Vue / React 的 select 上下文新增 `controlRef` / `listRef`，层分支由 `[trigger]`
改为 `[control, positioner]`（点清空钮与按住条子都算层内交互）。label 的 `--xh-select-label-font-size` 缺省由
随档的 `--xh-_select-label-font-size` 改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

**tree-select 接入 Field Chrome / Action Control / Collection Item，默认去 raised 落影，
`--xh-tree-select-item-selected-font-weight` 改名 `--xh-tree-select-item-font-weight-selected`。** connect 在
control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；
clear-trigger 投影 field-inset ghost 档（`display="has-value"` + `data-xh-action-has-value`）；叶子 item 与分支
branch-control 都投影 `data-xh-collection-item` / `-size` / `-context="overlay"`，item-text / branch-text 投影
`data-xh-collection-slot="text"`，item-indicator 投影 `"indicator"`，branch-trigger / branch-indicator 投影
`"prefix"`。皮肤删除 control 自画盒与五态、三档 variant 块与 `--xh-_tree-select-border/-bg/-shadow/-ring` 形态私有
槽，改为映射家族桥接槽（`--xh-tree-select-control-*` 使用者槽保留，`--xh-tree-select-control-shadow` 缺省改为
`none`，盒上指针 `pointer`）。默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律
`--xh-border-control-focus`，不再随 `tone`；disabled 描边由家族落 `--xh-border-default`。清空钮由
「`--xh-control-action-size` 方盒、control 圆角、悬停 200、按下 300」改为 field-inset 档正方盒、inset 圆角、
悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压；`--xh-tree-select-action-radius`
缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。树行删除自写的排布 / 高亮底 / 选中字色字重 / 禁用色，改为
映射家族桥接槽：悬停与高亮 `--xh-bg-subtle`（100）不变，新增按下 `--xh-bg-subtle-hover`（200）与按压时长
（此前零 `:active` 面）；叶子的层级缩进由 `padding-inline-start` 改为家族网格首列的占位伪元素（文字起点不变）；
新增 `--xh-tree-select-item-bg-pressed` 与 `--xh-tree-select-item-check-fg` 覆盖槽（旧
`--xh-tree-select-item-indicator-fg` 留在兜底位）；分支行的选中对号与半选横线仍按 `data-selected` /
`data-indeterminate` 显形；懒分支取数失败（`data-error`）的行面映射回常态，不引入家族告警面，该行仍可激活
（Enter / 点行重试），悬停与键盘高亮 100、按下 200 与键盘焦点环由皮肤在家族解算点上接回。content 加
`overscroll-behavior: contain`；三端自绘条改传 `size: 'sm'`，条子厚度由 6px 改为浮层 4px 档。label 的
`--xh-tree-select-label-font-size` 缺省由随档的私有槽改为 `--xh-text-label-size`（sm 13px → 14px、
lg 16px → 14px）。

**cascader 接入 Field Chrome / Action Control / Collection Item，默认去 raised 落影，
`--xh-cascader-item-selected-font-weight` 改名 `--xh-cascader-item-font-weight-selected`。** connect 在 control
上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；
clear-trigger 投影 field-inset ghost 档（`display="has-value"` + `data-xh-action-has-value`）；列内 item 与搜索
search-item 都投影 `data-xh-collection-item` / `-size` / `-context="overlay"`，item-text 投影
`data-xh-collection-slot="text"`，item-indicator 投影 `"indicator"`。皮肤删除 control 自画盒与五态、三档 variant
块与 `--xh-_cascader-border/-bg/-shadow/-ring` 形态私有槽，改为映射家族桥接槽（`--xh-cascader-control-*`
使用者槽保留，`--xh-cascader-control-shadow` 缺省改为 `none`，盒上指针 `pointer`）。默认外观变化：outline 档
不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；disabled 描边由
家族落 `--xh-border-default`。清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停 200、按下 300」改为
field-inset 档正方盒、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97
按压；`--xh-cascader-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。列内条目删除自写的
排布 / 高亮底 / 展开路径底 / 选中字色字重 / 禁用色，改为映射家族桥接槽：悬停与高亮 `--xh-bg-subtle`（100）、
展开路径 `--xh-cascader-item-bg-active` 缺省 `--xh-bg-subtle`（与悬停同档）不变，新增按下
`--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面）；分支箭头落在家族网格的 suffix 列；新增
`--xh-cascader-item-bg-pressed` 与 `--xh-cascader-item-check-fg` 覆盖槽（旧 `--xh-cascader-item-indicator-fg`
留在兜底位）。搜索候选没有正文部件，行保持块级排版、对号仍在末端预留轨内绝对定位，状态面同走家族。
content / column / search-list 加 `overscroll-behavior: contain`；content 横向自绘条改传 `size: 'sm'`
（浮层 4px 档）；每一列与搜索列表各自接一路贴层（`anchor: 'layer'`）的自绘竖条，条子节点紧跟在该列 /
列表之后、贴其行内末端，列的原生细条随之隐藏，列间分隔线改按 `column ~ column` 取后续列；content 上声明
`--xh-scrollbar-track-bg: transparent`。label 的 `--xh-cascader-label-font-size` 缺省由随档的私有槽改为
`--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

**date-picker 接入 Field Chrome / Action Control / Collection Item，浮层改 floating 材质，去 raised 落影，
`--xh-date-picker-content-highlight` / `--xh-date-picker-content-backdrop` 槽退役。** connect 在 control 上投影
`data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；trigger（日历钮，
`display="always"`）与 clear-trigger（`display="has-value"` + `data-xh-action-has-value`）投影 field-inset ghost 档；
confirm-trigger 投影 Action Control `profile="text"` / `variant="solid"`（面板内唯一主要动作，固定 sm 档）；preset
与 time-item 投影 `data-xh-collection-item` / `-size` / `-context="overlay"`。皮肤删除 control 自画盒与五态、
三档 variant 块与 `--xh-_date-picker-control-*` 形态私有槽，改为映射家族桥接槽（`--xh-date-picker-control-*`
使用者槽保留，`--xh-date-picker-control-shadow` 缺省改为 `none`，盒上指针 `default`）。默认外观变化：outline 档
描边由透明改为 `--xh-border-control`，不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，
不再随 `tone`；打开中的 control 不再另画焦点环；disabled 描边由家族落 `--xh-border-default`；段位反白前景由
`--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`。日历钮与清空钮由「`--xh-control-action-size` 方盒、control 圆角、
悬停 200、按下 300、打开中 300」改为 field-inset 档正方盒、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下
`--xh-bg-subtle-hover`（200）+ 0.97 按压，打开中与悬停同档；`--xh-date-picker-action-radius` 缺省由
`--xh-shape-control` 改为 `--xh-shape-inset`。确认钮的品牌实心、悬停 / 按下 / 按压 / 焦点环改由家族 solid 档给，
`--xh-date-picker-confirm-trigger-shadow` 缺省由内高光改为 `none`。浮层 content 由「`--xh-border-subtle` 描边 +
frosted 落影 + 透明顶光」改为 floating 三件套：`--xh-border-default` 描边 + `--xh-bg-surface` 底 +
`--xh-elevation-floating` 落影，顶光伪元素与 backdrop 两行删除，`--xh-date-picker-content-highlight` /
`--xh-date-picker-content-backdrop` 槽删除。time-item 选中面由「`--xh-bg-brand-subtle` 底 + `--xh-fg-brand` 字 +
medium 字重」改为透明底 + 末端对号、正文与字重保持 rest（§7.3 浮层瞬态集合）；preset 与 time-item 新增按下
`--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面），新增 `--xh-date-picker-preset-bg-pressed` /
`--xh-date-picker-time-item-bg-pressed` 覆盖槽。content / preset-group / time-column 加
`overscroll-behavior: contain`；三端自绘条改传 `size: 'sm'` 并补横轴（皮肤 `overflow: auto` 两轴都滚）；preset-group
（竖 + 横）与每一 time-column（竖）各自接一路贴层（`anchor: 'layer'`）的自绘条，条子节点紧跟在该列之后、贴其盒子，
列的原生细条随之隐藏，content 上声明 `--xh-scrollbar-track-bg: transparent`，选项列与日历之间的空当改按
`preset-group ~ calendar` 取。time-item 的行字色与字重改按值选择族同一套映射：新增
`--xh-date-picker-time-item-fg`（rest 字色，缺省家族行字色 `--xh-material-frosted-fg`，各主题与 forced-colors 下
与 `--xh-fg-default` 同值）与 `--xh-date-picker-time-item-font-weight-selected`（缺省 regular）覆盖槽。label 的
`--xh-date-picker-label-font-size` 缺省由随档的私有槽改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。
