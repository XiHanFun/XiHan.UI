# 进度条 <Badge type="info" text="progress" />

反馈与浮层组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

value 与 max 共同决定百分比

<XhDemo src="progress/01-basic" />

### 配文字说明

进度条自身只画轨道与进度，百分比文字由使用者摆

<XhDemo src="progress/02-labelled" />

### 自定义量程

max 不是 100 时按 value/max 折算，用于「已完成 3/8 步」这类场景

<XhDemo src="progress/03-max" />

### 语气

tone 决定进度段用哪族颜色，不写时沿用品牌色

<XhDemo src="progress/04-tone" />

### 尺寸

size 只改轨道厚度，不写即缺省中档

<XhDemo src="progress/05-size" />

### 自定义外观

轨道色、进度段色与轨道厚度各是一个组件令牌，纯色与渐变都塞得进去

<XhDemo src="progress/06-custom-appearance" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-progress>` |
| Vue 组件 | `XhProgress` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/progress.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="progress"`：**`root`** · `track` · `range`

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getTrackProps` | `() => T['element']` |  |
| `getRangeProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/meter/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
