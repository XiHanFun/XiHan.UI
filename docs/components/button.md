# 按钮 <Badge type="info" text="button" />

通用组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

内容直接写在默认插槽里

<XhDemo src="button/01-basic" />

### 变体

variant 只改皮肤的几个颜色槽位，行为完全一致

<XhDemo src="button/02-variant" />

### 尺寸

不传 size 即默认档

<XhDemo src="button/03-size" />

### 禁用与载入

loading 会挡住点击，并给 indicator 部件挂上旋转动画

<XhDemo src="button/04-state" />

### 语气

tone 决定用哪族颜色，与 variant 正交：四种形态 × 六种语气都成立

<XhDemo src="button/05-tone" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-button>` |
| Vue 组件 | `XhButton` `XhButtonIndicator` `XhButtonLabel` `XhButtonPrefix` `XhButtonSuffix` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/button.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="button"`：**`root`** · `label` · `indicator` · `prefix` · `suffix`

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `disabled` | `boolean` |  |
| `loading` | `boolean` |  |
| `getRootProps` | `() => T['button']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getPrefixProps` | `() => T['element']` |  |
| `getSuffixProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in root, interactive | 激活按钮（原生行为） |
