# 工具栏 <Badge type="info" text="toolbar" />

导航组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

整条在 Tab 序列里只占一个位子，条内改用方向键走；条目是作者自己的按钮，工具条不接管它的点击

<XhDemo src="toolbar/01-basic" />

### 分组

分组只是把一伙控件在视觉上收紧，不是导航里多出来的一层：方向键照样一路走过去

<XhDemo src="toolbar/02-group" />

### 竖排

orientation 决定方向键收哪一对键（另一轴原样放行给页面），分隔线的朝向恒与主轴垂直

<XhDemo src="toolbar/03-vertical" />

### 禁用

禁用走 aria-disabled 而非原生 disabled：禁用项仍聚焦得上、仍能当方向键的起点，只是方向键路过时跳过它

<XhDemo src="toolbar/04-disabled" />

### 尺寸

size 只换整条的内边距与条目间的间距，条目自身的高度与字号归条目的皮肤管

<XhDemo src="toolbar/05-size" />

### 图标条目

只画图标的条目必须自带无障碍名：aria-label 直接写在条目上，透传到那一层 DOM

<XhDemo src="toolbar/06-icon-item" />

### 对齐与分布

工具条只定主轴与条目间距，怎么分布交给 CSS：justify-content 一改，同一条就贴尾、居中或两端摊开

<XhDemo src="toolbar/07-align" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toolbar>` |
| Vue 组件 | `XhToolbarGroup` `XhToolbarItem` `XhToolbarRoot` `XhToolbarSeparator` |
| 组合式函数 | `useToolbar` |
| 状态机 | `toolbarMachine` |
| 皮肤 | `@xihan-ui/styles/toolbar.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="toolbar"`：**`root`** · `group` · **`item`** · `separator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `orientation` | `Orientation` |  | 主轴，默认 horizontal。它决定 root 的 aria-orientation、方向键收哪一对键 （另一轴原样放行给页面），以及分隔线的朝向（恒与主轴垂直）。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只改写水平主轴上左右方向键的语义。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `disabled` | `boolean` |  | 整条禁用：条目全部转 aria-disabled，方向键不再接管。 |
| `size` | `string` |  | 尺寸：sm / md / lg。工具条是布局容器，只换排布尺寸，不带语气。 |

## 状态机

**状态**：`idle`

**事件**：`ITEM.FOCUS` · `TOOLBAR.BLUR`

## connect API

`useToolbar` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `focusedValue` | `string \| null` | 焦点锚点；焦点不在工具条内时为 null。 |
| `orientation` | `Orientation` | 生效的主轴。 |
| `separatorOrientation` | `Orientation` | 分隔线的朝向：恒与主轴垂直（横排工具条里的分隔线是竖线）。 |
| `disabled` | `boolean` |  |
| `getRootProps` | `() => T['element']` |  |
| `getGroupProps` | `() => T['element']` |  |
| `getItemProps` | `(props: ToolbarItemProps) => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | roving tabindex（恒开） | 整条只占一个 Tab 位：焦点落到锚点条目，无锚点时先落容器再由它转投给第一个可停留条目 |
| `ArrowRight` / `ArrowDown` | 焦点在条内且未整条禁用；横排收 ArrowRight、竖排收 ArrowDown | 焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕）；dir=rtl 时水平主轴改由 ArrowLeft 承担 |
| `ArrowLeft` / `ArrowUp` | 焦点在条内且未整条禁用；横排收 ArrowLeft、竖排收 ArrowUp | 焦点移到上一个可停留条目（禁用项跳过、尽头按 loop 回绕）；dir=rtl 时水平主轴改由 ArrowRight 承担 |
| `Home` | 焦点在条内且未整条禁用 | 焦点移到首个可停留条目 |
| `End` | 焦点在条内且未整条禁用 | 焦点移到末个可停留条目 |
| `交叉轴的两个方向键` | 焦点在条内（横排按上下、竖排按左右） | 不归工具条管：原样放行给页面滚动与读屏，绝不 preventDefault |
