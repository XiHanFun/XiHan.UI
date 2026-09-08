来源：https://ui.docs.xihanfun.com/components/number-animation

# 数值动画 `number-animation`

数字从一个值滚动到另一个值。

## 何时使用

- 仪表盘上的关键指标首次出现时，用滚动强调它在变化。

## 何时不用

- 数值频繁变化：每次都滚一遍，用户永远读不到稳定值。
- 是精确的金额或编号，用户要读取而不是感知趋势。

## 特性

- `precision` 小数位、`separator` 千位分隔。
- `easing` 与 `duration` 决定滚动的节奏。
- `live` 决定读屏播报方式——通常应该只播报终值。

## 示例

### 基础用法

挂载即从 from 走到 to，三个尺寸档只改字号；不写 size 就跟着上下文的字号走

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

### 小数位与千位分隔

precision 定小数位，separator 定分隔符；不给分隔符就不分隔，插什么符号是地区习惯

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

duration 定跑多久，easing 定快慢怎么分配；同一段距离四档并排跑，差别一眼可见

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

### 跟着数据走

改 to 就从当前数字接着走向新终点，跑完停下之后再改也照样重新跑；active 翻假即停在当前值

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

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-number-animation>` |
| Vue 组件 | `XhNumberAnimation` |
| 状态机 | `numberAnimationMachine` |
| 皮肤 | `@xihan-ui/styles/number-animation.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="number-animation"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `from` | `number` |  | 起点，缺省 0。改写它会把显示值当场落到新起点，并从那里重跑这一轮。 |
| `to` | `number` |  | 终点，缺省 0。改写它从当前显示值接着走向新终点，不跳回起点。 |
| `duration` | `number` |  | 时长毫秒，缺省 1000；&lt;=0 即一步到位。 |
| `easing` | `NumberAnimationEasing` |  | 缓动：曲线名（linear / standard / easeIn / easeOut / easeInOut …）或 cubic-bezier 串，缺省线性。 |
| `precision` | `number` |  | 小数位，缺省 0。夹进 [0, 20]。 |
| `separator` | `string` |  | 千位分隔符，缺省不分隔。 |
| `active` | `boolean` |  | 是否在跑，缺省 true。翻假即停在当前值，翻真从当前值继续走向终点。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，只落成 root 的 data-size。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，只落成 root 的 data-tone。 |
| `live` | `NumberAnimationLive` |  | 读屏播报档位，缺省 off。 |
| `onComplete` | `(details: NumberAnimationCompleteDetails) => void` |  | 走到终点时通知一次。中途被停掉不通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `complete` | `NumberAnimationCompleteDetails` | 走到终点；detail 为 `{ value: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhNumberAnimation` | `default` | `NumberAnimationSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'idle' \| 'running' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `running`

**事件**：`RUN.START` · `RUN.STOP` · `RUN.SYNC` · `FRAME`

**判据**：`isSettled` · `isActive`

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `phase` | `NumberAnimationPhase` |  |
| `value` | `number` | 当前数值（未格式化）。 |
| `text` | `string` | 当前数值按 precision 与 separator 铺好的文本，也就是根里该显示的字。 |
| `running` | `boolean` | 是否还在跑。 |
| `getRootProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/TR/wai-aria-1.2/#status)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-live` | props.live |
| `root` | `role` | 'status' |

## 样式

默认皮肤 `@xihan-ui/styles/number-animation.css` 按部件选择：`[data-scope="number-animation"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'idle' \| 'running' |
| `root` | `data-tone` | props.tone |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-number-animation-fg` · `--xh-number-animation-font-size`

## 动效

皮肤里没有过渡也没有关键帧，本组件的动效不在皮肤里：值由内核逐帧算出（`frameLoop` · `isTweenDone` · `tweenValueAt`），皮肤里看不到这段；内核读系统的减弱动效偏好，据此决定要不要动。时长与缓动仍读[动效令牌](../guide/motion)。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 组合

- 放进[统计数值](./statistic)的值位。

## 最佳实践

- 时长控制在一秒以内，再长就成了等待。
- 读屏只播报终值，别把每一帧都念出来。

## 反模式

- 给实时刷新的数字加滚动动画。
- 系统开启减弱动效时仍然滚动。
