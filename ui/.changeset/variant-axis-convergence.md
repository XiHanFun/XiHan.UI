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

**date-range-picker 接入 Field Chrome / Action Control / Collection Item，浮层改 floating 材质，去 raised 落影，
`--xh-date-range-picker-content-highlight` / `--xh-date-range-picker-content-backdrop` 槽退役。** connect 在
control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；
trigger（日历钮，`display="always"`）与 clear-trigger（`display="has-value"` + `data-xh-action-has-value`）投影
field-inset ghost 档；preset 投影 `data-xh-collection-item` / `-size` / `-context="overlay"`。皮肤删除 control
自画盒与五态、三档 variant 块与 `--xh-_date-range-picker-control-*` 形态私有槽，改为映射家族桥接槽
（`--xh-date-range-picker-control-*` 使用者槽保留，`--xh-date-range-picker-control-shadow` 缺省改为 `none`，盒上
指针 `default`）。默认外观变化：outline 档描边由透明改为 `--xh-border-control`，不再带 `--xh-elevation-raised`
落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；打开中的 control 不再另画焦点环；disabled 描边由
家族落 `--xh-border-default`；两组段位的反白前景由 `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`。日历钮与清空钮
由「`--xh-control-action-size` 方盒、control 圆角、悬停 200、按下 300、打开中 300」改为 field-inset 档正方盒、
inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，打开中与悬停同档；
`--xh-date-range-picker-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。浮层 content 由
「`--xh-border-subtle` 描边 + frosted 落影 + 透明顶光」改为 floating 三件套：`--xh-border-default` 描边 +
`--xh-bg-surface` 底 + `--xh-elevation-floating` 落影，顶光伪元素与 backdrop 两行删除，
`--xh-date-range-picker-content-highlight` / `--xh-date-range-picker-content-backdrop` 槽删除。preset 新增按下
`--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面），新增 `--xh-date-range-picker-preset-bg-pressed`
覆盖槽。content 与 preset-group 加 `overscroll-behavior: contain`；三端 content 自绘条改传 `size: 'sm'` 并补横轴
（皮肤 `overflow: auto` 两轴都滚）；preset-group 接一路贴层（`anchor: 'layer'`，竖 + 横）的自绘条，条子节点紧跟
在该列之后、贴其盒子，列的原生细条随之隐藏，content 上声明 `--xh-scrollbar-track-bg: transparent`，选项列与
日历之间的空当改按 `preset-group ~ calendar` 取；Vue 的 `XhDateRangePickerPresetGroup` 因此以片段作根，直通属性由
组件自己接住落到列节点。label 的 `--xh-date-range-picker-label-font-size` 缺省由随档的私有槽改为
`--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

**time-picker 接入 Field Chrome / Action Control / Collection Item，浮层改 floating 材质，去 raised 落影，
时间格选中只留对号，`--xh-time-picker-content-highlight` / `-backdrop` 与 `--xh-time-picker-item-bg-checked` /
`-bg-checked-hover` / `-fg-checked` / `-weight-checked` 槽退役。** connect 在 control 上投影 `data-xh-field-chrome`
/ `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；trigger（展开钮，`display="always"`）与
clear-trigger（`display="has-value"` + `data-xh-action-has-value`）投影 field-inset ghost 档；preset 与 item 投影
`data-xh-collection-item` / `-size` / `-context="overlay"`。皮肤删除 control 自画盒与五态、三档 variant 块与
`--xh-_time-picker-control-*` 形态私有槽，改为映射家族桥接槽（`--xh-time-picker-control-*` 使用者槽保留，
`--xh-time-picker-control-shadow` 缺省改为 `none`，盒上指针 `default`）。默认外观变化：outline 档描边由透明改为
`--xh-border-control`，不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随
`tone`；打开中的 control 不再另画焦点环；disabled 描边由家族落 `--xh-border-default`；段位反白前景由
`--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`，段位悬停底由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`
（100，canvas 承载）。展开钮与清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停 200、按下 300、打开中
300」改为 field-inset 档正方盒、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+
0.97 按压，打开中与悬停同档；`--xh-time-picker-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。
浮层 content 由「`--xh-border-subtle` 描边 + frosted 落影 + 透明顶光」改为 floating 三件套：`--xh-border-default`
描边 + `--xh-bg-surface` 底 + `--xh-elevation-floating` 落影，顶光伪元素与 backdrop 两行删除，
`--xh-time-picker-content-highlight` / `--xh-time-picker-content-backdrop` 槽删除。item 选中面由
「`--xh-bg-brand-subtle` 底 + `--xh-fg-brand` 字 + medium 字重」改为透明底 + 末端对号、正文与字重保持 rest
（§7.3 浮层瞬态集合）：`--xh-time-picker-item-bg-checked` / `-bg-checked-hover` / `-weight-checked` 槽删除，
`--xh-time-picker-item-fg-checked` 改名为 `--xh-time-picker-item-fg-selected`（与值选择族同名），新增
`--xh-time-picker-item-font-weight-selected`（缺省 regular）；item 的 rest 字色缺省由 `--xh-fg-default` 改为家族
行字色 `--xh-material-frosted-fg`（各主题与 forced-colors 下同值）。preset 与 item 新增按下 `--xh-bg-subtle-hover`
（200）与按压时长（此前零 `:active` 面），新增 `--xh-time-picker-preset-bg-pressed` / `--xh-time-picker-item-bg-pressed`
覆盖槽。preset-group 与各 column 加 `overscroll-behavior: contain`，各自接一路贴层（`anchor: 'layer'`，竖）的
自绘条：条子节点紧跟在该列之后、贴其盒子，列的原生细条随之隐藏，content 上声明
`--xh-scrollbar-track-bg: transparent`，列与列之间的分隔线改按 `column ~ column` 取；Vue 的
`XhTimePickerPresetGroup` / `XhTimePickerColumn` 因此以片段作根，直通属性由组件自己接住落到列节点。label 的
`--xh-time-picker-label-font-size` 缺省由随档的私有槽改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

**time-range-picker 接入 Field Chrome / Action Control / Collection Item，浮层改 floating 材质，去 raised 落影，
时间格选中只留对号，`--xh-time-range-picker-content-highlight` / `-backdrop` 与 `--xh-time-range-picker-item-bg-checked`
/ `-bg-checked-hover` / `-fg-checked` / `-weight-checked` 槽退役。** 与 time-picker 同构：connect 在 control 上投影
`data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；trigger（展开钮，
`display="always"`）与 clear-trigger（`display="has-value"` + `data-xh-action-has-value`）投影 field-inset ghost
档；preset 与 item 投影 `data-xh-collection-item` / `-size` / `-context="overlay"`。皮肤删除 control 自画盒与
五态、三档 variant 块与 `--xh-_time-range-picker-control-*` 形态私有槽，改为映射家族桥接槽
（`--xh-time-range-picker-control-*` 使用者槽保留，`--xh-time-range-picker-control-shadow` 缺省改为 `none`，盒上
指针 `default`）。默认外观变化：outline 档描边由透明改为 `--xh-border-control`，不再带 `--xh-elevation-raised`
落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；打开中的 control 不再另画焦点环；disabled 描边由
家族落 `--xh-border-default`；两组段位的反白前景由 `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`，段位悬停底由
`--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100）。展开钮与清空钮由「`--xh-control-action-size` 方盒、
control 圆角、悬停 200、按下 300、打开中 300」改为 field-inset 档正方盒、inset 圆角、悬停 `--xh-bg-subtle`（100）、
按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，打开中与悬停同档；`--xh-time-range-picker-action-radius` 缺省由
`--xh-shape-control` 改为 `--xh-shape-inset`。浮层 content 由「`--xh-border-subtle` 描边 + frosted 落影 + 透明
顶光」改为 floating 三件套：`--xh-border-default` 描边 + `--xh-bg-surface` 底 + `--xh-elevation-floating` 落影，
顶光伪元素与 backdrop 两行删除，`--xh-time-range-picker-content-highlight` / `--xh-time-range-picker-content-backdrop`
槽删除。item 选中面由「`--xh-bg-brand-subtle` 底 + `--xh-fg-brand` 字 + medium 字重」改为透明底 + 末端对号、
正文与字重保持 rest（§7.3 浮层瞬态集合）：`--xh-time-range-picker-item-bg-checked` / `-bg-checked-hover` /
`-weight-checked` 槽删除，`--xh-time-range-picker-item-fg-checked` 改名为 `--xh-time-range-picker-item-fg-selected`
（与值选择族同名），新增 `--xh-time-range-picker-item-font-weight-selected`（缺省 regular）；item 的 rest 字色缺省由
`--xh-fg-default` 改为家族行字色 `--xh-material-frosted-fg`（各主题与 forced-colors 下同值）。preset 与 item 新增
按下 `--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面），新增 `--xh-time-range-picker-preset-bg-pressed`
/ `--xh-time-range-picker-item-bg-pressed` 覆盖槽。content（横向）、preset-group 与各 column 加
`overscroll-behavior: contain`；content 的横向自绘条三端接在浮层壳上（`size: 'sm'`，浮层壳记进层分支），
preset-group 与各 column 各接一路贴层（`anchor: 'layer'`，竖）的自绘条：条子节点紧跟在该列之后、贴其盒子，列的
原生细条随之隐藏，positioner 与 content 上声明 `--xh-scrollbar-track-bg: transparent`，列与列之间的分隔线改按
`column ~ column` 取；Vue 的 `XhTimeRangePickerPresetGroup` / `XhTimeRangePickerColumn` 因此以片段作根，直通属性
由组件自己接住落到列节点。label 的 `--xh-time-range-picker-label-font-size` 缺省由随档的私有槽改为
`--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

**input-group 组壳改为字段描边式，去 raised 落影。** 组壳（root 的 `::before` 外轮廓）静息描边由 `--xh-border-subtle`
改为 `--xh-border-control`、悬停由 `--xh-border-default` 改为 `--xh-border-control-hover`；`--xh-input-group-shadow`
缺省由 `--xh-elevation-raised` 改为 `none`（槽保留）。`subtle` 档悬停浮出的描边由 `--xh-border-default` 改为
`--xh-border-control`，`ghost` 档悬停同样浮出 `--xh-border-control`（此前 ghost 悬停边取基础规则的
`--xh-border-default`）。子字段压平规则以 `[data-xh-field-chrome]` 为键，接入家族的字段在组内自动压平为透明，
不另画一层。

**prompt-input 接入 Field Chrome 与 Action Control，去 soft 材质与顶光 / 背景模糊，输入段改透明。** connect 在 root
上投影 `data-xh-field-chrome` / `data-xh-field-size`（缺省 `md`，`data-variant` 已缺省 `outline`），input 投影
`data-xh-field-input`（刻意不投影 `data-xh-field-layout`），submit-trigger 投影 Action Control `profile="text"` /
`display="always"` / `size`，`variant` 按 loading 在 `solid`（发送，与 Button 缺省同为品牌实心）与 `subtle`（停止，
中性淡底）间切换，并与原生 `disabled` 同步投影 `data-disabled`。皮肤删除 root 的 soft 材质私有槽、渐变顶光、
backdrop 两行、自写 hover / focus-within / disabled 与三档 variant 块，改为映射家族桥接槽（`--xh-prompt-input-bg`
/ `-bg-hover` / `-bg-disabled` / `-border` / `-border-hover` / `-border-focus` / `-shadow` / `-radius` / `-p` /
`-gap` / `-icon-size` 使用者槽保留为第一参数，`--xh-prompt-input-shadow` 缺省改为 `none`，`--xh-field-control-height`
落 `auto` 随内容长高）。默认外观变化：root 由「M1 soft 底 + soft 描边 + 顶光 + 背景模糊 + soft 落影」（outline
档已是 canvas + border-control）改为家族描边式，全部三档不再有落影与顶光；焦点描边一律 `--xh-border-control-focus`，
不再随 `tone`；disabled 描边由家族落 `--xh-border-default`；生成中（`data-loading`）外框仍保持默认前景与文本光标。
textarea 由「`--xh-material-soft-focus-surface` 实体阅读底 + `--xh-material-soft-fg` 字」改为透明底 + `--xh-fg-default`
字（`--xh-prompt-input-input-fg` / `-input-font-size` / `-placeholder-fg` / `-input-autofill-bg` / `-input-autofill-fg`
使用者槽保留，自动填充底缺省改为 `--xh-bg-canvas`）。发送钮的品牌实心 / 悬停 / 按下 / 0.97 按压 / 焦点环 / 禁用面
改由家族 text solid 档给（`--xh-prompt-input-send-bg*` / `-send-fg` / `-send-bg-off` / `-stop-bg*` / `-stop-fg` /
`-submit-px` / `-submit-radius` / `-submit-shadow` / `-submit-font-size` / `-submit-font-weight` 使用者槽保留），
停止身份的悬停 / 按下由自写 200 / 300 改为家族 subtle 档 200 / 300。

**field 的 control 接入 Field Chrome，去 raised 落影、加描边。** connect 在 control（作者自己的原生控件）上投影
`data-xh-field-chrome` / `data-xh-field-size="md"` / `data-variant="outline"`（Field 没有 size / variant 轴，固定投这
两档），控件自身即视觉盒。皮肤删除 control 自写的边、底、影、圆角、outline、transition 与 hover / focus-visible /
invalid / disabled 四条规则，改为映射家族桥接槽：`--xh-field-control-h` / `-px` / `-bg` / `-bg-hover` / `-bg-disabled`
/ `-fg` / `-border` / `-border-hover` / `-border-focus` / `-border-invalid` / `-shadow` / `-radius` / `-font-size`
使用者槽保留，新增 `--xh-field-control-bg-readonly`（只读底，缺省 `--xh-bg-subtle`）；`--xh-field-control-ring` 槽删除
（焦点环一律公共 `--xh-ring-focus`）。默认外观变化：静息由「透明边 + `--xh-elevation-raised` 落影」改为
`--xh-border-control` 描边 + `--xh-bg-canvas` 底 + 无影（`--xh-field-control-shadow` 缺省改为 `none`）；悬停描边由
`--xh-border-default` 改为 `--xh-border-control-hover`；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；
只读换 `--xh-bg-subtle` 底；禁用由家族落 `--xh-border-default` 描边 + `--xh-bg-subtle` 底 + `--xh-fg-disabled`。
Vue / React 的 `XhFieldControl` 把属性合并到自带解剖的子节点（库内薄封装或写了 `data-scope` 的元素）时，与
`data-scope` / `data-part` 一并剔除家族标记（`data-xh-*`）与 `data-variant`，封装根上不会再套一层字段外壳、作者在
封装上写的形态也不被盖掉；`useFieldControl` 同样只交出接线属性。Web Components 的 `<xh-field>` 把 control 属性直接
打在作者标出的节点上：`control` 应标在真控件（`<input>` / `<textarea>` / `<select>`）上，标在包裹层上会在真控件外
多出一层外壳。

**form 的提交 / 重置钮接入 Action Control，错误摘要去 raised 落影。** connect 在 submit-trigger 上投影
`data-xh-action-control` / `profile="text"` / `variant="solid"`（表单提交是主要动作，与 Button 缺省同为品牌实心）/
`display="always"` / `size="md"`，reset-trigger 同样投影但 `variant="outline"`（非 Button 的触发器缺省中性描边）。
皮肤删除两颗钮自写的盒、底、边、字体、transition、hover / active / 缩放 / disabled 与提交钮的品牌底 / 高光规则，
改为映射家族桥接槽（`--xh-form-trigger-h` / `-px` / `-radius` / `-font-size` / `-bg` / `-bg-hover` / `-bg-active` /
`-bg-disabled` / `-fg` / `-border` / `-border-hover` / `-border-disabled` 与 `--xh-form-submit-bg` / `-bg-hover` /
`-bg-active` / `-fg` / `-border` / `-border-hover` / `-border-active` / `-shadow` 使用者槽保留为第一参数）。默认外观
变化：重置钮由「`--xh-bg-subtle` 淡底 + `--xh-border-control` 描边、悬停 200 / 按下 300」改为透明底 +
`--xh-border-control` 描边、悬停 `--xh-bg-subtle`（100）/ 按下 `--xh-bg-subtle-hover`（200）；提交钮的品牌实心、
悬停 / 按下、0.97 按压、currentColor 焦点环与顶边内高光改由家族给，禁用面由家族落 `--xh-bg-subtle` 底 +
`--xh-fg-disabled`（`--xh-form-trigger-bg-disabled` / `-border-disabled` 仍可覆盖）；error-summary 的
`--xh-form-summary-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`（静态反馈面只靠描边分层）。

**fieldset 的组标题归集合标题角色。** legend 的 `--xh-fieldset-legend-fg` 缺省由 `--xh-fg-default` 改为
`--xh-fg-muted`（§6.4 集合标题：`--xh-fg-muted`，与组 `--xh-space-2`，字号字重同字段标签）；无效 / 禁用 /
必填星、说明与错误文案不变。

**field-array 的四颗把手接入 Action Control，阶梯改 100 / 200。** connect 在 item-delete-trigger /
move-up-trigger / move-down-trigger 上投影 `data-xh-action-control` / `profile="icon"` / `variant="ghost"` /
`display="always"` / `size="xs"`（24px 正方盒，与此前 `--xh-control-action-size` 同尺寸），add-trigger 投影
`profile="text"` / `variant="outline"` / `display="always"` / `size="md"`。皮肤删除四颗钮自写的盒、底、边、字体、
transition、hover / active / 缩放 / `[aria-disabled]` 规则，改为映射家族桥接槽（`--xh-field-array-trigger-size` /
`-radius` / `-bg` / `-bg-hover` / `-bg-active` / `-fg` / `-fg-hover` / `-font-size`、`--xh-field-array-item-delete-fg-hover`、
`--xh-field-array-add-height` / `-px` / `-radius` / `-bg` / `-bg-hover` / `-bg-active` / `-fg` / `-border` /
`-border-hover` / `-border-disabled` / `-font-size`、`--xh-field-array-action-gap` 使用者槽保留为第一参数）；
add-trigger 保留 `border-style: dashed`。默认外观变化：三颗行内把手与新增钮的悬停由 `--xh-bg-subtle-hover`（200）
改为 `--xh-bg-subtle`（100）、按下由 `--xh-bg-subtle-active`（300）改为 `--xh-bg-subtle-hover`（200）（白底承载
阶梯）；`--xh-field-array-icon-size` 由 root 上的 `--xh-glyph-size-text`（随文 1em）改为各钮按档取
`--xh-_action-profile-glyph-size`（行内把手 16px、新增钮 20px），只在四颗钮上生效；粗指针下四颗钮由家族
外扩 44px 热区；禁用面由家族按 `data-disabled` 给（透明底 + `--xh-fg-disabled`，新增钮描边 `--xh-border-subtle`）。

**card 的 outline 卡面补 `--xh-border-default` 描边，subtle 去落影，标题与说明按 Surface 排版档。**
`--xh-card-border` 缺省由 `transparent` 改为 `--xh-border-default`（Card 是唯一登记 raised 的静态面，raised
必带描边，边界由描边承担、落影只是抬起的加成）；subtle 档改为 `--xh-bg-subtle` 淡底 + 透明占位边 + 无影
（`--xh-card-shadow` 在 subtle 与 ghost 两档的缺省都是 `none`），ghost 档补透明占位边，三档几何一致。
`--xh-card-title-font-weight` 缺省由 `--xh-font-weight-medium` 改为 `--xh-font-weight-semibold`（Surface 标题
14/600）；`--xh-card-description-font-size` 缺省由 `--xh-text-label-size` 改为 `--xh-text-secondary-size`、
`--xh-card-description-leading` 由 `--xh-text-body-leading` 改为 `--xh-leading-normal`（说明 13/fg-muted）；
`--xh-card-p` 缺省由 `--xh-space-4` 改为 `--xh-surface-pad-lg`（同为 16px，Surface 内衬只走 `--xh-surface-*`）。

**alert 改中性描边面去 raised 落影，关闭钮接入 Action Control，指示符统一 md 档。** 根面的
`--xh-alert-border` 缺省由 `transparent` 改为 `--xh-border-default`、`--xh-alert-bg` 缺省直接落 `--xh-bg-surface`、
`--xh-alert-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`（静态反馈面只靠描边分层，私有槽
`--xh-_alert-surface` / `--xh-_alert-edge` 删除）；`--xh-alert-icon-size` 在 root 上的缺省由 `--xh-glyph-size-sm`
改为 `--xh-glyph-size-md`（Feedback 指示符统一 md）。connect 在 close-trigger 上投影 `data-xh-action-control` /
`profile="icon"` / `variant="ghost"` / `display="always"` / `size="sm"`；皮肤删除关闭钮自写的盒、底、字体、
transition、hover / active / 缩放 / disabled 规则与粗指针外扩伪元素，改为映射家族桥接槽（`--xh-alert-close-size` /
`-radius` / `-bg-hover` / `-bg-active` / `-fg` / `-fg-hover` 使用者槽保留为第一参数，`--xh-alert-icon-size` 在关闭钮上
按 sm 档取 16px）。默认外观变化：关闭钮悬停由 `--xh-_tone-subtle-hover`（20%）改为 `--xh-_tone-subtle`（12%）、按下由
`--xh-_tone-subtle-active`（28%）改为 `--xh-_tone-subtle-hover`（20%）（白底承载阶梯，随语气）；粗指针热区与禁用面
（透明底 + `--xh-fg-disabled`）改由家族给。

**toast 改 sheet 三件套，两颗钮接入 Action Control，指示符统一 md 档，标题与说明按 Feedback 排版档。**
`--xh-toast-border` 缺省由 `transparent` 改为 `--xh-material-elevated-border`、`--xh-toast-bg` 由 `--xh-bg-surface`
改为 `--xh-material-elevated-bg`、`--xh-toast-fg` 由 `--xh-fg-default` 改为 `--xh-material-elevated-fg`、
`--xh-toast-shadow` 由 `--xh-elevation-sheet` 改为 `--xh-material-elevated-shadow`（sheet 面必有 1px 描边，亮暗两档
同源；亮色 `--xh-material-elevated-bg` 为 oklch 0.99 非纯白，与页面白底有极浅色差，属 sheet 三件套既定取值，与 dialog
同）。`--xh-toast-icon-size` 在 root 上的缺省由 `--xh-glyph-size-sm` 改为 `--xh-glyph-size-md`；
`--xh-toast-title-font-weight` 缺省 medium → semibold，`--xh-toast-description-font-size` 缺省 `--xh-text-label-size` →
`--xh-text-secondary-size`、`--xh-toast-description-leading` `--xh-text-body-leading` → `--xh-leading-normal`。
connect 在 action-trigger 上投影 `data-xh-action-control` / `profile="text"` / `variant="outline"` / `display="always"` /
`size="sm"`，close-trigger 投影 `profile="icon"` / `variant="ghost"` / `display="always"` / `size="xs"`（24px，与此前
`--xh-control-action-size` 同尺寸；显隐仍由皮肤按 root 悬停 / 焦点只压 opacity，不走家族的 hover-focus——那一档用
visibility 收起，占 Tab 位的叉会被键盘漏掉）。皮肤删除两颗钮自写的盒、底、边、字体、transition、hover / active /
缩放 / disabled 规则与粗指针外扩伪元素，改为映射家族桥接槽（`--xh-toast-action-h` / `-px` / `-radius` / `-bg` /
`-bg-hover` / `-bg-active` / `-fg` / `-border` / `-font-weight` 与 `--xh-toast-close-size` / `-radius` / `-bg` /
`-bg-hover` / `-bg-active` / `-border` / `-fg` / `-fg-hover` 使用者槽保留为第一参数）。默认外观变化：操作钮由
「`--xh-bg-subtle` 淡底 + `--xh-border-default` 描边、悬停 200 / 按下 300、字号随条子 14px」改为透明底 +
`--xh-border-control` 描边、悬停 `--xh-bg-subtle`（100）+ `--xh-border-control-hover` / 按下 `--xh-bg-subtle-hover`
（200）、字号取 sm 档 `--xh-control-font-sm`，底 / 边 / 字钉在中性面上不随 `tone`；关闭钮由「`--xh-bg-subtle` 淡底 +
`--xh-border-default` 描边、悬停 200 / 按下 300」改为静息透明无边、悬停 `--xh-_tone-subtle`（12%，随语气）/ 按下
`--xh-_tone-subtle-hover`（20%）；粗指针热区与禁用面改由家族给；compact 密度下关闭钮固定 24px（此前 20px）。

**notification 卡片改 sheet 三件套，两颗钮接入 Action Control，卡片内图标统一 md 档。**
`--xh-notification-item-border` 缺省由 `--xh-border-default` 改为 `--xh-material-elevated-border`、`--xh-notification-item-bg`
由 `--xh-bg-surface-raised` 改为 `--xh-material-elevated-bg`、`--xh-notification-item-fg` 由 `--xh-fg-default` 改为
`--xh-material-elevated-fg`、`--xh-notification-item-shadow` 由 `--xh-elevation-sheet` 改为 `--xh-material-elevated-shadow`
（与 toast 同一套 sheet 三件套）；`--xh-notification-icon-size` 在 item 上的缺省由 `--xh-control-indicator-size` 改为
`--xh-glyph-size-md`（Feedback 指示符统一 md；叉与操作钮的字形改按各自按钮档取值）。connect 在 item-action-trigger 上
投影 `data-xh-action-control` / `profile="text"` / `variant="outline"` / `display="always"` / `size="sm"`，
item-close-trigger 投影 `profile="icon"` / `variant="ghost"` / `display="always"` / `size="sm"`（32px，钉在卡片角上的
叉与浮层角落关闭钮同一档）。皮肤删除两颗钮自写的盒、底、边、字体、transition、hover / active / 缩放 / disabled 规则与
粗指针外扩伪元素，改为映射家族桥接槽（`--xh-notification-action-h` / `-px` / `-radius` / `-bg` / `-bg-hover` /
`-bg-active` / `-fg` / `-border` / `-font-weight` 与 `--xh-notification-close-size` / `-radius` / `-bg-hover` /
`-bg-active` / `-fg` / `-fg-hover` 使用者槽保留为第一参数）。默认外观变化：操作钮由「`--xh-bg-subtle` 淡底 +
`--xh-border-default` 描边、悬停 200 / 按下 300、字号随卡片 14px」改为透明底 + `--xh-border-control` 描边、悬停
`--xh-bg-subtle`（100）+ `--xh-border-control-hover` / 按下 `--xh-bg-subtle-hover`（200）、字号取 sm 档
`--xh-control-font-sm`，底 / 边 / 字钉在中性面上不随 `tone`；叉的悬停由 `--xh-bg-subtle-hover`（200）改为
`--xh-_tone-subtle`（12%，随语气）/ 按下由 `--xh-bg-subtle-active`（300）改为 `--xh-_tone-subtle-hover`（20%）；
粗指针热区与禁用面改由家族给。

**empty-state 的标题与说明按 Surface 排版档。** md 档标题由 `--xh-control-font-lg`（16px）改为 `--xh-text-label-size`
（14/600，Surface / Feedback 标题档；真源 §6.4 只有 14/600 与页面级 heading-3 两档），sm 档不再另给字号（同 14），
lg 档仍为 `--xh-text-heading-3-size`；`--xh-empty-state-description-font-size` 缺省由 `--xh-text-body-size` 改为
`--xh-text-secondary-size`、`--xh-empty-state-description-leading` 由 `--xh-text-body-leading` 改为 `--xh-leading-normal`
（说明 13/fg-muted）。根面无壳，不画边、底与影，未变。

**code-view 根面去 raised 落影，折叠条接入 Action Control disclosure-trigger 档。** `--xh-code-view-shadow` 缺省由
`--xh-elevation-raised` 改为 `none`（静态内容面 = `--xh-border-default` 描边 + `--xh-bg-surface` + 无影，边与底未变）。
connect 在 fold-trigger 上投影 `data-xh-action-control` / `profile="disclosure-trigger"` / `variant="ghost"` /
`display="always"` / `size`（随 `size`，缺省 md）。皮肤删除折叠条自写的盒、底、字体、transition、hover 与整条缩放规则，
改为映射家族桥接槽（`--xh-code-view-px` / `--xh-code-view-fold-py` / `--xh-code-view-header-font-size` /
`--xh-code-view-fold-fg` / `--xh-code-view-fold-bg-hover` / `--xh-code-view-header-border` 使用者槽保留为第一参数，
圆角归零贴住卡边，顶边分隔线经家族四个状态的边色槽映射保持在场）。默认外观变化：悬停由 `--xh-bg-subtle-hover`（200）
改为 `--xh-bg-subtle`（100，白底承载），按下由整条缩放 0.97 改为只换面到 `--xh-bg-subtle-hover`（200）；折叠条的
最小高度取 md 档 `--xh-control-h-md`（36px，此前随内容约 31px），字与内衬不变。

**diff-view 根面改 border-default 描边去 raised 落影，折叠格按钮接入 Action Control disclosure-trigger 档，图标改 md 档。**
`--xh-diff-view-border` 缺省由 `--xh-border-subtle` 改为 `--xh-border-default`、`--xh-diff-view-shadow` 缺省由
`--xh-elevation-raised` 改为 `none`（静态内容面 = 描边 + `--xh-bg-surface` + 无影，`--xh-border-subtle` 不作根面外边）；
头部下边、行号列右边与并排接缝的内部分隔线从 `--xh-diff-view-border` 拆出新槽 `--xh-diff-view-divider`（缺省
`--xh-border-subtle`），此前一把 `--xh-diff-view-border` 同时改根边与分隔线的作者需再写 `--xh-diff-view-divider`。
`--xh-diff-view-icon-size` 缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md` 并随 `data-size` 换档
（sm 16 / md 20 / lg 24；截断提示条的警告字形随之）。connect 在 gap-trigger 上投影 `data-xh-action-control` /
`profile="disclosure-trigger"` / `variant="ghost"` / `display="always"` / `size`（随 `size`，缺省 md）；皮肤删除折叠格按钮
自写的盒、底、字体、transition、hover 与整条缩放规则，改为映射家族桥接槽（`--xh-diff-view-px` / `--xh-diff-view-font-size` /
`--xh-diff-view-gap-fg` / `--xh-diff-view-gap-bg-hover` 使用者槽保留为第一参数，高度锚在 `--xh-diff-view-line-height` 上
与相邻代码行同高），gap 行作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`。默认外观变化：按下由整条缩放 0.97
改为只换面到 `--xh-bg-subtle-active`（300，淡底承载），悬停仍为 `--xh-bg-subtle-hover`（200）。

**log 根面改 surface 底，回底钮接入 Action Control floating 档并改 frosted 四件套。** `--xh-log-bg` 缺省由
`--xh-bg-subtle` 改为 `--xh-bg-surface`（描边与淡底互斥：`--xh-border-default` 描边 + surface 底 + 无影，与
code-view / diff-view / json-viewer 同走 solid），root 新增 `--xh-log-shadow` 槽（缺省 `none`）。connect 在
scroll-to-end-trigger 上投影 `data-xh-action-control` / `profile="floating"` / `variant="ghost"` / `display="always"` /
`size="xs"`（`--xh-control-box-sm` 32px，与此前 `--xh-control-h-sm` 同尺寸）。皮肤删除回底钮自写的盒、边、底、影、
transition、hover 与缩放规则，改为映射家族桥接槽（`--xh-log-scroll-to-end-trigger-size` / `-radius` / `-bg` / `-bg-hover` /
`-border` / `-shadow` / `-fg` 使用者槽保留为第一参数）；材质由「`--xh-bg-surface-raised` + `--xh-border-default` +
`--xh-elevation-raised`」改为角落浮钮族的 frosted 四件套（`--xh-material-frosted-bg / -border / -shadow / -backdrop`，
字色 `--xh-material-frosted-fg`；raised 只给 Card 与可抬起部件）。`--xh-log-icon-size` 从 root 移到回底钮上，缺省由
`--xh-glyph-size-text` 改为家族 xs 档字形 `--xh-_action-profile-glyph-size`（16px）。默认外观变化：悬停由
`--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下换面到 `--xh-bg-subtle-hover`（200）并保留
0.97 缩放；粗指针热区与禁用面改由家族给。

**json-viewer 三端不再渲染自绘滚动条，分支行补按压换面，图标改 md 档。** 树档 / 原文档容器是页内结构容器
（与 Tree 同类），真源 §6.6 把自绘条只给浮层与定高小列表：Vue / React / Web Components 删除 `useScrollbars` /
`ScrollbarsController` 接线，root 下不再挂 `[data-scope="scrollbar"]` 节点、`tree` / `text` 不再带 `data-xh-scrollbar`，
两档容器走 reset 层的原生细条（依赖 `[data-scope][data-part]` 节点或作者容器的 `data-xh-scroll`）；皮肤删除 root 上的
`--xh-scrollbar-track-bg: transparent` 死声明与 `position: relative`。以「root 下有条子」为前提的 DOM 查询与样式需改。
面的写法收敛：`tree` / `text` / `empty` 三块面直接写 `--xh-json-viewer-border` → `--xh-border-default`、
`--xh-json-viewer-bg` → `--xh-bg-surface`，新增 `--xh-json-viewer-shadow`（缺省 `none`），subtle / ghost 两档改由
root 的 `data-variant` 向三块面下发透明边与底（此前经私有槽 `--xh-_json-viewer-border` / `-bg` 中转，外观逐值不变）。
分支行 `branch-control` 新增按下换面 `--xh-json-viewer-row-bg-active`（缺省 `--xh-bg-subtle-hover`，白底承载 hover 100 →
pressed 200，集合行不允许零反馈）。`--xh-json-viewer-icon-size` 缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md`
并随 `data-size` 换档（sm 16 / md 20 / lg 24；展开箭头的兜底字形随之）。

**tool-call 根面改 border-default 描边去 raised 落影，开关接入 Action Control disclosure-trigger 档，退场改 exit 曲线。**
`--xh-tool-call-border` 缺省由 `--xh-border-subtle` 改为 `--xh-border-default`、`--xh-tool-call-shadow` 缺省由
`--xh-elevation-raised` 改为 `none`（静态内容面 = 描边 + `--xh-bg-surface` + 无影；subtle 档随之无影；语气色条叠写时
以 `0 0 0 transparent` 零影占位）；审批位与详情区的内部分隔线从 `--xh-tool-call-border` 拆出新槽 `--xh-tool-call-divider`
（缺省 `--xh-border-subtle`），此前一把 `--xh-tool-call-border` 同时改根边与分隔线的作者需再写 `--xh-tool-call-divider`。
connect 在 trigger 上投影 `data-xh-action-control` / `profile="disclosure-trigger"` / `variant="ghost"` / `display="always"` /
`size`（随 `size`，缺省 md）；皮肤删除开关自写的盒、底、字体、transition、hover / 缩放 / disabled 规则，改为映射家族桥接槽
（`--xh-tool-call-px` / `-py` / `-font-size` / `-trigger-gap` / `-trigger-fg` / `-trigger-bg-hover` / `-trigger-radius` 使用者槽
保留为第一参数，内衬沿用卡片档位），subtle 档根面作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`。
`--xh-tool-call-icon-size` 在 root 上的缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md`，开关内的指示符改按家族档字形取值。
详情区收起动画的曲线由 `--xh-motion-ease-enter-strong` 改为 `--xh-motion-ease-exit`（§9.4 退场 exit 档）。默认外观变化：
outline 档悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下由整条缩放 0.97 改为只换面到
`--xh-bg-subtle-hover`（200）；subtle 档悬停 200 / 按下 300；开关最小高度取 md 档 `--xh-control-h-md`（36px，此前随内容约
33px），行内文字行高改 `--xh-leading-none`；粗指针热区与禁用面改由家族给。

**reasoning 淡底面去 raised 落影，outline 档改 border-default 描边，开关接入 Action Control disclosure-trigger 档。**
`--xh-reasoning-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`（缺省 subtle 淡底面无影；语气色条叠写时以
`0 0 0 transparent` 零影占位），outline 档 `--xh-reasoning-border` 缺省由 `--xh-border-subtle` 改为 `--xh-border-default`
（静态内容面 = 描边 + `--xh-bg-surface` + 无影）。connect 在 trigger 上投影 `data-xh-action-control` /
`profile="disclosure-trigger"` / `variant="ghost"` / `display="always"` / `size`（随 `size`；不写时取 sm，与皮肤缺省字号
`--xh-control-font-sm` 同档）；皮肤删除开关自写的盒、底、字体、transition、hover / 缩放 / disabled 规则，改为映射家族桥接槽
（`--xh-reasoning-px` / `-py` / `-font-size` / `-trigger-gap` / `-trigger-fg` / `-trigger-bg-hover` / `-trigger-radius`
使用者槽保留为第一参数，内衬沿用本组件档位），缺省 subtle 根面作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`
（200 → 300），outline / ghost 档改回白底阶梯（100 → 200）。`--xh-reasoning-icon-size` 在 root 上的缺省由
`--xh-glyph-size-text` 改为按 `data-size` 换档（缺省与 sm 档 `--xh-glyph-size-sm` 16px、md 20px、lg 24px，此前 1em），
与开关的家族档位同步。
默认外观变化：按下由整条缩放 0.97 改为只换面到 `--xh-bg-subtle-active`（300）；开关最小高度取 sm 档 `--xh-control-h-sm`
（32px），行内文字行高改 `--xh-leading-none`；开关字色三态停在 `--xh-fg-muted`；粗指针热区与禁用面改由家族给。

**approval 根面改 border-default 描边去 raised 落影，授权行接入 Action Control row 档，两颗钮接入 text 档。**
`--xh-approval-border` 缺省由 `--xh-border-strong` 改为 `--xh-border-default`（语气色边只在作者打了 `tone` 时染上，
拆成独立的 `[data-tone]` 规则）、落定后 `--xh-approval-border-settled` 缺省由 `--xh-border-subtle` 改为
`--xh-border-default`、`--xh-approval-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`（静态内容面 = 描边 +
`--xh-bg-surface` + 无影；subtle 档随之无影）。connect 在 item 上投影 `data-xh-action-control` / `profile="row"` /
`variant="ghost"` / `display="always"` / `size`，在 approve-trigger 上投影 `profile="text"` / `variant="solid"`、在
deny-trigger 上投影 `profile="text"` / `variant="outline"`（档位随 `size`，缺省 md）；两颗钮新增 `data-disabled`
（落定时两颗都投，必选项没勾满时只投批准；判定在途仍只走 `data-loading` + `aria-disabled`，家族给在途面）。
皮肤删除授权行与两颗钮自写的盒、底、边、字体、transition、hover / 缩放 / disabled 规则，改为映射家族桥接槽
（`--xh-approval-item-*`、`--xh-approval-action-*`、`--xh-approval-approve-*`、`--xh-approval-deny-*` 使用者槽保留为
第一参数）；subtle 档根面作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`。默认外观变化：授权行悬停由
`--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下由整行缩放 0.97 改为只换面到
`--xh-bg-subtle-hover`（200），行最小高度取 row 档 `--xh-control-h-md`（36px，此前随内容约 29px），行内文字行高由 UA
`normal` 改为 `--xh-leading-normal`（皮肤在 item 上写正文行高，不吃家族单行档）；批准钮按下同时换底到 `--xh-bg-brand-active`、
必选项没勾满时的置灰底 `--xh-approval-approve-bg-off`
缺省由 `--xh-bg-muted` 改为 `--xh-bg-subtle`；拒绝钮悬停由 200 改为 100、按下换面 200 并浮出 `--xh-border-control-hover`
描边，落定后的描边 `--xh-approval-deny-border-off` 缺省由 `--xh-border-default` 改为 `--xh-border-subtle`（家族 outline
禁用面）。标题字重 `--xh-approval-title-font-weight` 缺省由 `--xh-text-label-weight`（500）改为
`--xh-font-weight-semibold`（600），说明行高由 `--xh-text-body-leading` 改为 `--xh-leading-normal`。connect 在
approve-trigger 上与根同值投影 `data-tone`（与 Button 同构）：家族的深色 solid 规则只看触发器自身的 `data-tone`，此前
暗色下批准钮的实心面会落回品牌色，现在亮暗两态都随 `tone` 取语气色。
`--xh-approval-icon-size` 缺省由 `--xh-glyph-size-text` 改为按 `data-size` 换档（sm 16 / md 20 / lg 24），勾选记号里的勾
改按指示符盒比例量（0.75 盒宽），新增 `--xh-approval-indicator-icon-size` 覆盖它；在途圆环的圆角由 `--xh-shape-pill`
改为 `--xh-shape-circle`（正方盒取圆）。

**question-flow 根面改 border-default 描边去 raised 落影，选项行接入 Action Control row 档，四颗钮接入 icon / text 档。**
`--xh-question-flow-border` 缺省由 `--xh-border-subtle` 改为 `--xh-border-default`、`--xh-question-flow-shadow` 缺省由
`--xh-elevation-raised` 改为 `none`（静态内容面 = 描边 + `--xh-bg-surface` + 无影；subtle 档随之无影），三档形态改由
`data-variant` 规则直接写底与边（此前经私有槽中转，outline / subtle / ghost 观感逐值不变）。connect 在 item 上投影
`data-xh-action-control` / `profile="row"` / `variant="ghost"`，在 prev-trigger / next-trigger 上投影 `profile="icon"` /
`variant="ghost"` / `size="xs"`（24px 方格），在 skip-trigger 上投影 `profile="text"` / `variant="ghost"`、在 submit-trigger 上
投影 `profile="text"` / `variant="solid"`（档位随 `size`，缺省 md）；四颗钮新增 `data-disabled`（与原生 `disabled` 同步，
家族按它给禁用面）。皮肤删除选项行与四颗钮自写的盒、底、边、字体、transition、hover / 缩放 / disabled 规则，改为映射家族
桥接槽（`--xh-question-flow-item-*`、`-step-*`、`-action-*`、`-skip-*`、`-submit-*` 使用者槽保留为第一参数）；subtle 档
根面作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`。默认外观变化：选项行、翻页钮与跳过钮悬停由
`--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下换面到 `--xh-bg-subtle-hover`（200）——选项行
只换面不再缩放，行最小高度取 row 档 `--xh-control-h-md`（36px，此前随内容约 29px），行内文字行高仍是
`--xh-leading-normal`（皮肤在 item 上写回正文行高，不吃家族单行档）；
翻页钮字号取 xs 档 `--xh-control-font-sm`（箭头字形仍按根上的 `--xh-question-flow-icon-size` 量）；提交钮答不动时的置灰底
`--xh-question-flow-submit-bg-off` 缺省由 `--xh-bg-muted` 改为 `--xh-bg-subtle`。题干字重 `--xh-question-flow-prompt-font-weight`
缺省由 `--xh-text-label-weight`（500）改为 `--xh-font-weight-semibold`（600）。单选记号盒的圆角
`--xh-question-flow-indicator-radius-single` 缺省由 `--xh-shape-pill` 改为 `--xh-shape-circle`（正方盒取圆）；记号盒里的勾
`--xh-question-flow-indicator-icon-size` 缺省由 `--xh-glyph-size-text` 改为按盒比例量（0.75 盒宽）。connect 在
submit-trigger 上与根同值投影 `data-tone`（与 Button 同构）：家族的深色 solid 规则只看触发器自身的 `data-tone`，此前
暗色下提交钮的实心面会落回品牌色，现在亮暗两态都随 `tone` 取语气色。

**message-feed 回底钮接入 Action Control floating 档并改 frosted 四件套，粘底视口补稳定滚动槽。** connect 在
scroll-to-end-trigger 上投影 `data-xh-action-control` / `profile="floating"` / `variant="ghost"` / `display="always"` /
`size="xs"`（`--xh-control-box-sm` 32px 正方盒，与此前 `--xh-control-h-sm` 同尺寸）；皮肤删除回底钮自写的盒、边、底、影、
transition、hover / 缩放规则，改为映射家族桥接槽（`--xh-message-feed-scroll-to-end-trigger-*` 使用者槽保留为第一参数），
材质由 raised 三件（`--xh-border-default` + `--xh-bg-surface-raised` + `--xh-elevation-raised`）改为 frosted 四件套
（`--xh-material-frosted-bg` / `-border` / `-shadow` / `-backdrop`，字色 `--xh-material-frosted-fg`；角落浮钮族与
log / back-top 同档）。默认外观变化：悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下
缩放并换面到 `--xh-bg-subtle-hover`（200）；`--xh-message-feed-icon-size` 从 root 移到回底钮，缺省由 `--xh-glyph-size-text`
改为家族 xs 档字形 `--xh-_action-profile-glyph-size`（16px）。viewport 新增 `scrollbar-gutter: stable`（带 `data-xh-scrollbar`
的容器除外）：流式视口的内容高度一直在变，原生条出现与消失时不再推动文字，右侧常留一条条宽的空道。

**accordion outline 根面补 border-default 描边，标题栏接入 Action Control disclosure-trigger 档；collapsible 触发器同档接入。**
accordion 的 outline 档新增使用者槽 `--xh-accordion-border`（缺省 `--xh-border-default`，1px 描边；此前只有底无边），
与条与条之间的分隔线槽 `--xh-accordion-item-border` 各管各的；subtle 档补一圈透明边位（三档几何一致）并作为淡底承载面
下发 `--xh-action-host-bg-hover / -pressed`（200 → 300）。两家的 connect 在 trigger 上投影 `data-xh-action-control` /
`profile="disclosure-trigger"` / `variant="ghost"` / `display="always"` / `size`（随 `size`，缺省 md）；皮肤删除触发器自写的
盒、底、边、字体、transition、hover / 缩放 / disabled 规则与三档私有槽，改为映射家族桥接槽（`--xh-accordion-trigger-*` /
`--xh-collapsible-trigger-*` 使用者槽保留为第一参数，三档 gap / 高度 / 内衬 / 字号取家族 disclosure-trigger 档，与迁移前逐值
相同）。默认外观变化：悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下由整条缩放 0.97 改为
只换面到 `--xh-bg-subtle-hover`（200）；展开态的标题栏不再排除悬停换面（open 与家族 hover 同档中性，字色仍走
`-fg-open`）；粗指针热区与禁用面改由家族给。指示器转向由 `--xh-motion-duration-micro` 改为 `--xh-motion-duration-enter`
（与正文展开同档）；`--xh-accordion-icon-size` / `--xh-collapsible-icon-size` 在 root 上的缺省由 `--xh-glyph-size-text` 改为
`--xh-glyph-size-md`，触发器内的指示符改按家族档字形取值（sm 16 / md 20 / lg 24）。

**toolbar outline 改 border-default 描边去 raised 落影，条目接入 Action Control text 档，选中字色改淡底前景。**
outline 档由「边宽 0 + `--xh-elevation-raised` 落影」改为 `--xh-border-default` 1px 描边 + `--xh-bg-surface` + 无影
（`--xh-toolbar-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`，静态内容面 = 描边 + surface 底 + 无影）；subtle 档
补一圈透明边位（与 outline 同一几何）并作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`（200 → 300）。
connect 在 item 上投影 `data-xh-action-control` / `profile="text"` / `variant="ghost"` / `display="always"` / `size`（随
`size`，缺省 md）；皮肤删除条目自写的盒、底、边、字体、transition、hover / 缩放 / disabled 规则与分组内的重复三态规则，
改为映射家族桥接槽（`--xh-toolbar-item-*` 使用者槽保留为第一参数），分组作为淡底承载面下发 host 槽。`aria-pressed`
选中态的字色 `--xh-toolbar-item-fg-pressed` 缺省由 `--xh-fg-brand-strong` 改为 `--xh-fg-on-brand-subtle`（无滑块开关 =
品牌淡底 + 淡底前景，§7.3），新增 `--xh-toolbar-item-bg-pressed-active`（缺省 `--xh-bg-brand-subtle-active`）作为选中
段的按下面（12% → 20% → 28%）。默认外观变化：ghost 根上散落的条目悬停由 `--xh-bg-subtle-hover`（200）改为
`--xh-bg-subtle`（100，白底承载），按下换面到 `--xh-bg-subtle-hover`（200）并缩放 0.97；分组内条目悬停 200 / 按下 300
且按下同样缩放（此前分组内不缩放）；条目改为定高盒（`block-size` 取档位，此前 `min-block-size`），
边由 0 改为 1px 透明边位（与 Button 同构，border-box 下总高不变）。

**page-header outline 描边改 border-default，subtle 补透明边位，标题字重走标题档令牌。** `--xh-page-header-border`
在 outline 根面上的缺省由 `--xh-border-subtle` 改为 `--xh-border-default`（静态内容面 = 描边 + `--xh-bg-surface` + 无影；
ghost 贴底 `split` 那条分隔线仍缺省 `--xh-border-subtle`）；subtle 档补一圈透明边位，与 outline 同一几何。
`--xh-page-header-title-font-weight` 缺省由字重原语 `--xh-font-weight-semibold` 改为标题档令牌 `--xh-text-heading-3-weight`
（同为 600，观感不变）。

**layout 覆盖档侧栏改 sheet 三件套，折叠把手接入 Action Control text 档。** `data-presentation="sheet"` 的侧栏由只有
`--xh-elevation-sheet` 落影改为 sheet 三件套：`--xh-layout-sider-bg` 在这一档的缺省由 `--xh-bg-subtle` 改为
`--xh-material-elevated-bg`、`--xh-layout-sider-shadow` 缺省由 `--xh-elevation-sheet` 改为 `--xh-material-elevated-shadow`，
并在贴着内容那一侧新描一条 `--xh-layout-border`（这一档缺省 `--xh-material-elevated-border`；`placement="end"` 时描在
行首侧）；占位档的侧栏不变。connect 在 sider-trigger 上投影 `data-xh-action-control` / `profile="text"` / `variant="ghost"` /
`display="always"` / `size="sm"`（把手是一枚装着文字的小档按钮，几何与此前的 `--xh-control-h-sm` / `--xh-control-px-sm` 逐值
相同）；皮肤删除把手自写的盒、底、边、字体、transition、hover / 缩放规则，改为映射家族桥接槽（`--xh-layout-sider-trigger-*`
使用者槽保留为第一参数）；占位档侧栏作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`，覆盖档侧栏换成 elevated
白底后把阶梯写回 100 / 200。默认外观变化：把手摆在顶栏等白底上时悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`
（100），按下换面到 `--xh-bg-subtle-hover`（200）；摆进占位档侧栏时仍是 200 / 300，摆进覆盖档侧栏时同白底 100 / 200；
把手字号由 `--xh-text-secondary-size` 改为家族 sm 档 `--xh-control-font-sm`（同为 13px）。

**descriptions subtle 补透明边位，标签与取值的间距改 space-2。** subtle 档补一圈 `--xh-stroke-thin` 透明边位，与
outline 同一边宽（淡底面 = `--xh-bg-subtle` + 透明边位 + 无影）；outline 档仍是 `--xh-border-default` 描边 +
`--xh-bg-surface` + 无影，网格线 `--xh-border-subtle` 只作内部分隔。标签是每一格的集合标题（14 / 500 /
`--xh-fg-muted`），叠着排时与取值的间距 `--xh-descriptions-pair-gap` 缺省由 `--xh-space-1`（4px）改为
`--xh-space-2`（8px，§6.4 集合标题与集合的间距）；sm 档此前继承 md 的 4px，现同为 8px，lg 档不变。标签在左时的
列间距不变。

**list subtle 补透明边位，淡底档里的 hoverable 条目悬停抬到 200。** subtle 档补一圈 `--xh-stroke-thin` 透明边位，与
outline 同一几何（淡底面 = `--xh-bg-subtle` + 透明边位 + 无影）；outline 档仍是 `--xh-border-default` 描边 +
`--xh-bg-surface` + 无影，`split` 分隔线 `--xh-border-subtle` 只作内部分隔。`--xh-list-item-bg-hover` 的缺省改经根上的
私有槽 `--xh-_list-item-bg-hover` 下发：白底 / ghost / outline 仍是 `--xh-bg-subtle`（100），subtle 档的根把它抬到
`--xh-bg-subtle-hover`（200，§7.2 坐在淡底上的条目按承载面取阶梯；此前与淡底同色，悬停看不出来）。皮肤体积
基线 list.css 3517 → 3883 字节：涨在 subtle 档的透明边位、根上的悬停面私有槽与淡底档对它的覆盖。

**kbd 字号改次级标注档 12px。** `--xh-kbd-font-size` 缺省由 `--xh-text-label-size`（14px）改为
`--xh-text-caption-size`（12px，§6.4 快捷键属次级标注）；键帽高 `--xh-space-6`（24px）、最小宽 24px、control 4px 圆角、
subtle 材质（透明边位 + `--xh-bg-subtle` + 无影）与 `light` 档的透明底都不变，单行行高 `--xh-leading-none` 随字号缩到
12px，键帽内的字在 24px 盒里仍居中。

**tag 改胶囊。** `--xh-tag-radius` 缺省由 `--xh-shape-control`（4px）改为 `--xh-shape-pill`（§6.3 pill 只给状态 chip 与
一维对象，Tag 是状态 chip），四种形态与三档尺寸同一身份；关闭钮 `--xh-tag-close-radius` 仍是 `--xh-shape-inset`
（随文标记档的 16px 正方盒，与 checkbox 系方框同档，内层圆角不越过外层胶囊）。缺省 subtle 档仍是 soft 材质
（`--xh-material-soft-border / -bg / -shadow`，§8 登记消费者），outline 描边 `--xh-border-default`、solid / ghost 不变。
波及复用 tag 皮肤的 select 多选标签、tags-input 条目与 tag-group 成员：它们的默认圆角一并由 4px 变为胶囊；以
`--xh-tag-radius` 覆盖过的作者不受影响。

**statistic 涨跌箭头改按字形档取尺。** root 新增使用者槽 `--xh-statistic-icon-size`（映射 `--xh-icon-size`），缺省
`--xh-glyph-size-sm`（16px，跟着前后缀那一档 14px 字走），lg 档抬到 `--xh-glyph-size-md`（20px）；趋势箭头的兜底字形
与作者塞进 trend 的图标读同一把尺（此前箭头 `--xh-glyph-size-text` 随文 1em ≈ 14px，作者图标落 `--xh-icon-size` 缺省
20px，两者不一致）。标签 / 数值 / 前后缀 / 涨跌的字号、字重与颜色不变，无壳无形状。

**timeline 说明改说明档 13px。** `--xh-timeline-description-font-size` 缺省由 `--xh-text-body-size`（14px）改为
`--xh-text-secondary-size`（13px，§6.4 说明 / helper 档：13 / `--xh-fg-muted` / `--xh-leading-normal`），字色与行高本就在档上；
条目标题仍是 `--xh-text-label-weight` 500（它是每条事件的标题，不是 Surface 面板标题），label / time 的 12px 次级标注、
圆点 circle 与连线 pill 的身份、tone 圆点的 `--xh-fg-muted` 兜底都不变。

**badge 圆点档改取 circle。** `indicator[data-dot]` 新增使用者槽 `--xh-badge-dot-radius`，缺省 `--xh-shape-circle`
（§6.3 宽高同槽的正方盒必须取 circle，不得用胶囊冒充圆）；此前圆点档沿用计数档的 `--xh-badge-radius`（`--xh-shape-pill`
9999px），在 6 / 8 / 10px 的正方盒上画出的仍是圆，像素不变，但作者按圆点覆盖圆角时只能改动计数档那一槽。计数档的
胶囊身份、`--xh-badge-ring` 切边环、13 / 500 字形与三档尺寸都不变。check-shape-scale 身份表新增
`badge:indicator[data-dot]=circle`。
