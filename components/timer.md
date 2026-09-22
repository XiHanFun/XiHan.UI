来源：https://ui.docs.xihanfun.com/components/timer

# Timer 计时器

一段可正计时或倒计时的时长：可启动、暂停、继续、归零。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/timer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/timer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/timer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/timer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/timer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一个自动递增的秒表：不写内容时组件铺设时、分、秒三段，auto-start 使它挂载即开始运行

```vue
<script setup lang="ts">
import { XhTimerRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhTimerRoot auto-start />
</template>
```

```html
<xh-timer auto-start>
  <div data-xh-part="root">
    <div data-xh-part="display">
      <span data-xh-part="item" unit="hours"></span>
      <span data-xh-part="separator">:</span>
      <span data-xh-part="item" unit="minutes"></span>
      <span data-xh-part="separator">:</span>
      <span data-xh-part="item" unit="seconds"></span>
    </div>
  </div>
</xh-timer>
```

## 组件结构

加粗的是必需部件。

`data-scope="timer"`：**`root`** · **`display`** · `item` · `separator` · `control`

## 示例

### 倒计时

countdown 使它从起始值递减，终点默认是 0；到达终点即停在该处不再递减

```vue
<script setup lang="ts">
import { XhTimerRoot } from "@xihan-ui/vue";

const twoMinutes = 2 * 60 * 1000;
</script>

<template>
  <XhTimerRoot countdown :start-ms="twoMinutes" auto-start />
</template>
```

```html
<xh-timer countdown start-ms="120000" auto-start>
  <div data-xh-part="root">
    <div data-xh-part="display">
      <span data-xh-part="item" unit="hours"></span>
      <span data-xh-part="separator">:</span>
      <span data-xh-part="item" unit="minutes"></span>
      <span data-xh-part="separator">:</span>
      <span data-xh-part="item" unit="seconds"></span>
    </div>
  </div>
</xh-timer>
```

### 起停与归零

自行编写部件：control 是一个原生按钮，按一下即按当前状态前进一步（开始 / 暂停 / 继续 / 重来）

```vue
<script setup lang="ts">
import {
  XhTimerControl,
  XhTimerDisplay,
  XhTimerItem,
  XhTimerRoot,
  XhTimerSeparator,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTimerRoot>
    <XhTimerDisplay>
      <XhTimerItem unit="minutes" />
      <XhTimerSeparator>:</XhTimerSeparator>
      <XhTimerItem unit="seconds" />
    </XhTimerDisplay>
    <XhTimerControl>起停</XhTimerControl>
  </XhTimerRoot>
</template>
```

```html
<xh-timer>
  <div data-xh-part="root">
    <div data-xh-part="display">
      <span data-xh-part="item" unit="minutes"></span>
      <span data-xh-part="separator">:</span>
      <span data-xh-part="item" unit="seconds"></span>
    </div>
    <button data-xh-part="control">起停</button>
  </div>
</xh-timer>
```

### 带天数的长计时

小时满 24 会进位到天，超过一天的计时要自行编写一段 days，只写时分秒会丢失整天数

```vue
<script setup lang="ts">
import {
  XhTimerDisplay,
  XhTimerItem,
  XhTimerRoot,
  XhTimerSeparator,
} from "@xihan-ui/vue";

const threeDays = 3 * 24 * 60 * 60 * 1000;
</script>

<template>
  <XhTimerRoot countdown :start-ms="threeDays" auto-start>
    <XhTimerDisplay>
      <XhTimerItem unit="days" />
      <XhTimerSeparator>天</XhTimerSeparator>
      <XhTimerItem unit="hours" />
      <XhTimerSeparator>:</XhTimerSeparator>
      <XhTimerItem unit="minutes" />
      <XhTimerSeparator>:</XhTimerSeparator>
      <XhTimerItem unit="seconds" />
    </XhTimerDisplay>
  </XhTimerRoot>
</template>
```

```html
<xh-timer countdown start-ms="259200000" auto-start>
  <div data-xh-part="root">
    <div data-xh-part="display">
      <span data-xh-part="item" unit="days"></span>
      <span data-xh-part="separator">天</span>
      <span data-xh-part="item" unit="hours"></span>
      <span data-xh-part="separator">:</span>
      <span data-xh-part="item" unit="minutes"></span>
      <span data-xh-part="separator">:</span>
      <span data-xh-part="item" unit="seconds"></span>
    </div>
  </div>
</xh-timer>
```

### 三个尺寸档

size 只写在 root 上，数字大小与起停按钮的高度一起换档，子部件不重复标注

```vue
<script setup lang="ts">
import {
  XhTimerControl,
  XhTimerDisplay,
  XhTimerItem,
  XhTimerRoot,
  XhTimerSeparator,
} from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
const oneMinute = 60 * 1000;
</script>

<template>
  <div v-for="size in sizes" :key="size" style="margin-block-end: 12px">
    <XhTimerRoot :size="size" countdown :start-ms="oneMinute">
      <XhTimerDisplay>
        <XhTimerItem unit="minutes" />
        <XhTimerSeparator>:</XhTimerSeparator>
        <XhTimerItem unit="seconds" />
      </XhTimerDisplay>
      <XhTimerControl>起停</XhTimerControl>
    </XhTimerRoot>
  </div>
</template>
```

```html
<div style="margin-block-end: 12px">
  <xh-timer size="sm" countdown start-ms="60000">
    <div data-xh-part="root">
      <div data-xh-part="display">
        <span data-xh-part="item" unit="minutes"></span>
        <span data-xh-part="separator">:</span>
        <span data-xh-part="item" unit="seconds"></span>
      </div>
      <button data-xh-part="control">起停</button>
    </div>
  </xh-timer>
</div>

<div style="margin-block-end: 12px">
  <xh-timer size="md" countdown start-ms="60000">
    <div data-xh-part="root">
      <div data-xh-part="display">
        <span data-xh-part="item" unit="minutes"></span>
        <span data-xh-part="separator">:</span>
        <span data-xh-part="item" unit="seconds"></span>
      </div>
      <button data-xh-part="control">起停</button>
    </div>
  </xh-timer>
</div>

<div style="margin-block-end: 12px">
  <xh-timer size="lg" countdown start-ms="60000">
    <div data-xh-part="root">
      <div data-xh-part="display">
        <span data-xh-part="item" unit="minutes"></span>
        <span data-xh-part="separator">:</span>
        <span data-xh-part="item" unit="seconds"></span>
      </div>
      <button data-xh-part="control">起停</button>
    </div>
  </xh-timer>
</div>
```

### 每一拍与到期

tick 每过一个 interval 触发一次，complete 只在到达终点时触发一次；到期的一拍不再触发 tick

```vue
<script setup lang="ts">
import {
  XhTimerControl,
  XhTimerDisplay,
  XhTimerItem,
  XhTimerRoot,
  XhTimerSeparator,
} from "@xihan-ui/vue";
import { ref } from "vue";

const ticks = ref(0);
const done = ref(false);

// 按钮本身归组件管起停，这里只把计数一起归零
function restart(): void {
  ticks.value = 0;
  done.value = false;
}
</script>

<template>
  <XhTimerRoot
    countdown
    :start-ms="5000"
    @tick="ticks++"
    @complete="done = true"
  >
    <XhTimerDisplay>
      <XhTimerItem unit="minutes" />
      <XhTimerSeparator>:</XhTimerSeparator>
      <XhTimerItem unit="seconds" />
    </XhTimerDisplay>
    <XhTimerControl @click="restart">起停</XhTimerControl>
  </XhTimerRoot>

  <p>已经跳了 {{ ticks }} 拍{{ done ? "，到点了" : "" }}</p>
</template>
```

```html
<xh-timer id="timer-notify" countdown start-ms="5000">
  <div data-xh-part="root">
    <div data-xh-part="display">
      <span data-xh-part="item" unit="minutes"></span>
      <span data-xh-part="separator">:</span>
      <span data-xh-part="item" unit="seconds"></span>
    </div>
    <button data-xh-part="control" id="timer-notify-control">起停</button>
  </div>
</xh-timer>

<p id="timer-notify-log">已经跳了 0 拍</p>

<script type="module">
  const timer = document.getElementById("timer-notify");
  const log = document.getElementById("timer-notify-log");
  const control = document.getElementById("timer-notify-control");
  let ticks = 0;
  let done = false;

  const paint = () => {
    log.textContent = `已经跳了 ${ticks} 拍${done ? "，到点了" : ""}`;
  };

  timer.addEventListener("tick", () => {
    ticks += 1;
    paint();
  });

  timer.addEventListener("complete", () => {
    done = true;
    paint();
  });

  // 按钮本身归组件管起停，这里只把计数一起归零
  control.addEventListener("click", () => {
    ticks = 0;
    done = false;
    paint();
  });
</script>
```

### 受控通道

提供 value 与 active 后进入受控分支：value 改写即重新计时，active 切换为假停在当前剩余量、切换为真继续运行

```vue
<script setup lang="ts">
import { XhButton, XhTimerDisplay, XhTimerRoot } from "@xihan-ui/vue";
import { ref } from "vue";

// 两个时长交替：value 变了组件才重新计时，同一个值再写一遍不算换了一轮
const rounds = [5000, 8000];
const at = ref(0);
const running = ref(true);
const done = ref(false);

function restart(): void {
  at.value = (at.value + 1) % rounds.length;
  done.value = false;
  running.value = true;
}
</script>

<template>
  <XhTimerRoot
    :value="rounds[at]"
    :active="running"
    :precision="1"
    format="s.S"
    @complete="done = true"
  >
    <template #default="{ text }">
      <XhTimerDisplay>{{ text }}</XhTimerDisplay>
    </template>
  </XhTimerRoot>
  <span> 秒</span>

  <XhButton variant="outline" @click="running = !running">
    {{ running ? "暂停" : "继续" }}
  </XhButton>
  <XhButton variant="solid" @click="restart">重新计时（5 秒 / 8 秒 交替）</XhButton>
  <span v-if="done">到点了</span>
</template>
```

```html
<xh-timer id="timer-controlled" value="5000" precision="1" format="s.S">
  <div data-xh-part="root">
    <div data-xh-part="display">
      <span data-xh-part="item" unit="seconds"></span>
      <span data-xh-part="separator">.</span>
      <span data-xh-part="item" unit="milliseconds"></span>
    </div>
  </div>
</xh-timer>
<span> 秒</span>

<xh-button variant="outline">
  <button data-xh-part="root" id="timer-controlled-toggle">暂停</button>
</xh-button>

<xh-button variant="solid">
  <button data-xh-part="root" id="timer-controlled-restart">
    重新计时（5 秒 / 8 秒 交替）
  </button>
</xh-button>

<span id="timer-controlled-done" style="display: none">到点了</span>

<script type="module">
  // 两个时长交替：value 变了才重新计时，同一个值再写一遍不算换了一轮
  const rounds = [5000, 8000];
  const timer = document.getElementById("timer-controlled");
  const toggle = document.getElementById("timer-controlled-toggle");
  const done = document.getElementById("timer-controlled-done");
  let at = 0;
  let running = true;

  timer.addEventListener("complete", () => {
    done.style.display = "";
  });

  toggle.addEventListener("click", () => {
    running = !running;
    timer.active = running;
    toggle.textContent = running ? "暂停" : "继续";
  });

  document
    .getElementById("timer-controlled-restart")
    .addEventListener("click", () => {
      at = (at + 1) % rounds.length;
      timer.value = rounds[at];
      done.style.display = "none";
      running = true;
      timer.active = true;
      toggle.textContent = "暂停";
    });
</script>
```

## 设计指引

### 何时使用

- 秒表、答题计时、专注计时等需要用户自行控制起停的场景。
- 会议或直播的已进行时长。
- 需要倒计时且中途可暂停的限时任务。
- 验证码重发倒计时、限时活动、会话即将过期提醒等只倒数、不需要按钮的场景：使用受控通道，只提供剩余时长。

### 何时不用

- 展示一个时刻而不是一段时长时，使用[时间戳](./timestamp)。
- 表达任务完成到哪一步时，使用[进度条](./progress)。

### 特性

- 正计时或倒计时由 `countdown` 决定，起点 `startMs` 与终点 `targetMs` 两个方向共用。
- `start` / `pause` / `resume` / `reset` 四个动作齐全，`control` 部件把它们收成一个按钮，按当前状态自动切换语义。
- 时间只由单调时钟的两个时刻相减得出，不逐拍累加，因此频繁起停也不会累积偏差。
- `interval` 只决定数字的刷新频率；到点由另一个精确落在终点的定时器判定，终点不在整拍上也不会走过头。
- 每一段数字是一个 `item` 部件，`unit` 说明它是天、时、分、秒还是毫秒，排版完全由作者决定。
- 受控通道：提供 `value`（剩余毫秒）或 `active` 即进入受控分支。`value` 即起点，方向锁定为倒计时，终点锁定为 0，改写它即从新值重新计时；`active` 为假时停在当前值，为真时继续。受控时起停按钮不再改变状态（根上落 `data-controlled`），状态由这两个 prop 决定。
- `format` 把当前值格式化为字符串（`api.text`），`precision` 决定精确到哪一位：`0` 到秒、`3` 到毫秒，默认 `3` 即不量化。
- `live` 决定时间区的读屏播报档位，默认 `off`。

### 组合

- 与[按钮](./button)配合组成“开始 / 暂停 / 重来”一排控制。
- 与[进度条](./progress)并排，一个表示剩余时长，一个表示完成比例。
- 结束后用[警告提示](./alert)或[轻提示](./toast)告知用户下一步。

### 最佳实践

- 计时超过一天时自行增加 `days` 段：`hours` 满 24 会进位到天，只写时分秒会丢失整天数。
- 数字使用等宽字形，位数变化时分隔符才不会左右移动；皮肤已经如此处理，自定义排版时保留。
- 嵌在一句话内或放在其他数值槽中时把 `--xh-timer-digit-font-size` 写为 `inherit`，数字跟随上下文字号，不再使用展示档字号。
- 精确到秒的倒计时不开启高频播报，读屏用户会被持续打断。
- 每一段的数字始终由组件写入条目，作者只声明该段的单位；写在条目内的内容不会保留，下一拍会被新的数字覆盖。需要在数字旁加字（“时”“分”）时写进记号部件。
- 起停按钮的名称（读屏读出的）始终由组件按当前状态提供，切换语言使用 `translations`，不硬编码。按钮内显示的文字两个适配器不同，见下一条。
- 两个适配器的差别只有三处，编写标记前先核对：
  - 默认结构：Vue 的根组件不写内容时自动铺开“时:分:秒”；Web Components 侧元素不生成任何结构，root 与 display 缺一不可，每一段与记号都由作者编写。
  - 按钮内的文字：Vue 的起停按钮不写内容时填当前动作的名称（Start / Pause / Resume / Reset）；Web Components 侧的文字由作者编写（多为图标），元素只切换按钮的 `data-action` 与读屏名称。
  - 记号的默认值：Vue 的记号部件不写内容时是冒号；Web Components 侧记号内的文字一律由作者编写。
- Web Components 侧条目上的 `unit` 是作者的声明、不是元素写回的状态，改动它本身不会触发重新接线：停止时改动需要等下一次属性变更或启动后才生效（运行时每一拍都会重新接线）。
- 结束后要有明确的去处：归零重来，或跳转到下一步，不停留在 00:00。

### 反模式

- 用它显示当前时刻：它只处理时长，不处理日历与时区。
- 只提供终点而不提供起点做倒计时：起点默认为 0，倒计时一启动就到点，屏幕上始终是 00:00。倒计时长需要写进 `startMs`。
- 挂载后再改 `autoStart` 期望它启动：该 prop 只在挂载时读取一次，起停请使用动作或 `control`。
- 结束后没有任何反馈。
- 结束后停在 00:00，既不归零也不提供下一步。
- 页面切到后台后计时漂移却不校正：时间只由单调时钟的两个时刻相减，不自行按拍累加。

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
| `startMs` | `number` |  | 起始值毫秒，默认 0。正计时从它向上走，倒计时从它向下走。 |
| `targetMs` | `number` |  | 终点值毫秒。倒计时默认 0；正计时未提供时持续运行，没有终点也不会通知完成。 终点落在起点的反方向（倒计时提供了比起点更大的终点）时本轮长度为 0： 显示值停在起点上，一开始运行即到期。 |
| `countdown` | `boolean` |  | 倒计时，默认假。 |
| `value` | `number` |  | 受控剩余毫秒。提供后即进入受控通道：它就是起点，方向锁定为倒计时、终点锁定为 0， startMs / targetMs / countdown 三者不再参与；改写它即把累计清零并从新值重新计时。 |
| `active` | `boolean` |  | 受控开关，默认真。提供后即进入受控通道：变为假时停在当前累计值，变为真时从该处继续。 受控时起停按钮不再改变状态：状态由该 prop 决定。 |
| `autoStart` | `boolean` |  | 挂载即开始运行，默认假。它只在挂载时读取一次，之后修改不再生效。 |
| `interval` | `number` |  | 刷新间隔毫秒，默认 1000，下限一帧。 它只决定数字的跳动间隔；到期由另一个精确落在终点上的定时器判定，不受它影响。 |
| `format` | `string` |  | 文本模板，默认 `HH:mm:ss`。D 天、H 时、m 分、s 秒、S 毫秒，重复字母的个数即最少位数。 |
| `precision` | `number` |  | 取值粒度：0 到秒、1 到十分之一秒、2 到百分之一秒、3 到毫秒。默认 3，即不量化。 |
| `live` | `TimerLive` |  | 读屏播报档位，默认 off。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<TimerTranslations>` |  |  |
| `onTick` | `(details: TimerTickDetails) => void` |  | 每一拍通知一次。到期的一拍只发 onComplete。 |
| `onComplete` | `(details: TimerCompleteDetails) => void` |  | 到达终点时通知一次；中途被暂停或归零不通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `tick` | `TimerTickDetails` | 经过一拍；detail 为 `{ value: number, elapsed: number }` |
| `complete` | `TimerCompleteDetails` | 到达终点；detail 为 `{ value: number, elapsed: number }` |

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

**事件**：`RUN.START` · `RUN.PAUSE` · `RUN.RESUME` · `RUN.RESET` · `CLOCK.TICK` · `CLOCK.SETTLE` · `CLOCK.SYNC` · `PRESS.START` · `PRESS.END`

**判据**：`isSettled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `phase` | `TimerPhase` |  |
| `value` | `number` | 当前应显示的毫秒，已夹在起点与终点之间并按 precision 量化。 |
| `text` | `string` | 按模板格式化的文本，即不自行排列各段时应显示的文字。 |
| `controlled` | `boolean` | 是否使用受控通道：提供了 value 或 active 即是，此时起停按钮不改变状态。 |
| `elapsed` | `number` | 累计经过的毫秒，与方向和起始值无关。 |
| `running` | `boolean` |  |
| `paused` | `boolean` |  |
| `completed` | `boolean` |  |
| `countdown` | `boolean` |  |
| `segments` | `TimerSegments` | 显示值拆开的五段。 |
| `segmentText` | `(unit: TimerUnit) => string` | 某一段补零后的字面：天不补零，时分秒两位，毫秒三位。 |
| `controlAction` | `TimerControlAction` | 起停按钮本次的动作。 |
| `controlLabel` | `string` | 起停按钮的读屏名字，也是按钮内未写内容时应显示的文字。 |
| `start` | `() => void` | 从头开始运行。 |
| `pause` | `() => void` |  |
| `resume` | `() => void` |  |
| `reset` | `() => void` | 归零并停止。 |
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
| `Enter` / `Space` | held on control | 按住期间 control 投影 data-pressed，与指针 :active 同一副按压面（text 档定尺按钮，按下缩放并换底）；抬起或失焦撤下。按钮没有禁用态，四段状态下都接，按住途中起停翻转按压面不丢 |

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

- 时间区带有整段时间的读屏名称，其中的数字与记号对读屏隐藏。
- 内建名称始终按“时 分 秒”读出（天数大于 0 时前面再加天）。屏幕上只放了其中几段（例如只有分和秒）时会多读一段，请用 `translations.time` 按实际段数提供名称。
- 内建名称是英文，切换语言同样使用 `translations.time`。
- 默认不播报。需要播报的场景（会话到期提醒等）把 `live` 设为 `polite` 或 `assertive`，或在外层另起一个 live 区域，只在关键节点播报一句：每秒变化的数字按 polite 播报，一分钟就是六十次打断。

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
| `control` | `data-pressed` | ''（条件成立时才出现） |
| `control` | `data-xh-action-control` | '' |
| `control` | `data-xh-action-display` | 'always' |
| `control` | `data-xh-action-profile` | 'text' |
| `control` | `data-xh-action-size` | props.size |
| `control` | `data-xh-action-variant` | 'outline' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-timer-completed-fg` | `display` | `color` | `state=completed` | `--xh-fg-muted` | timer 的 display 部件 color 覆盖槽。 |
| `--xh-timer-control-bg` | `control` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | timer 的 control 部件 background-color 覆盖槽。 |
| `--xh-timer-control-bg-active` | `control` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | timer 的 control 部件 background-color 覆盖槽。 |
| `--xh-timer-control-bg-disabled` | `control` | `background-color` | `disabled` | `--xh-_action-variant-bg-disabled` | timer 的 control 部件 background-color 覆盖槽。 |
| `--xh-timer-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | timer 的 control 部件 background-color 覆盖槽。 |
| `--xh-timer-control-border` | `control` | `border` | `default` | `--xh-_action-variant-border-rest` | timer 的 control 部件 border 覆盖槽。 |
| `--xh-timer-control-border-disabled` | `control` | `border-color` | `disabled` | `--xh-_action-variant-border-disabled` | timer 的 control 部件 border-color 覆盖槽。 |
| `--xh-timer-control-border-focus` | `control` | `border-color` | `focus-visible` | `--xh-_action-variant-border-focus-visible` | timer 的 control 部件 border-color 覆盖槽。 |
| `--xh-timer-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed` | timer 的 control 部件 border-color 覆盖槽。 |
| `--xh-timer-control-fg` | `control` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | timer 的 control 部件 color 覆盖槽。 |
| `--xh-timer-control-gap` | `control` | `gap` | `default` | `--xh-_action-profile-gap` | timer 的 control 部件 gap 覆盖槽。 |
| `--xh-timer-control-h` | `control` | `block-size` | `default` | `--xh-_action-profile-visual-size` | timer 的 control 部件 block-size 覆盖槽。 |
| `--xh-timer-control-px` | `control` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | timer 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-timer-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | timer 的 control 部件 border-radius 覆盖槽。 |
| `--xh-timer-control-shadow-active` | `control` | `box-shadow` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `none` | timer 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-timer-control-shadow-hover` | `control` | `box-shadow` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `none` | timer 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-timer-digit-font-size` | `display` | `font-size` | `default` | `--xh-_timer-digit-size` | timer 的 display 部件 font-size 覆盖槽。 |
| `--xh-timer-display-fg` | `display` | `color` | `default` | `--xh-fg-default` | timer 的 display 部件 color 覆盖槽。 |
| `--xh-timer-fg` | `root` | `color` | `default` | `--xh-fg-default` | timer 的 root 部件 color 覆盖槽。 |
| `--xh-timer-gap` | `root` | `gap` | `default` | `--xh-_timer-gap` | timer 的 root 部件 gap 覆盖槽。 |
| `--xh-timer-icon-size` | `control` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | timer 的 control 部件 --xh-icon-size 覆盖槽。 |
| `--xh-timer-item-fg` | `item` | `color` | `default` | `inherit` | timer 的 item 部件 color 覆盖槽。 |
| `--xh-timer-separator-fg` | `separator` | `color` | `default` | `--xh-fg-subtle` | timer 的 separator 部件 color 覆盖槽。 |
| `--xh-timer-separator-px` | `separator` | `padding-inline` | `default` | `--xh-space-0_5` | timer 的 separator 部件 padding-inline 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 时间区的排列方向固定为从左到右，`<html dir="rtl">` 下时分秒不会倒序排列，时间串的读序在两个方向相同。
- 起停按钮相对时间区的位置，以及整个组件在页面内的排布，照常跟随文字方向。
