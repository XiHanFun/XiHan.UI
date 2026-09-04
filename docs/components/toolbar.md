# 工具栏 <Badge type="info" text="toolbar" />

把一排控件收成一组：整条在 Tab 序列里只占一个位子，条内改用方向键走。

## 何时使用

- 编辑器的格式条、表格的操作条、图表的视图控制条。
- 控件多到逐个 Tab 走过去太慢。

## 何时不用

- 只有两三个按钮：直接摆，别为此接管键盘。
- 各控件之间是并列动作而非工具：用[按钮组](./button-group)。

## 特性

- 条目是作者自己的按钮，工具栏不接管它的点击。
- 分组只是把一伙控件在视觉上收紧，不是导航里多出来的一层：方向键照样一路走过去。
- 禁用走 `aria-disabled`：禁用项仍聚焦得上、仍能当方向键的起点，只是方向键路过时跳过它。
- 工具栏只定主轴与条目间距，怎么分布交给 CSS。

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
| `size` | `Size` |  | 尺寸：sm / md / lg。工具条是布局容器，只换排布尺寸，不带语气。 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhToolbarRoot` | `default` | `ToolbarRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-disabled` | 'true' \| 'false' |
| `root` | `aria-orientation` | props.orientation |
| `root` | `role` | 'toolbar' |
| `group` | `role` | 'group' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `separator` | `aria-orientation` | 'vertical' \| 'horizontal' |
| `separator` | `role` | 'separator' |

## 样式

默认皮肤 `@xihan-ui/styles/toolbar.css` 按部件选择：`[data-scope="toolbar"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `group` | `data-disabled` | ''（条件成立时才出现） |
| `group` | `data-orientation` | props.orientation |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `separator` | `data-orientation` | 'vertical' \| 'horizontal' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-toolbar-bg` · `--xh-toolbar-bg-disabled` · `--xh-toolbar-border` · `--xh-toolbar-fg` · `--xh-toolbar-gap` · `--xh-toolbar-group-gap` · `--xh-toolbar-px` · `--xh-toolbar-py` · `--xh-toolbar-radius` · `--xh-toolbar-separator-color` · `--xh-toolbar-separator-gap` · `--xh-toolbar-separator-inset` · `--xh-toolbar-separator-radius` · `--xh-toolbar-separator-thickness`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 条目用[切换按钮](./toggle)、[切换按钮组](./toggle-group)、[菜单](./menu)的触发器；分组之间放[分隔线](./separator)。

## 最佳实践

- 只画图标的条目必须自带 `aria-label`。
- 尺寸只写在条上，条目自身的高度与字号归条目的皮肤管。

## 反模式

- 在工具栏里放文本输入：方向键会被输入框吃掉，条内导航当场失效。
- 把整页的所有动作都塞进一条工具栏。
