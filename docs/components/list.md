# List 列表

一列同构的条目，每条可以有媒体位、标题、描述与操作位。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/list" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/list.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/list" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/list" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/list.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

根与条目的标签由使用者定，这里写成 ul 与 li；条目里只写用得上的那几个位

<XhDemo src="list/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="list"`：**`root`** · `item` · `item-media` · `item-content` · `item-title` · `item-description` · `item-action`

## 示例

### 分隔线

split 在条目之间画一条线，第一条上面不画

<XhDemo src="list/02-split" />

### 外框与悬停

bordered 给整份列表画一圈描边，hoverable 让条目在指针悬停时换底色

<XhDemo src="list/03-bordered-hoverable" />

### 媒体位与操作位

一条条目最全的形态：媒体、标题、说明、操作四个位都摆上

<XhDemo src="list/04-media-action" />

### 尺寸

size 换的是条目的内边距、图文间距与两行文字的字号，不传 size 即默认档

<XhDemo src="list/05-size" />

## 设计指引

### 何时使用

- 同构记录的纵向排列：通知、文件、成员。
- 每条信息量适中，不需要多列对齐。

### 何时不用

- 每条有多个字段需要按列对照：用[表格](./table)。
- 条目可选：用[列表框](./listbox)。

### 特性

- 六个部件都可选。
- `split` 在条目之间画线，`bordered` 给外框，`hoverable` 给悬停反馈。

### 组合

- 媒体位放[头像](./avatar)或[图标块](./icon-wrapper)；操作位放[按钮](./button)或[菜单](./menu)；下面接[分页](./pagination)或[无限滚动](./infinite-scroll)。

### 最佳实践

- 每条的高度尽量一致，参差不齐的列表很难扫读。
- 整条可点时让整条进 Tab 序列，别只让标题可点。

### 反模式

- 用列表排一张有五六个字段的表。
- 每条都塞三四个操作按钮。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-list>` |
| Vue 组件 | `XhListItem` `XhListItemAction` `XhListItemContent` `XhListItemDescription` `XhListItemMedia` `XhListItemTitle` `XhListRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/list.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `bordered` | `boolean` |  | 外框：给整份列表画一圈描边与圆角。 |
| `hoverable` | `boolean` |  | 指针悬停时条目换底色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `split` | `boolean` |  | 条目之间画分隔线。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getItemMediaProps` | `() => T['element']` |  |
| `getItemContentProps` | `() => T['element']` |  |
| `getItemTitleProps` | `() => T['element']` |  |
| `getItemDescriptionProps` | `() => T['element']` |  |
| `getItemActionProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/list.css` 使用 `[data-scope="list"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-list-action-gap` | `item-action` | `gap` | `default` | `--xh-space-2` | list 的 item-action 部件 gap 覆盖槽。 |
| `--xh-list-bg` | `root` | `background` | `bordered` | `--xh-bg-surface` | list 的 root 部件 background 覆盖槽。 |
| `--xh-list-border` | `root` | `border` | `bordered` | `--xh-border-default` | list 的 root 部件 border 覆盖槽。 |
| `--xh-list-content-gap` | `item-content` | `gap` | `default` | `--xh-space-1` | list 的 item-content 部件 gap 覆盖槽。 |
| `--xh-list-description-fg` | `item-description` | `color` | `default` | `--xh-fg-muted` | list 的 item-description 部件 color 覆盖槽。 |
| `--xh-list-description-font-size` | `item-description` | `font-size` | `default` | `--xh-_list-description-size` | list 的 item-description 部件 font-size 覆盖槽。 |
| `--xh-list-divider` | `item`<br>`root` | `border-block-start` | `split` | `--xh-border-subtle` | list 的 item、root 部件 border-block-start 覆盖槽。 |
| `--xh-list-fg` | `root` | `color` | `default` | `--xh-fg-default` | list 的 root 部件 color 覆盖槽。 |
| `--xh-list-item-bg-hover` | `item`<br>`root` | `background` | `@media (hover: hover)`<br>`hover`<br>`hoverable` | `--xh-bg-subtle` | list 的 item、root 部件 background 覆盖槽。 |
| `--xh-list-item-gap` | `item` | `gap` | `default` | `--xh-_list-item-gap` | list 的 item 部件 gap 覆盖槽。 |
| `--xh-list-item-px` | `item` | `padding-inline` | `default` | `--xh-_list-item-px` | list 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-list-item-py` | `item` | `padding-block` | `default` | `--xh-_list-item-py` | list 的 item 部件 padding-block 覆盖槽。 |
| `--xh-list-radius` | `root` | `border-radius` | `bordered` | `--xh-shape-surface` | list 的 root 部件 border-radius 覆盖槽。 |
| `--xh-list-title-fg` | `item-title` | `color` | `default` | `--xh-fg-default` | list 的 item-title 部件 color 覆盖槽。 |
| `--xh-list-title-font-size` | `item-title` | `font-size` | `default` | `--xh-_list-title-size` | list 的 item-title 部件 font-size 覆盖槽。 |
| `--xh-list-title-font-weight` | `item-title` | `font-weight` | `default` | `--xh-font-weight-medium` | list 的 item-title 部件 font-weight 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`hover: hover`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
