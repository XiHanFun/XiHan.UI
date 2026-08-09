# 警告提示 <Badge type="info" text="alert" />

反馈与浮层组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-alert>` |
| Vue 组件 | `XhAlertCloseTrigger` `XhAlertDescription` `XhAlertIcon` `XhAlertRoot` `XhAlertTitle` |
| 状态机 | `alertMachine` |
| 皮肤 | `@xihan-ui/styled/alert.css` |

## 示例

<XhDemo src="alert/01-basic" />

<XhDemo src="alert/02-variant" />

<XhDemo src="alert/03-closable" />

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="alert"`：**`root`** · `icon` · `title` · `description` · `close-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `variant` | `AlertVariant` |  | 语气，默认 info。danger / warning 走 role="alert"，其余走 role="status"。 |
| `closable` | `boolean` |  | 关闭按钮是否可用，默认 true。false 时该按钮同时被禁用与收起。 |
| `open` | `boolean` |  | 受控显隐；缺省该 prop 即非受控。 |
| `defaultOpen` | `boolean` |  | 非受控初始显隐，默认显示。 |
| `onOpenChange` | `(details: AlertOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |
| `translations` | `Partial<AlertTranslations>` |  |  |

## 状态机

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `variant` | `AlertVariant` |  |
| `closable` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getIconProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus 在 close-trigger 上且 closable | 收起提示并通知 open=false |
