# Timer <Badge type="info" text="计时器" />

一段可正可倒的计时：能起、能停、能接着走、能归零。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/timer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/timer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/timer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/timer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/timer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一个自己往上走的秒表：不写内容时组件铺开时、分、秒三段，auto-start 让它挂载即开跑

<XhDemo src="timer/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="timer"`：**`root`** · **`display`** · `item` · `separator` · `control`

## 示例

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

### 受控通道

给了 value 与 active 就走受控分支：value 改写即重新计时，active 翻假停在当前剩余量、翻真接着走

<XhDemo src="timer/07-controlled" />

## 设计指引

### 何时使用

- 秒表、答题计时、专注计时这类需要用户自己控制起停的场景。
- 会议或直播的已进行时长。
- 需要倒着走、并且要在中途暂停的限时任务。
- 验证码重发倒计时、限时活动、会话即将过期提醒这类只倒数、不需要按钮的场景：走受控通道，只给一个剩余时长。

### 何时不用

- 展示的是一个时刻而不是一段时长：用[时间戳](./timestamp)。
- 表达任务完成到哪一步：用[进度条](./progress)。

### 特性

- 正着走还是倒着走由 `countdown` 决定，起点 `startMs` 与终点 `targetMs` 两个方向共用。
- `start` / `pause` / `resume` / `reset` 四个动作齐全，`control` 部件把它们收成一个按钮，按当前状态自动换语义。
- 时间只从单调时钟的两个时刻相减而来，一拍都不累加，所以停停走走也不会越走越偏。
- `interval` 只决定数字多久跳一次；到点由另一个精确落在终点上的定时器判定，终点不落在整拍上也不会走过头。
- 每一段数字是一个 `item` 部件，`unit` 说明它是天、时、分、秒还是毫秒，排版完全交给作者。
- **受控通道**：给了 `value`（剩余毫秒）或 `active` 即进受控分支——`value` 就是起点、方向锁成倒着走、终点锁成 0，改写它即从新值重新计时；`active` 翻假停在当前值、翻真接着走。受控时起停按钮不再改状态（根上落 `data-controlled`），状态归这两个 prop。
- `format` 把当前值铺成一串字（`api.text`），`precision` 决定取到哪一位：`0` 到秒、`3` 到毫秒，缺省 `3` 即不量化。
- `live` 决定时间区的读屏播报档位，缺省 `off`。

### 组合

- 与[按钮](./button)配合做「开始 / 暂停 / 重来」一排控制。
- 与[进度条](./progress)并排，一个说还剩多久、一个说走了几成。
- 走完后用[警告提示](./alert)或[提示消息](./toast)告诉用户下一步做什么。

### 最佳实践

- 计时超过一天要自己加一段 `days`：`hours` 满 24 会进位到天，只写时分秒会把整天数丢掉。
- 数字用等宽字形，位数变化时分隔符才不会左右挪动，皮肤已经这样做了，自定义排版时别丢掉。
- 嵌在一句话里或摆在别人的数值槽里时把 `--xh-timer-digit-font-size` 写成 `inherit`，数字就跟着上下文的字号走，不再自带展示档字号。
- 精确到秒的倒计时别开成高频播报：读屏用户会被打断得没法做事。
- 每一段的数字恒由组件写进条目里，作者只声明这一段是哪个单位；写在条目里的内容留不住，下一拍就会被新的数字盖掉。要在数字旁边加字（「时」「分」）请写进记号部件。
- 起停按钮的名字（读屏念的那个）恒由组件按当前状态给，换语言走 `translations`，别硬编码。按钮里显示的那行字两个适配器不一样，见下一条。
- 两个适配器的差别只有三处，写标记前先对一眼：
  - **默认结构**：Vue 的根组件不写内容时会自动铺开「时:分:秒」；Web Components 侧元素不生成任何结构，root 与 display 一个都不能少，每一段与记号都要作者自己写出来。
  - **按钮里的字**：Vue 的起停按钮不写内容时填当前动作的名字（Start / Pause / Resume / Reset）；Web Components 侧那行字归作者写（按钮里多半是个图标），元素只换按钮的 `data-action` 与读屏名字。
  - **记号的缺省**：Vue 的记号部件不写内容时是一个冒号；Web Components 侧记号里的字一律归作者写。
- Web Components 侧条目上的 `unit` 是作者的声明、不是元素写回的状态，改它本身不会另排一次接线：停着的时候改完要等下一次属性变更或起跑才生效（跑起来时每一拍都会重接一次，自然跟上）。
- 走完之后要有明确的去处：或者归零重来，或者跳去下一步，别停在 00:00 就不动了。

### 反模式

- 用它显示当前时刻：它只认时长，不认日历也不认时区。
- 只给终点不给起点做倒计时：起点缺省是 0，倒着走会一开跑就到点，屏幕上恒是 00:00。要倒计多久写进 `startMs`。
- 挂载后再改 `autoStart` 指望它开跑：那个 prop 只在挂载那一刻读一次，起停请用动作或 `control`。
- 走完了不发生任何事，用户白等一场。
- 走完之后停在 00:00 就不动了，既不归零也不给下一步。
- 页面切到后台后计时漂移却不校正：时间只从单调时钟的两个时刻相减，别自己按拍累加。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-timer>` |
| Vue 组件 | `XhTimerControl` `XhTimerDisplay` `XhTimerItem` `XhTimerRoot` `XhTimerSeparator` |
| 组合式函数 | `useTimer` |
| 状态机 | `timerMachine` |
| 皮肤 | `@xihan-ui/styles/timer.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `startMs` | `number` |  | 起始值毫秒，缺省 0。正计时从它往上走，倒计时从它往下走。 |
| `targetMs` | `number` |  | 终点值毫秒。倒计时缺省 0；正计时不给它就一直走下去，没有终点也不会通知走完。 终点落在起点的反方向（倒计时给了比起点还大的终点）时这一轮长度为 0： 显示值停在起点上，一开跑就到点。 |
| `countdown` | `boolean` |  | 倒着走，缺省假。 |
| `value` | `number` |  | 受控剩余毫秒。给了它即进受控通道：它就是起点，方向锁成倒着走、终点锁成 0， startMs / targetMs / countdown 三个不再参与；改写它即把累计清零并从新值重新计时。 |
| `active` | `boolean` |  | 受控开关，缺省真。给了它即进受控通道：翻假停在当前累计值，翻真从那里接着走。 受控时起停按钮不再改状态——状态由这个 prop 说了算。 |
| `autoStart` | `boolean` |  | 挂载即开跑，缺省假。它只在挂载那一刻读一次，之后改它不再有作用。 |
| `interval` | `number` |  | 刷新间隔毫秒，缺省 1000，下限一帧。 它只决定数字多久跳一次；到点由另一个精确落在终点上的定时器判定，不受它影响。 |
| `format` | `string` |  | 文本模板，缺省 `HH:mm:ss`。D 天、H 时、m 分、s 秒、S 毫秒，重复字母的个数即最少位数。 |
| `precision` | `number` |  | 取值粒度：0 到秒、1 到十分之一秒、2 到百分之一秒、3 到毫秒。缺省 3，即不量化。 |
| `live` | `TimerLive` |  | 读屏播报档位，缺省 off。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<TimerTranslations>` |  |  |
| `onTick` | `(details: TimerTickDetails) => void` |  | 每一拍通知一次。到点那一拍只发 onComplete。 |
| `onComplete` | `(details: TimerCompleteDetails) => void` |  | 走到终点通知一次；中途被暂停或归零不通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `tick` | `TimerTickDetails` | 走过一拍；detail 为 `{ value: number, elapsed: number }` |
| `complete` | `TimerCompleteDetails` | 走到终点；detail 为 `{ value: number, elapsed: number }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTimerRoot` | `default` | `TimerRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'idle' \| 'running' \| 'paused' \| 'completed' |
| `display` | 'idle' \| 'running' \| 'paused' \| 'completed' |

以下名称仅用于内部状态机。

**状态**：`idle` · `running` · `paused` · `completed`

**事件**：`RUN.START` · `RUN.PAUSE` · `RUN.RESUME` · `RUN.RESET` · `CLOCK.TICK` · `CLOCK.SETTLE` · `CLOCK.SYNC`

**判据**：`isSettled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `phase` | `TimerPhase` |  |
| `value` | `number` | 当前该显示的毫秒，已夹在起点与终点之间并按 precision 量化。 |
| `text` | `string` | 按模板铺好的文本，也就是不自己排每一段时该显示的字。 |
| `controlled` | `boolean` | 走的是受控通道吗：给了 value 或 active 即是，此时起停按钮不改状态。 |
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
| `getDisplayProps` | `() => T['element']` |  |
| `getItemProps` | `(props: TimerItemProps) => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus on control | 按当前状态起停：没起步的开跑、在走的暂停、停在半路的接着走、走完的归零；control 是原生 button，这两个键由平台翻成 click |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `display` | `aria-label` | label.time(segments) |
| `display` | `aria-live` | props.live |
| `display` | `role` | 'timer' |
| `item` | `aria-hidden` | 'true' |
| `separator` | `aria-hidden` | 'true' |
| `control` | `aria-label` | label[controlAction] |

- 时间区带着整段时间的读屏名字，里面的数字与记号对读屏是隐藏的。
- 内建的那个名字恒按「时 分 秒」念（天数大于 0 时前面再加一段天）。屏幕上只摆了其中几段（例如只有分和秒）时它会多念一段，请用 `translations.time` 自己按摆出来的段数给名字。
- 内建名字是英文，换语言同样走 `translations.time`。
- 缺省不播报。要播报的场景（会话到期提醒这类）把 `live` 开到 `polite` 或 `assertive`，或者自己在外层另起一个 live 区，只在关口上说一句：每秒都在变的数字按 polite 播报，一分钟就是六十条打断。

## 样式参考

### 皮肤

`@xihan-ui/styles/timer.css` 使用 `[data-scope="timer"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-controlled` | ''（条件成立时才出现） |
| `root` | `data-countdown` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'idle' \| 'running' \| 'paused' \| 'completed' |
| `display` | `data-state` | 'idle' \| 'running' \| 'paused' \| 'completed' |
| `item` | `data-unit` | item.unit |
| `control` | `data-action` | 'pause' \| 'resume' \| 'reset' \| 'start' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-timer-completed-fg` | `display` | `color` | `state=completed` | `--xh-fg-muted` | timer 的 display 部件 color 覆盖槽。 |
| `--xh-timer-control-bg` | `control` | `background` | `default` | `--xh-bg-surface` | timer 的 control 部件 background 覆盖槽。 |
| `--xh-timer-control-bg-active` | `control` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | timer 的 control 部件 background 覆盖槽。 |
| `--xh-timer-control-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-muted` | timer 的 control 部件 background 覆盖槽。 |
| `--xh-timer-control-bg-hover` | `control` | `background` | `hover` | `--xh-bg-subtle-hover` | timer 的 control 部件 background 覆盖槽。 |
| `--xh-timer-control-border` | `control` | `border` | `default` | `--xh-border-control` | timer 的 control 部件 border 覆盖槽。 |
| `--xh-timer-control-border-disabled` | `control` | `border-color` | `disabled` | `--xh-border-subtle` | timer 的 control 部件 border-color 覆盖槽。 |
| `--xh-timer-control-border-focus` | `control` | `border-color` | `focus-visible` | `--xh-_tone` | timer 的 control 部件 border-color 覆盖槽。 |
| `--xh-timer-control-border-hover` | `control` | `border-color` | `hover` | `--xh-border-control-hover` | timer 的 control 部件 border-color 覆盖槽。 |
| `--xh-timer-control-fg` | `control` | `color` | `default` | `--xh-fg-default` | timer 的 control 部件 color 覆盖槽。 |
| `--xh-timer-control-gap` | `control` | `gap` | `default` | `--xh-_timer-control-gap` | timer 的 control 部件 gap 覆盖槽。 |
| `--xh-timer-control-h` | `control` | `block-size` | `default` | `--xh-_timer-control-h` | timer 的 control 部件 block-size 覆盖槽。 |
| `--xh-timer-control-px` | `control` | `padding-inline` | `default` | `--xh-_timer-control-px` | timer 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-timer-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | timer 的 control 部件 border-radius 覆盖槽。 |
| `--xh-timer-control-shadow-active` | `control` | `box-shadow` | `active`<br>`not(:disabled)` | `none` | timer 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-timer-control-shadow-hover` | `control` | `box-shadow` | `hover`<br>`not(:disabled)` | `--xh-elevation-raised` | timer 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-timer-digit-font-size` | `display` | `font-size` | `default` | `--xh-_timer-digit-size` | timer 的 display 部件 font-size 覆盖槽。 |
| `--xh-timer-display-fg` | `display` | `color` | `default` | `--xh-fg-default` | timer 的 display 部件 color 覆盖槽。 |
| `--xh-timer-fg` | `root` | `color` | `default` | `--xh-fg-default` | timer 的 root 部件 color 覆盖槽。 |
| `--xh-timer-gap` | `root` | `gap` | `default` | `--xh-_timer-gap` | timer 的 root 部件 gap 覆盖槽。 |
| `--xh-timer-item-fg` | `item` | `color` | `default` | `inherit` | timer 的 item 部件 color 覆盖槽。 |
| `--xh-timer-separator-fg` | `separator` | `color` | `default` | `--xh-fg-subtle` | timer 的 separator 部件 color 覆盖槽。 |
| `--xh-timer-separator-px` | `separator` | `padding-inline` | `default` | `--xh-space-0_5` | timer 的 separator 部件 padding-inline 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `box-shadow` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 时间区的排列方向钉成从左到右，`<html dir="rtl">` 下时分秒不会倒过来排——时间串的读序两个方向都一样。
- 起停按钮相对时间区的位置、以及整个组件在页面里的排布，照常跟随文字方向。
