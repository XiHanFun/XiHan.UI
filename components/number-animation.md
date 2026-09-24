来源：https://ui.docs.xihanfun.com/components/number-animation

# NumberAnimation 数值动画

数字从一个值滚动到另一个值。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/number-animation" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/number-animation.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/number-animation" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/number-animation" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/number-animation.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

挂载即从 from 变化到 to，三个尺寸档只改变字号；不写 size 即跟随上下文的字号

```vue
<script setup lang="ts">
import { XhNumberAnimation } from "@xihan-ui/vue";
</script>

<template>
  <XhNumberAnimation :from="0" :to="1024" size="sm" />
  <XhNumberAnimation :from="0" :to="12480" size="md" />
  <XhNumberAnimation :from="0" :to="98600" size="lg" tone="brand" />
</template>
```

```html
<xh-number-animation from="0" to="1024" size="sm">
  <span data-xh-part="root"></span>
</xh-number-animation>

<xh-number-animation from="0" to="12480" size="md">
  <span data-xh-part="root"></span>
</xh-number-animation>

<xh-number-animation from="0" to="98600" size="lg" tone="brand">
  <span data-xh-part="root"></span>
</xh-number-animation>
```

## 组件结构

加粗的是必需部件。

`data-scope="number-animation"`：**`root`**

## 示例

### 小数位与千位分隔

precision 决定小数位，separator 决定分隔符；不提供分隔符即不分隔，使用什么符号是地区习惯

```vue
<script setup lang="ts">
import { XhNumberAnimation } from "@xihan-ui/vue";
</script>

<template>
  <p>整数、不分隔：<XhNumberAnimation :from="0" :to="1234567" /></p>
  <p>整数、逗号分隔：<XhNumberAnimation :from="0" :to="1234567" separator="," /></p>
  <p>
    两位小数、空格分隔：
    <XhNumberAnimation :from="0" :to="1234567.89" :precision="2" separator=" " />
  </p>
  <p>
    负数也认：<XhNumberAnimation :from="0" :to="-8642.5" :precision="1" separator="," />
  </p>
</template>
```

```html
<p>
  整数、不分隔：
  <xh-number-animation from="0" to="1234567">
    <span data-xh-part="root"></span>
  </xh-number-animation>
</p>
<p>
  整数、逗号分隔：
  <xh-number-animation from="0" to="1234567" separator=",">
    <span data-xh-part="root"></span>
  </xh-number-animation>
</p>
<p>
  两位小数、空格分隔：
  <xh-number-animation from="0" to="1234567.89" precision="2" separator=" ">
    <span data-xh-part="root"></span>
  </xh-number-animation>
</p>
<p>
  负数也认：
  <xh-number-animation from="0" to="-8642.5" precision="1" separator=",">
    <span data-xh-part="root"></span>
  </xh-number-animation>
</p>
```

### 缓动与时长

duration 决定时长，easing 决定快慢的分配；同一段距离四档并排运行，差别一目了然

```vue
<script setup lang="ts">
import { XhButton, XhNumberAnimation } from "@xihan-ui/vue";
import { ref } from "vue";

const easings = ["linear", "easeIn", "easeOut", "easeInOut"] as const;

// 终点在两个数之间来回换，每换一次四档都从当前数字重新走一遍
const to = ref(10000);

function toggle(): void {
  to.value = to.value === 10000 ? 0 : 10000;
}
</script>

<template>
  <p v-for="easing in easings" :key="easing">
    {{ easing }}：
    <XhNumberAnimation :to="to" :duration="2000" :easing="easing" separator="," />
  </p>
  <XhButton variant="outline" @click="toggle">换个终点再跑一遍</XhButton>
</template>
```

```html
<div id="number-animation-easing">
  <p>
    linear：
    <xh-number-animation to="10000" duration="2000" easing="linear" separator=",">
      <span data-xh-part="root"></span>
    </xh-number-animation>
  </p>
  <p>
    easeIn：
    <xh-number-animation to="10000" duration="2000" easing="easeIn" separator=",">
      <span data-xh-part="root"></span>
    </xh-number-animation>
  </p>
  <p>
    easeOut：
    <xh-number-animation to="10000" duration="2000" easing="easeOut" separator=",">
      <span data-xh-part="root"></span>
    </xh-number-animation>
  </p>
  <p>
    easeInOut：
    <xh-number-animation
      to="10000"
      duration="2000"
      easing="easeInOut"
      separator=","
    >
      <span data-xh-part="root"></span>
    </xh-number-animation>
  </p>

  <xh-button variant="outline">
    <button data-xh-part="root" id="number-animation-easing-toggle">
      换个终点再跑一遍
    </button>
  </xh-button>
</div>

<script type="module">
  // 终点在两个数之间来回换，每换一次四档都从当前数字重新走一遍
  const stage = document.getElementById("number-animation-easing");
  const numbers = stage.querySelectorAll("xh-number-animation");
  const toggle = stage.querySelector("#number-animation-easing-toggle");
  toggle.addEventListener("click", () => {
    for (const number of numbers) number.to = number.to === 10000 ? 0 : 10000;
  });
</script>
```

### 跟随数据变化

修改 to 即从当前数字继续变化到新终点，结束后再次修改照样重新运行；active 切换为假即停在当前值

```vue
<script setup lang="ts">
import { XhButton, XhNumberAnimation } from "@xihan-ui/vue";
import { ref } from "vue";

const readings = [3600, 8250, 4180, 12040];
const at = ref(0);
const running = ref(true);
const settled = ref<number | null>(null);

function next(): void {
  at.value = (at.value + 1) % readings.length;
}
</script>

<template>
  <XhNumberAnimation
    :to="readings[at]"
    :duration="1200"
    :active="running"
    easing="easeOut"
    separator=","
    size="lg"
    @complete="settled = $event.value"
  />

  <XhButton variant="solid" @click="next">换一组读数</XhButton>
  <XhButton variant="outline" @click="running = !running">
    {{ running ? "暂停" : "继续" }}
  </XhButton>
  <span v-if="settled !== null">上一次停在：{{ settled }}</span>
</template>
```

```html
<div id="number-animation-follow">
  <xh-number-animation
    id="number-animation-follow-value"
    to="3600"
    duration="1200"
    easing="easeOut"
    separator=","
    size="lg"
  >
    <span data-xh-part="root"></span>
  </xh-number-animation>

  <xh-button variant="solid">
    <button data-xh-part="root" id="number-animation-follow-next">
      换一组读数
    </button>
  </xh-button>
  <xh-button variant="outline">
    <button data-xh-part="root" id="number-animation-follow-run">暂停</button>
  </xh-button>
  <span id="number-animation-follow-settled"></span>
</div>

<script type="module">
  // 一组读数轮着换，终点每换一次数字就从当前值接着走
  const readings = [3600, 8250, 4180, 12040];
  const stage = document.getElementById("number-animation-follow");
  const number = stage.querySelector("#number-animation-follow-value");
  const next = stage.querySelector("#number-animation-follow-next");
  const run = stage.querySelector("#number-animation-follow-run");
  const settled = stage.querySelector("#number-animation-follow-settled");

  let at = 0;
  let running = true;

  next.addEventListener("click", () => {
    at = (at + 1) % readings.length;
    number.to = readings[at];
  });

  // active 翻假就停在当前值，翻真接着走完
  run.addEventListener("click", () => {
    running = !running;
    number.active = running;
    run.textContent = running ? "暂停" : "继续";
  });

  number.addEventListener("complete", (event) => {
    settled.textContent = `上一次停在：${event.detail.value}`;
  });
</script>
```

## 设计指引

### 何时使用

- 仪表盘上的关键指标首次出现时，用滚动强调变化。

### 何时不用

- 数值频繁变化时，每次都滚动会使用户读不到稳定值。
- 精确的金额或编号，用户需要读取而不是感知趋势。

### 特性

- `precision` 小数位、`separator` 千位分隔。
- `easing` 与 `duration` 决定滚动的节奏。
- `live` 决定读屏播报方式，通常只播报终值。

### 组合

- 放入[统计数值](./statistic)的值位。

### 最佳实践

- 时长控制在一秒以内，更长会变成等待。
- 读屏只播报终值，不读出每一帧。

### 反模式

- 给实时刷新的数字加滚动动画。
- 系统开启减弱动效时仍然滚动。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-number-animation>` |
| Vue 组件 | `XhNumberAnimation` |
| 状态机 | `numberAnimationMachine` |
| 皮肤 | `@xihan-ui/styles/number-animation.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `from` | `number` |  | 起点，默认 0。改写它会把显示值立即落到新起点，并从那里重新运行本轮。 |
| `to` | `number` |  | 终点，默认 0。改写它从当前显示值继续走向新终点，不跳回起点。 |
| `duration` | `number` |  | 时长毫秒，默认 1000；&lt;=0 即一步到位。 |
| `easing` | `NumberAnimationEasing` |  | 缓动：曲线名（linear / standard / easeIn / easeOut / easeInOut …）或 cubic-bezier 串，默认线性。 |
| `precision` | `number` |  | 小数位，默认 0。夹进 [0, 20]。 |
| `separator` | `string` |  | 千位分隔符，默认不分隔。 |
| `active` | `boolean` |  | 是否运行，默认 true。变为假即停在当前值，变为真从当前值继续走向终点。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，只写为 root 的 data-size。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，只写为 root 的 data-tone。 |
| `live` | `NumberAnimationLive` |  | 读屏播报档位，默认 off。 |
| `onComplete` | `(details: NumberAnimationCompleteDetails) => void` |  | 到达终点时通知一次。中途被停止不通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `complete` | `NumberAnimationCompleteDetails` | 到达终点；detail 为 `{ value: number }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhNumberAnimation` | `default` | `NumberAnimationSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhNumberAnimation` | `children` | `SlotChildren<NumberAnimationSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'idle' \| 'running' |

以下名称仅用于内部状态机。

**状态**：`idle` · `running`

**事件**：`RUN.START` · `RUN.STOP` · `RUN.SYNC` · `FRAME`

**判据**：`isSettled` · `isActive`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `phase` | `NumberAnimationPhase` |  |
| `value` | `number` | 当前数值（未格式化）。 |
| `text` | `string` | 当前数值按 precision 与 separator 格式化的文本，即根中应显示的文字。 |
| `running` | `boolean` | 是否仍在运行。 |
| `getRootProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/TR/wai-aria-1.2/#status)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-live` | props.live |
| `root` | `role` | 'status' |

## 样式参考

### 皮肤

`@xihan-ui/styles/number-animation.css` 使用 `[data-scope="number-animation"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'idle' \| 'running' |
| `root` | `data-tone` | props.tone |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-number-animation-fg` | `root` | `color` | `default` | `--xh-_tone-fg` | number-animation 的 root 部件 color 覆盖槽。 |
| `--xh-number-animation-font-size` | `root` | `font-size` | `default` | `--xh-_number-animation-size` | number-animation 的 root 部件 font-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

皮肤里没有过渡也没有关键帧，本组件的动效不在皮肤里：值由内核逐帧算出（`frameLoop` · `isTweenDone` · `tweenValueAt`），皮肤里看不到这段；内核读系统的减弱动效偏好，据此决定要不要动。时长与缓动仍读[动效令牌](../guide/motion)。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。
