# 列表 <Badge type="info" text="list" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

根默认渲染成 ul、条目默认渲染成 li；条目里只写用得上的那几个位

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
