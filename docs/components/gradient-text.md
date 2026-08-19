# 渐变文字 <Badge type="info" text="gradient-text" />

把渐变裁进字形里：颜色只出现在笔画上，不铺成一块底色。

## 何时使用

- 标题、品牌字样、营销页里需要一处视觉重音的短句。

## 何时不用

- 正文、表单标签、任何需要长时间阅读的文字：渐变会让对比度沿着文字变化，读起来更费力。
- 需要底色而不是字色：那是普通容器的背景。

## 特性

- 组件是行内的，可以只包住整句话里的几个字，字号字重由外面的文字决定。
- `from` / `to` 收颜色值并落成根上的 CSS 变量，写令牌或写具体色值都行；不给就用品牌色族。
- `direction` 收的是档位——四条边加四个角共八档，不收任意角度。

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

## 样式

默认皮肤 `@xihan-ui/styles/gradient-text.css` 按部件选择：`[data-scope="gradient-text"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-direction` | props.direction |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-gradient-text-from` · `--xh-gradient-text-to`

## 响应式

皮肤内置条件规则：`forced-colors: active`。

## 组合

- 嵌在[排印](./typography)的标题里只强调其中几个字。

## 最佳实践

- 两端颜色的明度要接近，否则一句话里会有一半读不清。
- 同一页面只用一处，用多了就不再是重音。

## 反模式

- 拿它做正文或长段落。
- 两端取对比度极低的相近色：渐变看不出来，只剩渲染成本。
