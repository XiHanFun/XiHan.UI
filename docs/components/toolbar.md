# Toolbar 工具栏

用于组织一组相关的操作控件。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/toolbar" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/toolbar.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/toolbar" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/toolbar" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/toolbar.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

集中常用编辑操作

<XhDemo src="toolbar/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="toolbar"`：**`root`** · `group` · **`item`** · `separator`

## 示例

### 分组

将相关操作收在一起

<XhDemo src="toolbar/02-group" />

### 垂直布局

按纵向排列工具

<XhDemo src="toolbar/03-vertical" />

### 附着工具面

为悬浮工具条提供完整表面

<XhDemo src="toolbar/04-variant" />

## 设计指引

### 何时使用

- 文本编辑、表格操作或画布工具。
- 相关控件需要统一的方向键导航。

### 何时不用

- 只有少量独立操作时直接使用按钮。
- 操作必须连接成一个整体时使用[按钮组](./button-group)。

### 特性

- 默认 `ghost` 形态只组织控件，不绘制工具条外框。
- `outline` 形态提供带内距、描边与背景的附着式工具面；`subtle` 为淡底。
- `group` 将相关操作连接成连续分段，并以低对比度分隔线区分。
- 独立条目是接入 Action Control text 档的无描边工具按钮，组内条目使用中性操作面；`aria-pressed` 表示选中状态。
- 支持水平、垂直、分组、分隔线与整体禁用。
- 方向键在条目间移动，禁用项会被跳过。

### 组合

- 使用 `group` 收紧相关操作。
- 使用 `separator` 区分操作组。

### 最佳实践

- 仅图标条目必须提供 `aria-label`。
- 使用 `aria-pressed` 表示可切换工具的当前状态。

### 反模式

- 不要在工具栏中放置文本输入控件。
- 不要将整页所有操作放入同一工具栏。

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
| `orientation` | `Orientation` |  | 主轴，默认 horizontal。它决定 root 的 aria-orientation、方向键接管哪一对键 （另一轴原样放行给页面），以及分隔线的朝向（恒与主轴垂直）。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只改写水平主轴上左右方向键的语义。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `disabled` | `boolean` |  | 整条禁用：条目全部为 aria-disabled，方向键不再接管。 |
| `variant` | `ControlVariant` |  | 形态：ghost 只组织控件不画面（默认），outline 为附着式工具面，subtle 为淡底。默认 ghost。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，同时调整排布与默认条目尺寸。 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhToolbarRoot` | `default` | `ToolbarRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhToolbarItem` | `value` | `string` | 是 |  |
| `XhToolbarItem` | `disabled` | `boolean` |  |  |
| `XhToolbarItem` | `as` | `ElementType` |  | 条目渲染为哪个标签，默认 button；不自动补 type="button"，表单内需自行声明。 |
| `XhToolbarRoot` | `children` | `SlotChildren<ToolbarRootSlotProps>` |  |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`ITEM.FOCUS` · `TOOLBAR.BLUR` · `PRESS.START` · `PRESS.END`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `focusedValue` | `string \| null` | 焦点锚点；焦点不在工具条内时为 null。 |
| `orientation` | `Orientation` | 生效的主轴。 |
| `separatorOrientation` | `Orientation` | 分隔线的朝向：恒与主轴垂直（横向工具条中的分隔线是竖线）。 |
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
| `Enter` / `Space` | held on item, 整条未禁用且条目未禁用 | 按住期间该条目投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或转禁用撤下。激活语义仍归条目自身（原生 button 的 click） |
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
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-xh-action-control` | '' |
| `item` | `data-xh-action-display` | 'always' |
| `item` | `data-xh-action-profile` | 'text' |
| `item` | `data-xh-action-size` | props.size |
| `item` | `data-xh-action-variant` | 'ghost' |
| `separator` | `data-orientation` | 'vertical' \| 'horizontal' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-toolbar-bg` | `root` | `background` | `default` | `--xh-_toolbar-root-bg` | toolbar 的 root 部件 background 覆盖槽。 |
| `--xh-toolbar-bg-disabled` | `root` | `background` | `disabled` | `--xh-_toolbar-root-bg-disabled` | toolbar 的 root 部件 background 覆盖槽。 |
| `--xh-toolbar-border` | `root` | `border` | `default` | `--xh-_toolbar-root-border` | toolbar 的 root 部件 border 覆盖槽。 |
| `--xh-toolbar-fg` | `root` | `color` | `default` | `--xh-fg-default` | toolbar 的 root 部件 color 覆盖槽。 |
| `--xh-toolbar-gap` | `root` | `gap` | `default` | `--xh-_toolbar-gap` | toolbar 的 root 部件 gap 覆盖槽。 |
| `--xh-toolbar-group-gap` | `group` | `gap` | `default` | `--xh-space-0` | toolbar 的 group 部件 gap 覆盖槽。 |
| `--xh-toolbar-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | toolbar 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-toolbar-item-bg` | `group`<br>`item` | `--xh-ink-surface`<br>`background-color` | `default`<br>`not([aria-pressed='true'])`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest`<br>`--xh-bg-subtle` | toolbar 的 group、item 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-toolbar-item-bg-active` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | toolbar 的 item 部件 background-color 覆盖槽。 |
| `--xh-toolbar-item-bg-disabled` | `group`<br>`item` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`xh-ink-surface` | `--xh-_action-variant-bg-disabled`<br>`--xh-bg-subtle` | toolbar 的 group、item 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-toolbar-item-bg-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | toolbar 的 item 部件 background-color 覆盖槽。 |
| `--xh-toolbar-item-bg-pressed` | `item` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-bg-brand-subtle` | toolbar 的 item 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-toolbar-item-bg-pressed-active` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-brand-subtle-active` | toolbar 的 item 部件 background-color 覆盖槽。 |
| `--xh-toolbar-item-bg-pressed-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-brand-subtle-hover` | toolbar 的 item 部件 background-color 覆盖槽。 |
| `--xh-toolbar-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | toolbar 的 item 部件 color 覆盖槽。 |
| `--xh-toolbar-item-fg-pressed` | `item` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-on-brand-subtle` | toolbar 的 item 部件 color 覆盖槽。 |
| `--xh-toolbar-item-font-size` | `item` | `font-size` | `default` | `--xh-_action-profile-font-size` | toolbar 的 item 部件 font-size 覆盖槽。 |
| `--xh-toolbar-item-font-weight` | `item` | `font-weight` | `default` | `--xh-text-label-weight` | toolbar 的 item 部件 font-weight 覆盖槽。 |
| `--xh-toolbar-item-gap` | `item` | `gap` | `default` | `--xh-control-gap-sm` | toolbar 的 item 部件 gap 覆盖槽。 |
| `--xh-toolbar-item-h` | `item` | `block-size` | `default` | `--xh-_action-profile-visual-size` | toolbar 的 item 部件 block-size 覆盖槽。 |
| `--xh-toolbar-item-px` | `item` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | toolbar 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-toolbar-item-radius` | `group`<br>`item` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `default`<br>`first-of-type`<br>`last-of-type`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-_action-profile-radius`<br>`--xh-shape-control` | toolbar 的 group、item 部件 border-end-end-radius、border-end-start-radius、border-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-toolbar-px` | `root` | `padding-inline` | `default` | `--xh-_toolbar-root-p` | toolbar 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-toolbar-py` | `root` | `padding-block` | `default` | `--xh-_toolbar-root-p` | toolbar 的 root 部件 padding-block 覆盖槽。 |
| `--xh-toolbar-radius` | `root` | `border-radius` | `default`<br>`variant=outline` | `--xh-shape-surface` | toolbar 的 root 部件 border-radius 覆盖槽。 |
| `--xh-toolbar-separator-color` | `group`<br>`separator` | `background` | `default` | `--xh-border-default`<br>`--xh-fg-default` | toolbar 的 group、separator 部件 background 覆盖槽。 |
| `--xh-toolbar-separator-gap` | `separator` | `margin-block`<br>`margin-inline` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-space-0` | toolbar 的 separator 部件 margin-block、margin-inline 覆盖槽。 |
| `--xh-toolbar-separator-inset` | `separator` | `margin-block`<br>`margin-inline` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-space-0` | toolbar 的 separator 部件 margin-block、margin-inline 覆盖槽。 |
| `--xh-toolbar-separator-opacity` | `group`<br>`separator` | `opacity` | `default` | `--xh-control-separator-opacity` | toolbar 的 group、separator 部件 opacity 覆盖槽。 |
| `--xh-toolbar-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | toolbar 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-toolbar-separator-thickness` | `group`<br>`separator` | `block-size`<br>`inline-size`<br>`margin-block-start`<br>`margin-inline-start` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thin` | toolbar 的 group、separator 部件 block-size、inline-size、margin-block-start、margin-inline-start 覆盖槽。 |
| `--xh-toolbar-shadow` | `root` | `box-shadow` | `variant=outline` | `none` | toolbar 的 root 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
