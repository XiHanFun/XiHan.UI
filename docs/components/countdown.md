# 倒计时 <Badge type="info" text="countdown" />

数据展示组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

给一个剩余毫秒就开始往下走，缺省模板是 HH:mm:ss；走到 0 就停住不再往下

<XhDemo src="countdown/01-basic" />

### 模板与精度

format 里 H 时 m 分 s 秒 S 毫秒，重复字母的个数即最少位数；precision 决定读到的数有多细

<XhDemo src="countdown/02-format" />

### 自己排版每一段

默认插槽给出拆好的时、分、秒、毫秒，想把每段装进独立的格子就自己写

<XhDemo src="countdown/03-slot" />

### 暂停、继续与到点

active 翻假即停在当前剩余量，翻真从那里接着走；改 value 就是重新计时，到点派一次 finish

<XhDemo src="countdown/04-control" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-countdown>` |
| Vue 组件 | `XhCountdown` |
| 状态机 | `countdownMachine` |
| 皮肤 | `@xihan-ui/styles/countdown.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="countdown"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` |  | 剩余毫秒，缺省 0。改写它即把剩余量落到新值并从那里重新计时。 |
| `format` | `string` |  | 模板，缺省 `HH:mm:ss`。H 时、m 分、s 秒、S 毫秒，重复字母的个数即最少位数。 |
| `active` | `boolean` |  | 是否在走，缺省 true。翻假即停在当前剩余量，翻真从那里接着走。 |
| `precision` | `number` |  | 取值粒度：0 到秒、1 到十分之一秒、2 到百分之一秒、3 到毫秒。缺省 0。 |
| `live` | `CountdownLive` |  | 读屏播报档位，缺省 off。 |
| `onFinish` | `(details: CountdownFinishDetails) => void` |  | 走到 0 时通知一次。中途被停掉不通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `finish` | `CountdownFinishDetails` | 走到 0；detail 为 `{ value: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCountdown` | `default` | `CountdownSlotProps` |  |

## 状态机

内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `running`

**事件**：`RUN.START` · `RUN.STOP` · `RUN.SYNC` · `FRAME`

**判据**：`isSettled` · `isActive`

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `phase` | `CountdownPhase` |  |
| `value` | `number` | 按精度量化后的剩余毫秒，也是拆分与铺字的输入。 |
| `text` | `string` | 按模板铺好的文本，也就是根里该显示的字。 |
| `parts` | `CountdownParts` | 拆开的时、分、秒、毫秒，给要自己排版每一段的作者用。 |
| `running` | `boolean` | 是否还在走。 |
| `finished` | `boolean` | 剩余量是否已经归零。 |
| `getRootProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/TR/wai-aria-1.2/#status)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-countdown-fg` · `--xh-countdown-finished-fg`
