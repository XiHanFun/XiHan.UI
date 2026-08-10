# 二维码 <Badge type="info" text="qr-code" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

给 value 就画码，版本按内容长度自动选；缺省 M 级纠错、4 个模块的静区

<XhDemo src="qr-code/01-basic" />

### 纠错级别

L / M / Q / H 依次能容忍更多污损，同样的内容也因此占更多模块

<XhDemo src="qr-code/02-level" />

### 边长与静区

size 是整块的像素边长；margin 的单位是模块数，静区含在里面不额外占地方

<XhDemo src="qr-code/03-size-margin" />

### 可及名字

缺省拿 value 当 aria-label；内容不是给人念的时候用 label 换一句人话

<XhDemo src="qr-code/04-label" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-qr-code>` |
| Vue 组件 | `XhQrCode` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/qr-code.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="qr-code"`：**`root`**

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `modules` | `readonly (readonly boolean[])[]` | 模块矩阵，[行][列]，true = 深色；没画出码时是空数组。 |
| `version` | `number` | 实际用到的版本；没画出码时为 0。 |
| `count` | `number` | 每边模块数，不含静区；没画出码时为 0。 |
| `margin` | `number` | 解析后的静区宽度，单位是模块数。 |
| `viewBox` | `string` | 根的 viewBox，含静区。 |
| `path` | `string` | 深色模块合成的那条 `&lt;path&gt;` 的 d；没画出码时是空串，此时不该生成 path 节点。 |
| `state` | `QrCodeState` | 当前状态。 |
| `error` | `string \| undefined` | 编码失败的原因；其余状态为 undefined。 |
| `label` | `string \| undefined` | 解析后的可及名字；没给名字时为 undefined，此时根退出无障碍树。 |
| `getRootProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
