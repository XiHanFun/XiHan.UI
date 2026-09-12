# Toolbar 工具栏

把一排控件收成一组：整条在 Tab 序列里只占一个位子，条内改用方向键走。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/toolbar" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/toolbar.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/toolbar" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/toolbar" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/toolbar.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

整条在 Tab 序列里只占一个位子，条内改用方向键走；条目是作者自己的按钮，工具条不接管它的点击

<XhDemo src="toolbar/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="toolbar"`：**`root`** · `group` · **`item`** · `separator`

## 示例

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

### 形态

surface 让工具条自己画一块面，plain 不画：贴在编辑区顶上时用 plain，浮在内容之上时用 surface

<XhDemo src="toolbar/08-variant" />

## 设计指引

### 何时使用

- 编辑器的格式条、表格的操作条、图表的视图控制条。
- 控件多到逐个 Tab 走过去太慢。

### 何时不用

- 只有两三个按钮：直接摆，别为此接管键盘。
- 各控件之间是并列动作而非工具：用[按钮组](./button-group)。

### 特性

- 条目是作者自己的按钮，工具栏不接管它的点击。
- 分组只是把一伙控件在视觉上收紧，不是导航里多出来的一层：方向键照样一路走过去。
- 禁用走 `aria-disabled`：禁用项仍聚焦得上、仍能当方向键的起点，只是方向键路过时跳过它。
- 工具栏只定主轴与条目间距，怎么分布交给 CSS。

### 组合

- 条目用[切换按钮](./toggle)、[切换按钮组](./toggle-group)、[菜单](./menu)的触发器；分组之间放[分隔线](./separator)。

### 最佳实践

- 只画图标的条目必须自带 `aria-label`。
- 尺寸只写在条上，条目自身的高度与字号归条目的皮肤管。

### 反模式

- 在工具栏里放文本输入：方向键会被输入框吃掉，条内导航当场失效。
- 把整页的所有动作都塞进一条工具栏。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toolbar>` |
| Vue 组件 | `XhToolbarGroup` `XhToolbarItem` `XhToolbarRoot` `XhToolbarSeparator` |
| 组合式函数 | `useToolbar` |
| 状态机 | `toolbarMachine` |
| 皮肤 | `@xihan-ui/styles/toolbar.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `orientation` | `Orientation` |  | 主轴，默认 horizontal。它决定 root 的 aria-orientation、方向键收哪一对键 （另一轴原样放行给页面），以及分隔线的朝向（恒与主轴垂直）。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只改写水平主轴上左右方向键的语义。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `disabled` | `boolean` |  | 整条禁用：条目全部转 aria-disabled，方向键不再接管。 |
| `variant` | `ToolbarVariant` |  | 形态：plain / surface，决定工具条自己画不画一块面。缺省 surface。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。工具条是布局容器，只换排布尺寸，不带语气。 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhToolbarRoot` | `default` | `ToolbarRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`ITEM.FOCUS` · `TOOLBAR.BLUR`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

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

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | roving tabindex（恒开） | 整条只占一个 Tab 位：焦点落到锚点条目，无锚点时先落容器再由它转投给第一个可停留条目 |
| `ArrowRight` / `ArrowDown` | 焦点在条内且未整条禁用；横排收 ArrowRight、竖排收 ArrowDown | 焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕）；dir=rtl 时水平主轴改由 ArrowLeft 承担 |
| `ArrowLeft` / `ArrowUp` | 焦点在条内且未整条禁用；横排收 ArrowLeft、竖排收 ArrowUp | 焦点移到上一个可停留条目（禁用项跳过、尽头按 loop 回绕）；dir=rtl 时水平主轴改由 ArrowRight 承担 |
| `Home` | 焦点在条内且未整条禁用 | 焦点移到首个可停留条目 |
| `End` | 焦点在条内且未整条禁用 | 焦点移到末个可停留条目 |
| `交叉轴的两个方向键` | 焦点在条内（横排按上下、竖排按左右） | 不归工具条管：原样放行给页面滚动与读屏，绝不 preventDefault |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-disabled` | 'true' \| 'false' |
| `root` | `aria-orientation` | props.orientation |
| `root` | `role` | 'toolbar' |
| `group` | `role` | 'group' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `separator` | `aria-orientation` | 'vertical' \| 'horizontal' |
| `separator` | `role` | 'separator' |

## 样式参考

### 皮肤

`@xihan-ui/styles/toolbar.css` 使用 `[data-scope="toolbar"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |
| `group` | `data-disabled` | ''（条件成立时才出现） |
| `group` | `data-orientation` | props.orientation |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `separator` | `data-orientation` | 'vertical' \| 'horizontal' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-toolbar-bg` | `root` | `background` | `default`<br>`variant=plain` | `--xh-bg-surface`<br>`transparent` | toolbar 的 root 部件 background 覆盖槽。 |
| `--xh-toolbar-bg-disabled` | `root` | `background` | `disabled` | `--xh-bg-muted` | toolbar 的 root 部件 background 覆盖槽。 |
| `--xh-toolbar-border` | `root` | `border` | `default` | `--xh-border-default` | toolbar 的 root 部件 border 覆盖槽。 |
| `--xh-toolbar-fg` | `root` | `color` | `default` | `--xh-fg-default` | toolbar 的 root 部件 color 覆盖槽。 |
| `--xh-toolbar-gap` | `root` | `gap` | `default` | `--xh-_toolbar-gap` | toolbar 的 root 部件 gap 覆盖槽。 |
| `--xh-toolbar-group-gap` | `group` | `gap` | `default` | `--xh-space-0_5` | toolbar 的 group 部件 gap 覆盖槽。 |
| `--xh-toolbar-px` | `root` | `padding-inline` | `default`<br>`variant=plain` | `--xh-_toolbar-p`<br>`0` | toolbar 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-toolbar-py` | `root` | `padding-block` | `default`<br>`variant=plain` | `--xh-_toolbar-p`<br>`0` | toolbar 的 root 部件 padding-block 覆盖槽。 |
| `--xh-toolbar-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | toolbar 的 root 部件 border-radius 覆盖槽。 |
| `--xh-toolbar-separator-color` | `separator` | `background` | `default` | `--xh-border-default` | toolbar 的 separator 部件 background 覆盖槽。 |
| `--xh-toolbar-separator-gap` | `separator` | `margin-block`<br>`margin-inline` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-space-1` | toolbar 的 separator 部件 margin-block、margin-inline 覆盖槽。 |
| `--xh-toolbar-separator-inset` | `separator` | `margin-block`<br>`margin-inline` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-space-1` | toolbar 的 separator 部件 margin-block、margin-inline 覆盖槽。 |
| `--xh-toolbar-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | toolbar 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-toolbar-separator-thickness` | `separator` | `block-size`<br>`inline-size` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thin` | toolbar 的 separator 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
