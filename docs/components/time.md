# 时间 <Badge type="info" text="time" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

渲染成 &lt;time datetime>：文本给人看，datetime 给机器读，两者取自同一个墙钟

<XhDemo src="time/01-basic" />

### 呈现方式

date 只到日、datetime 到秒、relative 说成「几分钟前」；datetime 属性的精度跟着走

<XhDemo src="time/02-type" />

### 自定义格式串

记号是 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s，只改看到的文本，datetime 不跟着变

<XhDemo src="time/03-format" />

### 相对时间

刚刚 / n 分钟前 / n 小时前 / n 天前 四档，超过三十天退回绝对日期；locale 只换用词

<XhDemo src="time/04-relative" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-time>` |
| Vue 组件 | `XhTime` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/time.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="time"`：**`root`**

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `date` | `Date \| undefined` | 解析出的时刻；没给或认不出时为 undefined。 |
| `text` | `string` | 给人看的文本；没有可读时刻时是空串。 |
| `stamp` | `string \| undefined` | 写进 datetime 的那个戳；没有可读时刻时为 undefined，此时根上不写这个属性。 |
| `state` | `TimeState` | 当前状态。 |
| `relative` | `boolean` | 这一次是不是真按相对说法念的。落在四档之外退回了绝对日期时为 false。 |
| `getRootProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
