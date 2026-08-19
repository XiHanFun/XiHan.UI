# 列表 <Badge type="info" text="list" />

一列同构的条目，每条可以有媒体位、标题、描述与操作位。

## 何时使用

- 同构记录的纵向排列：通知、文件、成员。
- 每条信息量适中，不需要多列对齐。

## 何时不用

- 每条有多个字段需要按列对照：用[表格](./table)。
- 条目可选：用[列表框](./listbox)。

## 特性

- 六个部件都可选。
- `split` 在条目之间画线，`bordered` 给外框，`hoverable` 给悬停反馈。

## 示例

### 基础用法

根与条目的标签由使用者定，这里写成 ul 与 li；条目里只写用得上的那几个位

<XhDemo src="list/01-basic" />

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

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-list>` |
| Vue 组件 | `XhListItem` `XhListItemAction` `XhListItemContent` `XhListItemDescription` `XhListItemMedia` `XhListItemTitle` `XhListRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/list.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="list"`：**`root`** · `item` · `item-media` · `item-content` · `item-title` · `item-description` · `item-action`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `bordered` | `boolean` |  | 外框：给整份列表画一圈描边与圆角。 |
| `hoverable` | `boolean` |  | 指针悬停时条目换底色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `split` | `boolean` |  | 条目之间画分隔线。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getItemMediaProps` | `() => T['element']` |  |
| `getItemContentProps` | `() => T['element']` |  |
| `getItemTitleProps` | `() => T['element']` |  |
| `getItemDescriptionProps` | `() => T['element']` |  |
| `getItemActionProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/list.css` 按部件选择：`[data-scope="list"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-list-action-gap` · `--xh-list-bg` · `--xh-list-border` · `--xh-list-content-gap` · `--xh-list-description-fg` · `--xh-list-description-font-size` · `--xh-list-fg` · `--xh-list-item-bg-hover` · `--xh-list-item-gap` · `--xh-list-item-px` · `--xh-list-item-py` · `--xh-list-item-py-lg` · `--xh-list-item-py-md` · `--xh-list-item-py-sm` · `--xh-list-radius` · `--xh-list-title-fg` · `--xh-list-title-font-size` · `--xh-list-title-font-weight`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤内置条件规则：`hover: hover`。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 媒体位放[头像](./avatar)或[图标块](./icon-wrapper)；操作位放[按钮](./button)或[菜单](./menu)；下面接[分页](./pagination)或[无限滚动](./infinite-scroll)。

## 最佳实践

- 每条的高度尽量一致，参差不齐的列表很难扫读。
- 整条可点时让整条进 Tab 序列，别只让标题可点。

## 反模式

- 用列表排一张有五六个字段的表。
- 每条都塞三四个操作按钮。
