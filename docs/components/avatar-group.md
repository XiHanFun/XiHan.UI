# 头像组 <Badge type="info" text="avatar-group" />

通用组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

一排叠放的头像：后一枚压在前一枚上，被压住的边由一圈底色分开

<XhDemo src="avatar-group/01-basic" />

### 上限与溢出计数

摆到上限为止，其余收成一枚「+N」；裁到几枚、N 写多少由作者定，组件只给这一枚身份与位置

<XhDemo src="avatar-group/02-overflow" />

### 尺寸

直径、字号与叠放量在组上写一次，沿自定义属性流给组内每一枚，「+N」跟着一起换

<XhDemo src="avatar-group/03-size" />

### 使用者令牌

直径、叠放量、分隔那圈底色都留了槽位，写在组上就整组换掉

<XhDemo src="avatar-group/04-custom" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-avatar-group>` |
| Vue 组件 | `XhAvatarGroupOverflow` `XhAvatarGroupRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/avatar-group.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="avatar-group"`：**`root`** · `overflow`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `max` | `number` |  | 展示上限：这一组打算摆出几枚，其余收进 overflow 那一枚。 头像由作者渲染，所以裁到几枚、「+N」里的 N 写多少都在作者手里； 组件把这个上限如实落成根上的 data-max。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，落到根上沿继承流下发给组内每一枚。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getOverflowProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
