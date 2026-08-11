# 渐变文字 <Badge type="info" text="gradient-text" />

布局组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

渐变裁进字形里；不给颜色就用品牌色族，走向缺省从左到右

<XhDemo src="gradient-text/01-basic" />

### 两端颜色

from 与 to 收颜色值，落成根上的 CSS 变量；写令牌或写具体色值都行

<XhDemo src="gradient-text/02-colors" />

### 走向

direction 收的是档位，四条边加四个角共八档，逐档对应 CSS 渐变的 to 边或角写法；不收任意角度

<XhDemo src="gradient-text/03-direction" />

### 只渐变一段

组件是行内的，可以只包住整句话里的几个字，字号字重由外面的文字决定

<XhDemo src="gradient-text/04-partial" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-gradient-text>` |
| Vue 组件 | `XhGradientText` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/gradient-text.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="gradient-text"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `direction` | `GradientTextDirection` |  | 渐变走向档位，缺省 to-right。 |
| `from` | `string` |  | 起点颜色，写成 CSS 变量交给皮肤；不给则用品牌色族。 |
| `to` | `string` |  | 终点颜色，写成 CSS 变量交给皮肤；不给则用品牌色族。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
