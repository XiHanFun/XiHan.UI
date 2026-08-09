# 切换按钮 <Badge type="info" text="toggle" />

通用组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toggle>` |
| Vue 组件 | `XhToggle` |
| 组合式函数 | `useToggle` |
| 状态机 | `toggleMachine` |
| 皮肤 | `@xihan-ui/styled/toggle.css` |

## 示例

<XhDemo src="toggle/01-basic" />

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="toggle"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `pressed` | `boolean` |  |  |
| `defaultPressed` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `onPressedChange` | `(details: TogglePressedChangeDetails) => void` |  | pressed 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 状态机

**状态**：`off` · `on`

**事件**：`TOGGLE` · `CONTROLLED.ON` · `CONTROLLED.OFF`

**判据**：`isPressedControlled`

## connect API

`useToggle` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `pressed` | `boolean` |  |
| `setPressed` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in root, not disabled | 切换 pressed 状态 |
