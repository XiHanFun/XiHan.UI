# 警告提示 <Badge type="info" text="alert" />

反馈与浮层组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

各部件按需摆放，标题与描述都是可选的

<XhDemo src="alert/01-basic" />

### 语气

tone 只改配色，语义仍由内容与 role 决定

<XhDemo src="alert/02-tone" />

### 可关闭

closable 开启后才渲染关闭按钮；open 受控时由宿主决定去留

<XhDemo src="alert/03-closable" />

### 图标

icon 部件排在标题前面，颜色取当前语气的强调色；内容由作者塞，字形与内联 svg 都行

<XhDemo src="alert/04-icon" />

### 自定义外观

描边、底色、标题色、圆角各是一个组件令牌；描边槽位换成透明就只剩淡底，尺寸不变

<XhDemo src="alert/05-custom" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-alert>` |
| Vue 组件 | `XhAlertCloseTrigger` `XhAlertDescription` `XhAlertIcon` `XhAlertRoot` `XhAlertTitle` |
| 状态机 | `alertMachine` |
| 皮肤 | `@xihan-ui/styles/alert.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="alert"`：**`root`** · `icon` · `title` · `description` · `close-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色，默认 info。 danger / warning 走 role="alert"，其余走 role="status"。 |
| `closable` | `boolean` |  | 关闭按钮是否可用，默认 true。false 时该按钮同时被禁用与收起。 |
| `open` | `boolean` |  | 受控显隐；缺省该 prop 即非受控。 |
| `defaultOpen` | `boolean` |  | 非受控初始显隐，默认显示。 |
| `onOpenChange` | `(details: AlertOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |
| `translations` | `Partial<AlertTranslations>` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `AlertOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 状态机

内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `tone` | `string` |  |
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

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-alert-bg` · `--xh-alert-border` · `--xh-alert-close-fg` · `--xh-alert-close-fg-hover` · `--xh-alert-close-radius` · `--xh-alert-close-size` · `--xh-alert-description-fg` · `--xh-alert-description-font-size` · `--xh-alert-fg` · `--xh-alert-font-size` · `--xh-alert-gap` · `--xh-alert-icon-fg` · `--xh-alert-icon-size` · `--xh-alert-leading` · `--xh-alert-px` · `--xh-alert-py` · `--xh-alert-radius` · `--xh-alert-title-fg` · `--xh-alert-title-font-size` · `--xh-alert-title-font-weight` · `--xh-alert-title-leading`
