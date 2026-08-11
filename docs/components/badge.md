# 徽标 <Badge type="info" text="badge" />

通用组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 变体

badge 没有状态机，connect 直接由 props 算属性

<XhDemo src="badge/01-basic" />

### 用作状态标记

徽标不接收焦点、也不进 Tab 序列，状态语义靠文字本身表达

<XhDemo src="badge/02-status" />

### 形态

variant 决定颜色怎么用：实心填底、淡色填底、只描边

<XhDemo src="badge/03-variant" />

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 solid 形态只看语气的差别

<XhDemo src="badge/04-tone" />

### 尺寸

size 只改内边距与字号，不写就是缺省档

<XhDemo src="badge/05-size" />

### 带图元的标签

根是 inline-flex 且自带间距，图标或头像直接写进默认插槽跟文字并排

<XhDemo src="badge/06-with-glyph" />

### 自定义配色

不写 variant 时底色与文字色取自组件令牌；描边这一条直接写 border-color

<XhDemo src="badge/07-custom-color" />

### 挂成角标

徽标本身随文排；外层套一层定位上下文，它就落到子元素的角上。计数、圆点、0 值收起、上限截断都在宿主这一侧

<XhDemo src="badge/08-anchor" />

### 可关闭标签

根是 inline-flex 且自带间距，关闭件直接写进默认插槽跟文字并排；点击语义、Tab 停靠与回车触发由原生按钮自带

<XhDemo src="badge/09-closable" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-badge>` |
| Vue 组件 | `XhBadge` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/badge.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="badge"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `size` | `Size` |  | 尺寸：sm / md / lg |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 |
| `variant` | `BadgeVariant` |  |  |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
