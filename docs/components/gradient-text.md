# GradientText <Badge type="info" text="渐变文字" />

把渐变裁进字形里：颜色只出现在笔画上，不铺成一块底色。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/gradient-text" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/gradient-text.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/gradient-text" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/gradient-text" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/gradient-text.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

渐变裁进字形里；不给颜色就用品牌色族，走向缺省从左到右

<XhDemo src="gradient-text/01-basic" />

## 示例

### 两端颜色

from 与 to 收颜色值，落成根上的 CSS 变量；写令牌或写具体色值都行

<XhDemo src="gradient-text/02-colors" />

### 走向

direction 收的是档位，四条边加四个角共八档，逐档对应 CSS 渐变的 to 边或角写法；不收任意角度

<XhDemo src="gradient-text/03-direction" />

### 只渐变一段

组件是行内的，可以只包住整句话里的几个字，字号字重由外面的文字决定

<XhDemo src="gradient-text/04-partial" />

### 语气

tone 决定两端取哪族颜色；写了 from / to 就由它们说了算，tone 让位

<XhDemo src="gradient-text/05-tone" />

## 设计指引

### 何时使用

- 标题、品牌字样、营销页里需要一处视觉重音的短句。

### 何时不用

- 正文、表单标签、任何需要长时间阅读的文字：渐变会让对比度沿着文字变化，读起来更费力。
- 需要底色而不是字色：那是普通容器的背景。

### 特性

- 组件是行内的，可以只包住整句话里的几个字，字号字重由外面的文字决定。
- `from` / `to` 收颜色值并落成根上的 CSS 变量，写令牌或写具体色值都行；不给就用品牌色族。
- `direction` 收的是档位——四条边加四个角共八档，不收任意角度。
- `tone` 换成六族语气之一，两端自动取该族的主色与压深一档；写了 `from` / `to` 就以它们为准。
- 高对比、强制色和打印环境自动退回当前实体前景；选中与复制仍使用原始文本，不生成替代内容。

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
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，两端取该族颜色；写了 from / to 即让位。 |

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
| `root` | `data-tone` | props.tone |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-gradient-text-from` | `root` | `background-image` | `default` | `--xh-_gradient-text-from` | gradient-text 的 root 部件 background-image 覆盖槽。 |
| `--xh-gradient-text-to` | `root` | `background-image` | `default` | `--xh-_gradient-text-to` | gradient-text 的 root 部件 background-image 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

## 组合

- 嵌在[排印](./typography)的标题里只强调其中几个字。

## 最佳实践

- 两端颜色的明度要接近，否则一句话里会有一半读不清。
- 同一页面只用一处，用多了就不再是重音。

## 反模式

- 拿它做正文或长段落。
- 两端取对比度极低的相近色：渐变看不出来，只剩渲染成本。
