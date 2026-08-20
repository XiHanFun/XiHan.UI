# 计时器 <Badge type="info" text="timer" />

一段可正可倒的计时：能起、能停、能接着走、能归零。

## 何时使用

- 秒表、答题计时、专注计时这类需要用户自己控制起停的场景。
- 会议或直播的已进行时长。
- 需要倒着走、并且要在中途暂停的限时任务。

## 何时不用

- 只倒数、不需要任何控制：用[倒计时](./countdown)，它更小，作者只给一个剩余时长。
- 展示的是一个时刻而不是一段时长：用[时间](./time)。
- 表达任务完成到哪一步：用[进度条](./progress)。

## 特性

- 正着走还是倒着走由 `countdown` 决定，起点 `startMs` 与终点 `targetMs` 两个方向共用。
- `start` / `pause` / `resume` / `reset` 四个动作齐全，`control` 部件把它们收成一个按钮，按当前状态自动换语义。
- 时间只从单调时钟的两个时刻相减而来，一拍都不累加，所以停停走走也不会越走越偏。
- `interval` 只决定数字多久跳一次；到点由另一个精确落在终点上的定时器判定，终点不落在整拍上也不会走过头。
- 每一段数字是一个 `item` 部件，`unit` 说明它是天、时、分、秒还是毫秒，排版完全交给作者。

## 示例

### 基础用法

一个自己往上走的秒表：不写内容时组件铺开时、分、秒三段，auto-start 让它挂载即开跑

<XhDemo src="timer/01-basic" />

### 倒着走

countdown 让它从起始值往下走，终点缺省是 0；走到终点就停在那里不再往下

<XhDemo src="timer/02-countdown" />

### 起停与归零

自己写部件：control 是一个原生按钮，按一下就按当前状态走一步（开始 / 暂停 / 继续 / 重来）

<XhDemo src="timer/03-control" />

### 带天数的长计时

时满 24 会进位到天，超过一天的计时要自己写一段 days，只写时分秒会把整天数丢掉

<XhDemo src="timer/04-days" />

### 三个尺寸档

size 只写在 root 上，数字大小与起停按钮的高度一起换档，子部件不重复标注

<XhDemo src="timer/05-size" />

### 每一拍与到点

tick 每过一个 interval 发一次，complete 只在走到终点那一刻发一次；到点那一拍不再发 tick

<XhDemo src="timer/06-notify" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-timer>` |
| Vue 组件 | `XhTimerArea` `XhTimerControl` `XhTimerItem` `XhTimerRoot` `XhTimerSeparator` |
| 组合式函数 | `useTimer` |
| 状态机 | `timerMachine` |
| 皮肤 | `@xihan-ui/styles/timer.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="timer"`：**`root`** · **`area`** · `item` · `separator` · `control`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `startMs` | `number` |  | 起始值毫秒，缺省 0。正计时从它往上走，倒计时从它往下走。 |
| `targetMs` | `number` |  | 终点值毫秒。倒计时缺省 0；正计时不给它就一直走下去，没有终点也不会通知走完。 终点落在起点的反方向（倒计时给了比起点还大的终点）时这一轮长度为 0： 显示值停在起点上，一开跑就到点。 |
| `countdown` | `boolean` |  | 倒着走，缺省假。 |
| `autoStart` | `boolean` |  | 挂载即开跑，缺省假。它只在挂载那一刻读一次，之后改它不再有作用。 |
| `interval` | `number` |  | 刷新间隔毫秒，缺省 1000，下限一帧。 它只决定数字多久跳一次；到点由另一个精确落在终点上的定时器判定，不受它影响。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<TimerTranslations>` |  |  |
| `onTick` | `(details: TimerTickDetails) => void` |  | 每一拍通知一次。到点那一拍只发 onComplete。 |
| `onComplete` | `(details: TimerCompleteDetails) => void` |  | 走到终点通知一次；中途被暂停或归零不通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `tick` | `TimerTickDetails` | 走过一拍；detail 为 `{ value: number, elapsed: number }` |
| `complete` | `TimerCompleteDetails` | 走到终点；detail 为 `{ value: number, elapsed: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTimerRoot` | `default` | `TimerRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'idle' \| 'running' \| 'paused' \| 'completed' |
| `area` | 'idle' \| 'running' \| 'paused' \| 'completed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `running` · `paused` · `completed`

**事件**：`RUN.START` · `RUN.PAUSE` · `RUN.RESUME` · `RUN.RESET` · `CLOCK.TICK` · `CLOCK.SETTLE` · `CLOCK.SYNC`

**判据**：`isSettled`

## connect API

`useTimer` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `phase` | `TimerPhase` |  |
| `value` | `number` | 当前该显示的毫秒，已夹在起点与终点之间。 |
| `elapsed` | `number` | 累计走了多少毫秒，与方向和起始值无关。 |
| `running` | `boolean` |  |
| `paused` | `boolean` |  |
| `completed` | `boolean` |  |
| `countdown` | `boolean` |  |
| `segments` | `TimerSegments` | 显示值拆开的五段。 |
| `segmentText` | `(unit: TimerUnit) => string` | 某一段补零后的字面：天不补零，时分秒两位，毫秒三位。 |
| `controlAction` | `TimerControlAction` | 起停按钮这一下要做的事。 |
| `controlLabel` | `string` | 起停按钮的读屏名字，也是按钮里没写内容时该显示的字。 |
| `start` | `() => void` | 从头开跑。 |
| `pause` | `() => void` |  |
| `resume` | `() => void` |  |
| `reset` | `() => void` | 归零并停下。 |
| `getRootProps` | `() => T['element']` |  |
| `getAreaProps` | `() => T['element']` |  |
| `getItemProps` | `(props: TimerItemProps) => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus on control | 按当前状态起停：没起步的开跑、在走的暂停、停在半路的接着走、走完的归零；control 是原生 button，这两个键由平台翻成 click |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `area` | `aria-label` | label.time(segments) |
| `area` | `aria-live` | 'off' |
| `area` | `role` | 'timer' |
| `item` | `aria-hidden` | 'true' |
| `separator` | `aria-hidden` | 'true' |
| `control` | `aria-label` | label[controlAction] |

- 时间区带着整段时间的读屏名字，里面的数字与记号对读屏是隐藏的。
- 内建的那个名字恒按「时 分 秒」念（天数大于 0 时前面再加一段天）。屏幕上只摆了其中几段（例如只有分和秒）时它会多念一段，请用 `translations.time` 自己按摆出来的段数给名字。
- 内建名字是英文，换语言同样走 `translations.time`。
- 要播报请自己在外层另起一个 live 区，只在关口上说一句：每秒都在变的数字按 polite 播报，一分钟就是六十条打断。

## 样式

默认皮肤 `@xihan-ui/styles/timer.css` 按部件选择：`[data-scope="timer"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-countdown` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'idle' \| 'running' \| 'paused' \| 'completed' |
| `area` | `data-state` | 'idle' \| 'running' \| 'paused' \| 'completed' |
| `item` | `data-unit` | item.unit |
| `control` | `data-action` | 'pause' \| 'resume' \| 'reset' \| 'start' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-timer-area-fg` · `--xh-timer-completed-fg` · `--xh-timer-control-bg` · `--xh-timer-control-bg-active` · `--xh-timer-control-bg-disabled` · `--xh-timer-control-bg-hover` · `--xh-timer-control-border` · `--xh-timer-control-border-disabled` · `--xh-timer-control-border-hover` · `--xh-timer-control-fg` · `--xh-timer-control-gap` · `--xh-timer-control-h` · `--xh-timer-control-px` · `--xh-timer-control-radius` · `--xh-timer-digit-font-size` · `--xh-timer-fg` · `--xh-timer-gap` · `--xh-timer-separator-fg` · `--xh-timer-separator-px`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 时间区的排列方向钉成从左到右，`<html dir="rtl">` 下时分秒不会倒过来排——时间串的读序两个方向都一样。
- 起停按钮相对时间区的位置、以及整个组件在页面里的排布，照常跟随文字方向。

## 组合

- 与[按钮](./button)配合做「开始 / 暂停 / 重来」一排控制。
- 与[进度条](./progress)并排，一个说还剩多久、一个说走了几成。
- 走完后用[警告提示](./alert)或[提示消息](./toast)告诉用户下一步做什么。

## 最佳实践

- 计时超过一天要自己加一段 `days`：`hours` 满 24 会进位到天，只写时分秒会把整天数丢掉。
- 数字用等宽字形，位数变化时分隔符才不会左右挪动，皮肤已经这样做了，自定义排版时别丢掉。
- 每一段的数字恒由组件写进条目里，作者只声明这一段是哪个单位；写在条目里的内容留不住，下一拍就会被新的数字盖掉。要在数字旁边加字（「时」「分」）请写进记号部件。
- 起停按钮的名字（读屏念的那个）恒由组件按当前状态给，换语言走 `translations`，别硬编码。按钮里显示的那行字两个适配器不一样，见下一条。
- 两个适配器的差别只有三处，写标记前先对一眼：
  - **默认结构**：Vue 的根组件不写内容时会自动铺开「时:分:秒」；Web Components 侧元素不生成任何结构，root 与 area 一个都不能少，每一段与记号都要作者自己写出来。
  - **按钮里的字**：Vue 的起停按钮不写内容时填当前动作的名字（Start / Pause / Resume / Reset）；Web Components 侧那行字归作者写（按钮里多半是个图标），元素只换按钮的 `data-action` 与读屏名字。
  - **记号的缺省**：Vue 的记号部件不写内容时是一个冒号；Web Components 侧记号里的字一律归作者写。
- Web Components 侧条目上的 `unit` 是作者的声明、不是元素写回的状态，改它本身不会另排一次接线：停着的时候改完要等下一次属性变更或起跑才生效（跑起来时每一拍都会重接一次，自然跟上）。
- 走完之后要有明确的去处：或者归零重来，或者跳去下一步，别停在 00:00 就不动了。

## 反模式

- 用它显示当前时刻：它只认时长，不认日历也不认时区。
- 只给终点不给起点做倒计时：起点缺省是 0，倒着走会一开跑就到点，屏幕上恒是 00:00。要倒计多久写进 `startMs`。
- 挂载后再改 `autoStart` 指望它开跑：那个 prop 只在挂载那一刻读一次，起停请用动作或 `control`。
- 走完了不发生任何事，用户白等一场。
