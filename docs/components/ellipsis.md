# 文本省略 <Badge type="info" text="ellipsis" />

布局组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

一行放不下就收成省略号；有没有被裁如实报出来

<XhDemo src="ellipsis/01-basic" />

### 行数

lines 为 1 走单行省略，大于 1 按行数裁，末行收省略号

<XhDemo src="ellipsis/02-lines" />

### 点击展开

expandable 让整块文字变成一颗按钮，Enter / Space 也按得动

<XhDemo src="ellipsis/03-expandable" />

### 溢出才提示

上面套 Tooltip 按 overflow-change 开关，下面用 tooltip 交给平台的原生提示

<XhDemo src="ellipsis/04-overflow-tooltip" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-ellipsis>` |
| Vue 组件 | `XhEllipsis` |
| 组合式函数 | `useEllipsis` |
| 状态机 | `ellipsisMachine` |
| 皮肤 | `@xihan-ui/styles/ellipsis.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="ellipsis"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `lines` | `number` |  | 夹几行，1 为单行，默认 1。 |
| `expandable` | `boolean` |  | 点一下铺开全文。 |
| `expanded` | `boolean` |  | 受控展开；缺省即非受控。 |
| `defaultExpanded` | `boolean` |  | 非受控时的初始展开态。 |
| `tooltip` | `boolean` |  | 真被裁掉了才把整段文字交给平台的原生提示。 |
| `onExpandedChange` | `(details: EllipsisExpandedChangeDetails) => void` |  | expanded 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |
| `onOverflowChange` | `(details: EllipsisOverflowChangeDetails) => void` |  | 量出来的溢出结论翻面时回调。 |

## 状态机

**状态**：`collapsed` · `expanded`

**事件**：`MEASURE` · `TOGGLE` · `CONTROLLED.EXPAND` · `CONTROLLED.COLLAPSE`

**判据**：`isExpandedControlled`

## connect API

`useEllipsis` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `expanded` | `boolean` | 此刻是不是铺开了全文。 |
| `overflowing` | `boolean` | 夹住的那一版有没有被裁掉内容。作者据此决定要不要套一层提示。 |
| `setExpanded` | `(next: boolean) => void` | 程序化展开 / 收回，与点一下走同一条路。 |
| `measure` | `() => void` | 手动重量一次：字体到位、外层换了布局这类观察器看不见的变化，由作者补一枪。 |
| `getRootProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | expandable，焦点在 root 上 | 铺开全文 / 收回夹住的那一版；Space 拦掉翻页的默认动作 |
| `Tab` / `Shift+Tab` | expandable | 停到这块文字上；不可展开时它不带 tabindex，不在 Tab 序列里 |
