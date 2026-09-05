# 警告提示 <Badge type="info" text="alert" />

页面里常驻的一条提示：说明一件与当前上下文有关的事。

## 何时使用

- 表单顶部的整体错误、页面级的状态说明、功能公告。
- 信息需要一直在，直到用户处理或关闭。

## 何时不用

- 只是一次操作的结果反馈：用[轻提示](./toast)——它会自己消失。
- 需要用户当场做决定并阻断流程：用[对话框](./dialog)。
- 是一个字段的错误：用[表单字段](./field)的错误文本。

## 特性

- 语气决定用哪族颜色，图标由作者放。
- `closable` 给出关闭按钮，关闭态可受控。

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
| Vue 组件 | `XhAlertCloseTrigger` `XhAlertDescription` `XhAlertIndicator` `XhAlertRoot` `XhAlertTitle` |
| 状态机 | `alertMachine` |
| 皮肤 | `@xihan-ui/styles/alert.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="alert"`：**`root`** · `indicator` · `title` · `description` · `close-trigger`

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

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

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
| `getIndicatorProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus 在 close-trigger 上且 closable | 收起提示并通知 open=false |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-atomic` | 'true' |
| `root` | `aria-describedby` | `description` 部件的 id |
| `root` | `aria-labelledby` | `title` 部件的 id |
| `root` | `aria-live` | live |
| `root` | `role` | role |
| `indicator` | `aria-hidden` | 'true' |
| `close-trigger` | `aria-label` | props.translations.close |

## 样式

默认皮肤 `@xihan-ui/styles/alert.css` 按部件选择：`[data-scope="alert"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `close-trigger` | `data-disabled` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-alert-bg` · `--xh-alert-border` · `--xh-alert-close-bg-active` · `--xh-alert-close-bg-hover` · `--xh-alert-close-fg` · `--xh-alert-close-fg-hover` · `--xh-alert-close-radius` · `--xh-alert-close-size` · `--xh-alert-description-fg` · `--xh-alert-description-font-size` · `--xh-alert-fg` · `--xh-alert-font-size` · `--xh-alert-gap` · `--xh-alert-icon-size` · `--xh-alert-indicator-box` · `--xh-alert-indicator-fg` · `--xh-alert-leading` · `--xh-alert-px` · `--xh-alert-py` · `--xh-alert-radius` · `--xh-alert-title-fg` · `--xh-alert-title-font-size` · `--xh-alert-title-font-weight` · `--xh-alert-title-leading`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤内置条件规则：`pointer: coarse`。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 图标用[图标](./icon)；里面的行动入口用[按钮](./button)。

## 最佳实践

- 说清楚发生了什么、影响是什么、用户能做什么，三样缺一不可。
- 语气别只靠颜色，标题文字本身就要说明严重程度。

## 反模式

- 一屏堆好几条提示：用户会全部略过。
- 用它做营销位。
