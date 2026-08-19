# 按钮组 <Badge type="info" text="button-group" />

通用组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

一组相关按钮连成一条：相邻两段共用一条边，圆角只留在两端

<XhDemo src="button-group/01-basic" />

### 排布

横排在左右两端留圆角，竖排改在上下两端；合边跟着换轴

<XhDemo src="button-group/02-orientation" />

### 尺寸

高度、内边距与字号在组上写一次，沿自定义属性流给组内每一段

<XhDemo src="button-group/03-size" />

### 形态与语气

形态决定颜色怎么用、语气决定用哪族颜色，两者都写在组上，段自己不重复标注

<XhDemo src="button-group/04-variant-tone" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-button-group>` |
| Vue 组件 | `XhButtonGroup` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/button-group.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="button-group"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` |  | 排布：horizontal / vertical，决定相邻两段在哪个轴上合边。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，落到根上供皮肤写进组内按钮的高度、内边距与字号槽位。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，落到根上沿继承流给组内每一段。 |
| `variant` | `ActionVariant` |  | 形态：solid / subtle / outline / ghost，落到根上供皮肤写进组内按钮的颜色槽位。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-button-group-radius`
