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
