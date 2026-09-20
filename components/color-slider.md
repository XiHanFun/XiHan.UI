来源：https://ui.docs.xihanfun.com/components/color-slider

# ColorSlider 颜色滑块 `alpha`

只调整颜色某一个通道的滑杆：色相、饱和度、明度、透明度，或红、绿、蓝。值是完整的颜色串，轨道显示该通道从最小值到最大值的颜色变化，拇指填充当前值对应的颜色。多条并排即可组成自定义的调色面板；[颜色选择器](./color-picker)浮层内的色相带与透明度带就是它。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/color-slider" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/color-slider.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/color-slider" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/color-slider" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/color-slider.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一条滑杆只调节颜色的一个通道，默认是色相：值是整个颜色串，轨道绘制的是该通道从头到尾的颜色

```vue
<script setup lang="ts">
import {
  XhColorSliderControl,
  XhColorSliderHiddenInput,
  XhColorSliderLabel,
  XhColorSliderRoot,
  XhColorSliderThumb,
  XhColorSliderTrack,
  XhColorSwatch,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("#3b82f6");
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 320px">
    <XhColorSliderRoot v-model:value="value" name="accent">
      <XhColorSliderLabel>色相</XhColorSliderLabel>
      <XhColorSliderControl>
        <XhColorSliderTrack />
        <XhColorSliderThumb>
          <XhColorSliderHiddenInput />
        </XhColorSliderThumb>
      </XhColorSliderControl>
    </XhColorSliderRoot>
    <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px">
      <XhColorSwatch :value="value" />
      <code>{{ value }}</code>
    </span>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 320px">
  <xh-color-slider id="color-slider-basic" default-value="#3b82f6" name="accent">
    <div data-xh-part="root">
      <label data-xh-part="label">色相</label>
      <div data-xh-part="control">
        <div data-xh-part="track"></div>
        <div data-xh-part="thumb">
          <input data-xh-part="hidden-input" />
        </div>
      </div>
    </div>
  </xh-color-slider>
  <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px">
    <xh-color-swatch id="color-slider-basic-swatch" value="#3b82f6"><span data-xh-part="root"></span></xh-color-swatch>
    <code id="color-slider-basic-value">#3b82f6</code>
  </span>
</div>

<script type="module">
  // 色块与文字跟着值走
  const slider = document.getElementById("color-slider-basic");
  const swatch = document.getElementById("color-slider-basic-swatch");
  const readout = document.getElementById("color-slider-basic-value");
  slider.addEventListener("value-change", (event) => {
    swatch.value = event.detail.value;
    readout.textContent = event.detail.value;
  });
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="color-slider"`：`root` · `label` · **`control`** · **`track`** · **`thumb`** · `value-text` · `hidden-input`

## 示例

### 通道并排

几条共用同一个值、各调节自己的通道；开启 alpha 使调节色相时透明度不丢失，即组成一个 HSV 调色面板

```vue
<script setup lang="ts">
import type { ColorChannel } from "@xihan-ui/headless";
import {
  XhColorSliderControl,
  XhColorSliderLabel,
  XhColorSliderRoot,
  XhColorSliderThumb,
  XhColorSliderTrack,
  XhColorSliderValueText,
  XhColorSwatch,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("#3b82f680");
const channels: { channel: ColorChannel; label: string }[] = [
  { channel: "hue", label: "色相" },
  { channel: "saturation", label: "饱和度" },
  { channel: "brightness", label: "明度" },
  { channel: "alpha", label: "透明度" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 320px">
    <!-- 四条共用一个值；alpha 显式开着，推色相 / 饱和度 / 明度时透明度那一位才留得住 -->
    <XhColorSliderRoot
      v-for="item in channels"
      :key="item.channel"
      v-model:value="value"
      :channel="item.channel"
      alpha
      size="sm"
    >
      <XhColorSliderLabel>{{ item.label }}</XhColorSliderLabel>
      <XhColorSliderControl>
        <XhColorSliderTrack />
        <XhColorSliderThumb>
          <XhColorSliderValueText />
        </XhColorSliderThumb>
      </XhColorSliderControl>
    </XhColorSliderRoot>
    <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px">
      <XhColorSwatch :value="value" size="lg" />
      <code>{{ value }}</code>
    </span>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 320px">
  <!-- 四条共用一个值；alpha 显式开着，推色相 / 饱和度 / 明度时透明度那一位才留得住 -->
  <xh-color-slider class="color-slider-channels" channel="hue" alpha size="sm">
    <div data-xh-part="root">
      <label data-xh-part="label">色相</label>
      <div data-xh-part="control">
        <div data-xh-part="track"></div>
        <div data-xh-part="thumb"><span data-xh-part="value-text"></span></div>
      </div>
    </div>
  </xh-color-slider>
  <xh-color-slider class="color-slider-channels" channel="saturation" alpha size="sm">
    <div data-xh-part="root">
      <label data-xh-part="label">饱和度</label>
      <div data-xh-part="control">
        <div data-xh-part="track"></div>
        <div data-xh-part="thumb"><span data-xh-part="value-text"></span></div>
      </div>
    </div>
  </xh-color-slider>
  <xh-color-slider class="color-slider-channels" channel="brightness" alpha size="sm">
    <div data-xh-part="root">
      <label data-xh-part="label">明度</label>
      <div data-xh-part="control">
        <div data-xh-part="track"></div>
        <div data-xh-part="thumb"><span data-xh-part="value-text"></span></div>
      </div>
    </div>
  </xh-color-slider>
  <xh-color-slider class="color-slider-channels" channel="alpha" alpha size="sm">
    <div data-xh-part="root">
      <label data-xh-part="label">透明度</label>
      <div data-xh-part="control">
        <div data-xh-part="track"></div>
        <div data-xh-part="thumb"><span data-xh-part="value-text"></span></div>
      </div>
    </div>
  </xh-color-slider>
  <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px">
    <xh-color-swatch id="color-slider-channels-swatch" value="#3b82f680" size="lg"><span data-xh-part="root"></span></xh-color-swatch>
    <code id="color-slider-channels-value">#3b82f680</code>
  </span>
</div>

<script type="module">
  // 值由这段脚本持有，四条滑杆都受控于它：一条推动，其余三条跟着换轨道
  const sliders = [...document.querySelectorAll(".color-slider-channels")];
  const swatch = document.getElementById("color-slider-channels-swatch");
  const readout = document.getElementById("color-slider-channels-value");
  function apply(next) {
    for (const slider of sliders) slider.value = next;
    swatch.value = next;
    readout.textContent = next;
  }
  apply("#3b82f680");
  for (const slider of sliders)
    slider.addEventListener("value-change", (event) => apply(event.detail.value));
</script>
```

### 红绿蓝与写法

调节 RGB 三通道使用 0-255；format 决定写回的写法，这里按 rgba() 输出

```vue
<script setup lang="ts">
import type { ColorChannel } from "@xihan-ui/headless";
import {
  XhColorSliderControl,
  XhColorSliderLabel,
  XhColorSliderRoot,
  XhColorSliderThumb,
  XhColorSliderTrack,
  XhColorSliderValueText,
  XhColorSwatch,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("rgba(59, 130, 246, 1)");
const channels: { channel: ColorChannel; label: string }[] = [
  { channel: "red", label: "红" },
  { channel: "green", label: "绿" },
  { channel: "blue", label: "蓝" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 320px">
    <XhColorSliderRoot
      v-for="item in channels"
      :key="item.channel"
      v-model:value="value"
      :channel="item.channel"
      format="rgba"
      size="sm"
    >
      <XhColorSliderLabel>{{ item.label }}</XhColorSliderLabel>
      <XhColorSliderControl>
        <XhColorSliderTrack />
        <XhColorSliderThumb>
          <XhColorSliderValueText />
        </XhColorSliderThumb>
      </XhColorSliderControl>
    </XhColorSliderRoot>
    <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px">
      <XhColorSwatch :value="value" size="lg" />
      <code>{{ value }}</code>
    </span>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 320px">
  <xh-color-slider class="color-slider-rgb" channel="red" format="rgba" size="sm">
    <div data-xh-part="root">
      <label data-xh-part="label">红</label>
      <div data-xh-part="control">
        <div data-xh-part="track"></div>
        <div data-xh-part="thumb"><span data-xh-part="value-text"></span></div>
      </div>
    </div>
  </xh-color-slider>
  <xh-color-slider class="color-slider-rgb" channel="green" format="rgba" size="sm">
    <div data-xh-part="root">
      <label data-xh-part="label">绿</label>
      <div data-xh-part="control">
        <div data-xh-part="track"></div>
        <div data-xh-part="thumb"><span data-xh-part="value-text"></span></div>
      </div>
    </div>
  </xh-color-slider>
  <xh-color-slider class="color-slider-rgb" channel="blue" format="rgba" size="sm">
    <div data-xh-part="root">
      <label data-xh-part="label">蓝</label>
      <div data-xh-part="control">
        <div data-xh-part="track"></div>
        <div data-xh-part="thumb"><span data-xh-part="value-text"></span></div>
      </div>
    </div>
  </xh-color-slider>
  <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px">
    <xh-color-swatch id="color-slider-rgb-swatch" value="rgba(59, 130, 246, 1)" size="lg"><span data-xh-part="root"></span></xh-color-swatch>
    <code id="color-slider-rgb-value">rgba(59, 130, 246, 1)</code>
  </span>
</div>

<script type="module">
  const sliders = [...document.querySelectorAll(".color-slider-rgb")];
  const swatch = document.getElementById("color-slider-rgb-swatch");
  const readout = document.getElementById("color-slider-rgb-value");
  function apply(next) {
    for (const slider of sliders) slider.value = next;
    swatch.value = next;
    readout.textContent = next;
  }
  apply("rgba(59, 130, 246, 1)");
  for (const slider of sliders)
    slider.addEventListener("value-change", (event) => apply(event.detail.value));
</script>
```

### 竖直与状态

orientation 竖排时渐变自下而上；禁用时标签换禁用前景、颜色带压暗，只读保留 Tab 位但不可调节

```vue
<script setup lang="ts">
import {
  XhColorSliderControl,
  XhColorSliderLabel,
  XhColorSliderRoot,
  XhColorSliderThumb,
  XhColorSliderTrack,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: flex-start; gap: 32px">
    <XhColorSliderRoot default-value="#f59e0b" channel="brightness" orientation="vertical">
      <XhColorSliderLabel>明度</XhColorSliderLabel>
      <XhColorSliderControl>
        <XhColorSliderTrack />
        <XhColorSliderThumb />
      </XhColorSliderControl>
    </XhColorSliderRoot>
    <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 240px">
      <XhColorSliderRoot default-value="#f59e0b" disabled>
        <XhColorSliderLabel>禁用</XhColorSliderLabel>
        <XhColorSliderControl>
          <XhColorSliderTrack />
          <XhColorSliderThumb />
        </XhColorSliderControl>
      </XhColorSliderRoot>
      <XhColorSliderRoot default-value="#f59e0b" read-only>
        <XhColorSliderLabel>只读</XhColorSliderLabel>
        <XhColorSliderControl>
          <XhColorSliderTrack />
          <XhColorSliderThumb />
        </XhColorSliderControl>
      </XhColorSliderRoot>
      <XhColorSliderRoot default-value="#f59e0b" invalid size="lg">
        <XhColorSliderLabel>无效（大号）</XhColorSliderLabel>
        <XhColorSliderControl>
          <XhColorSliderTrack />
          <XhColorSliderThumb />
        </XhColorSliderControl>
      </XhColorSliderRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; align-items: flex-start; gap: 32px">
  <xh-color-slider default-value="#f59e0b" channel="brightness" orientation="vertical">
    <div data-xh-part="root">
      <label data-xh-part="label">明度</label>
      <div data-xh-part="control">
        <div data-xh-part="track"></div>
        <div data-xh-part="thumb"></div>
      </div>
    </div>
  </xh-color-slider>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 240px">
    <xh-color-slider default-value="#f59e0b" disabled>
      <div data-xh-part="root">
        <label data-xh-part="label">禁用</label>
        <div data-xh-part="control">
          <div data-xh-part="track"></div>
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-color-slider>
    <xh-color-slider default-value="#f59e0b" read-only>
      <div data-xh-part="root">
        <label data-xh-part="label">只读</label>
        <div data-xh-part="control">
          <div data-xh-part="track"></div>
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-color-slider>
    <xh-color-slider default-value="#f59e0b" invalid size="lg">
      <div data-xh-part="root">
        <label data-xh-part="label">无效（大号）</label>
        <div data-xh-part="control">
          <div data-xh-part="track"></div>
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-color-slider>
  </div>
</div>
```

## 设计指引

### 何时使用

- 用户只需要调整颜色的一个分量：透明度、明暗、色相。
- 多条并排，按 HSV 或 RGB 组成内嵌的调色面板，不使用浮层。
- 需要在页面上常驻、随时可拖动的颜色调节。

### 何时不用

- 用户需要在色域中自由取色时，使用[颜色选择器](./color-picker)，它带二维取色区。
- 只从几个固定颜色中选一个时，使用[颜色色块选择器](./color-swatch-picker)。
- 调整的是普通数值时，使用[滑块](./slider)。

### 特性

- `channel` 七选一：`hue`（0-360）、`saturation` / `brightness` / `alpha`（0-100）、`red` / `green` / `blue`（0-255）；步长 1，PageUp / PageDown 走 10。
- 值始终是完整颜色串，`format` 决定写法（hex / rgba / hsla）；`alpha` 决定串中是否带透明度，默认调整透明度通道时带、其余不带。与透明度滑块并排时显式开启它，否则调整色相会把透明度归 1。
- 轨道渐变由连接层按当前颜色实时计算：其余分量不变，只让本通道从 min 走到 max；透明度通道从全透明走到实色，底部垫棋盘格。
- 灰度与纯黑处色相无定义，把明度调到 0 再拉回时色相由锚点保持，不塌为 0。
- 拖动、键盘、RTL 方向与竖直排布全部取自内嵌的[滑块](./slider)；`onValueChange` 在拖动中连续发出，`onValueChangeEnd` 在松手时只发一次。
- 拇指按未取整的工作色定位，比按整格计算更贴近当前颜色；`aria-valuetext` 带单位播报。
- 尺寸 sm / md / lg 改变拇指直径与颜色带厚度；禁用时标签换到禁用前景、颜色带与拇指压暗且拇指不再抬起，只读保留 Tab 位但不可调整，`invalid` 只改变拇指描边，保留当前颜色的面。

### 组合

- 放入[表单字段](./field)：标签、说明与错误由字段渲染并经 aria-describedby 关联到拇指，禁用 / 只读 / 无效三轴随字段下发。
- 与[颜色色块](./color-swatch)并排：色块显示完整颜色，滑块调整其中一个通道。

### 最佳实践

- 多条并排时共用同一个值，每条只改自己的通道；开启 `alpha` 让透明度在其他通道调整时不丢失。
- 提供 `label` 部件或 `translations.label`，渐变带本身无法说明调整的是什么。
- 需要持久化时监听 `onValueChangeEnd`，拖动过程中的连续回调只用于预览。

### 反模式

- 用它调整普通数值：渐变、单位与区间都按颜色通道固定。
- 传颜色关键字（`red`）：不在支持的写法内，会被视为无效值并保持不变。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-color-slider>` |
| Vue 组件 | `XhColorSliderControl` `XhColorSliderHiddenInput` `XhColorSliderLabel` `XhColorSliderRoot` `XhColorSliderThumb` `XhColorSliderTrack` `XhColorSliderValueText` |
| 组合式函数 | `useColorSlider` |
| 状态机 | `colorSliderMachine` |
| 皮肤 | `@xihan-ui/styles/color-slider.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 颜色值串。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 |
| `defaultValue` | `string` |  |  |
| `channel` | `ColorChannel` |  | 推动的通道：色相 / 饱和度 / 明度 / 透明度 / 红 / 绿 / 蓝，默认 hue。 |
| `format` | `ColorFormat` |  | 值串的写法，默认 hex。修改它只改变对外的序列化，工作色恒为 HSVA。 |
| `hsva` | `ColorHsva` |  | 受控的工作色。提供时本通道以外的分量、灰度处的色相都以它为准，不再从值串反解： 取色器把同一份工作色交给多条并排的滑块，推动色相时饱和度与明度不会被值串抹除。 单独使用一条滑块时不必提供，滑块自行记录锚点。 |
| `alpha` | `boolean` |  | 值串是否带透明度。默认随通道决定：推动透明度通道时带，其余不带。 显式提供 true 时其他通道也保留透明度（与一条透明度滑块并排时需开启，否则推动色相会把透明度归 1）。 |
| `orientation` | `Orientation` |  |  |
| `dir` | `Direction` |  | 文字方向。只改写水平轨道上左右两键与指针的语义。 |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定拇指直径与轨道厚度。 |
| `name` | `string` |  | 表单字段名；提供后表单影子才带 name 并参与提交。 |
| `translations` | `Partial<ColorSliderTranslations>` |  |  |
| `onValueChange` | `(details: ColorSliderValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。拖动过程中连续发出。 |
| `onValueChangeEnd` | `(details: ColorSliderValueChangeDetails) => void` |  | 只在一次操作结束时发出一次，适合用于发起请求。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ColorSliderValueChangeDetails` | 颜色变化；detail 为 `{ value: string }`，拖动过程中连续发出 |
| `value-change-end` | `ColorSliderValueChangeDetails` | 一次推动结束；detail 为 `{ value: string }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhColorSliderRoot` | `default` | `ColorSliderRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `CHANNEL.SET` · `CHANGE.END` · `FORM.RESET`

**判据**：`canInteract`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` | 当前值串（与 onValueChange 发出的是同一个）。 |
| `channel` | `ColorChannel` |  |
| `channelValue` | `number` | 本通道当前的对外数值（色相为角度，饱和度 / 明度 / 透明度为百分数，红绿蓝为 0-255）。 |
| `percent` | `number` | 值在轨道上的位置，0-1。按未取整的工作色计算，比滑杆按整格计算的值更贴近当前颜色。 |
| `min` | `number` |  |
| `max` | `number` |  |
| `hsva` | `ColorHsva` |  |
| `rgba` | `ColorRgba` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `dragging` | `boolean` | 指针正在拖动拇指。 |
| `setValue` | `(next: string) => void` |  |
| `setChannelValue` | `(next: number) => void` | 直接把本通道推到某个对外数值。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getTrackProps` | `() => T['element']` | 轨道：渐变由连接层按当前颜色计算并写为内联 background-image。 |
| `getThumbProps` | `() => T['element']` |  |
| `getValueTextProps` | `() => T['element']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单影子：值随表单提交。提供 name 后才带 name，未提供时不参与提交。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowUp` | focus in thumb, not disabled/readOnly | 本通道按 step 增大；RTL 与竖直排布下按屏幕方向对调，语义恒是"朝 max 走一格" |
| `ArrowLeft` / `ArrowDown` | focus in thumb, not disabled/readOnly | 本通道按 step 减小，同上对调规则 |
| `PageUp` | focus in thumb, not disabled/readOnly | 按 largeStep 增大（各通道均为 10 格） |
| `PageDown` | focus in thumb, not disabled/readOnly | 按 largeStep 减小 |
| `Home` | focus in thumb, not disabled/readOnly | 取本通道的 min |
| `End` | focus in thumb, not disabled/readOnly | 取本通道的 max |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `thumb` | `aria-disabled` | 'true' \| 'false' |
| `thumb` | `aria-label` | label.label(channel) |
| `thumb` | `aria-labelledby` | `label` 部件的 id |
| `thumb` | `aria-orientation` | props.orientation |
| `thumb` | `aria-valuemax` | String(range.max) |
| `thumb` | `aria-valuemin` | String(range.min) |
| `thumb` | `aria-valuenow` | String(channelValue) |
| `thumb` | `aria-valuetext` | label.valueText(channel, channelValue) |
| `thumb` | `role` | 'slider' |
| `value-text` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/color-slider.css` 使用 `[data-scope="color-slider"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-channel` | colorToChannel(prop('channel')) |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-dragging` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-value` | context.get('value') |
| `label` | `data-channel` | colorToChannel(prop('channel')) |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `label` | `data-dragging` | ''（条件成立时才出现） |
| `label` | `data-invalid` | ''（条件成立时才出现） |
| `label` | `data-orientation` | props.orientation |
| `label` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-channel` | colorToChannel(prop('channel')) |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-dragging` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-orientation` | props.orientation |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `track` | `data-channel` | colorToChannel(prop('channel')) |
| `track` | `data-disabled` | ''（条件成立时才出现） |
| `track` | `data-dragging` | ''（条件成立时才出现） |
| `track` | `data-invalid` | ''（条件成立时才出现） |
| `track` | `data-orientation` | props.orientation |
| `track` | `data-readonly` | ''（条件成立时才出现） |
| `thumb` | `data-channel` | colorToChannel(prop('channel')) |
| `thumb` | `data-disabled` | ''（条件成立时才出现） |
| `thumb` | `data-dragging` | ''（条件成立时才出现） |
| `thumb` | `data-invalid` | ''（条件成立时才出现） |
| `thumb` | `data-orientation` | props.orientation |
| `thumb` | `data-readonly` | ''（条件成立时才出现） |
| `value-text` | `data-channel` | colorToChannel(prop('channel')) |
| `value-text` | `data-disabled` | ''（条件成立时才出现） |
| `value-text` | `data-dragging` | ''（条件成立时才出现） |
| `value-text` | `data-invalid` | ''（条件成立时才出现） |
| `value-text` | `data-orientation` | props.orientation |
| `value-text` | `data-readonly` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-color-slider-checker` | `track` | `background-image` | `channel=alpha` | `--xh-color-neutral-300` | color-slider 的 track 部件 background-image 覆盖槽。 |
| `--xh-color-slider-checker-base` | `track` | `background-color` | `channel=alpha` | `--xh-bg-surface` | color-slider 的 track 部件 background-color 覆盖槽。 |
| `--xh-color-slider-gap` | `root` | `gap` | `default` | `--xh-space-1` | color-slider 的 root 部件 gap 覆盖槽。 |
| `--xh-color-slider-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | color-slider 的 label 部件 color 覆盖槽。 |
| `--xh-color-slider-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | color-slider 的 label 部件 color 覆盖槽。 |
| `--xh-color-slider-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | color-slider 的 label 部件 font-size 覆盖槽。 |
| `--xh-color-slider-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | color-slider 的 label 部件 font-weight 覆盖槽。 |
| `--xh-color-slider-thumb-bg` | `thumb` | `background` | `default` | `--xh-_color-slider-thumb-color` | color-slider 的 thumb 部件 background 覆盖槽。 |
| `--xh-color-slider-thumb-border` | `thumb` | `border` | `default` | `--xh-border-default` | color-slider 的 thumb 部件 border 覆盖槽。 |
| `--xh-color-slider-thumb-border-invalid` | `thumb` | `border-color` | `invalid` | `--xh-border-invalid` | color-slider 的 thumb 部件 border-color 覆盖槽。 |
| `--xh-color-slider-thumb-radius` | `thumb` | `border-radius` | `default` | `--xh-shape-circle` | color-slider 的 thumb 部件 border-radius 覆盖槽。 |
| `--xh-color-slider-thumb-scale-dragging` | `thumb` | `scale` | `dragging` | `--xh-motion-scale-drag` | color-slider 的 thumb 部件 scale 覆盖槽。 |
| `--xh-color-slider-thumb-shadow` | `thumb` | `box-shadow` | `default` | `--xh-elevation-raised` | color-slider 的 thumb 部件 box-shadow 覆盖槽。 |
| `--xh-color-slider-thumb-shadow-disabled` | `thumb` | `box-shadow` | `disabled` | `none` | color-slider 的 thumb 部件 box-shadow 覆盖槽。 |
| `--xh-color-slider-thumb-shadow-dragging` | `thumb` | `box-shadow` | `dragging` | `--xh-elevation-lifted` | color-slider 的 thumb 部件 box-shadow 覆盖槽。 |
| `--xh-color-slider-thumb-size` | `control`<br>`root`<br>`thumb` | `block-size`<br>`inline-size`<br>`margin-block-end`<br>`margin-block-start`<br>`margin-inline-start` | `default`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`size=lg`<br>`size=sm` | `--xh-space-3`<br>`--xh-space-6`<br>`--xh-track-thumb-size` | color-slider 的 control、root、thumb 部件 block-size、inline-size、margin-block-end、margin-block-start、margin-inline-start 覆盖槽。 |
| `--xh-color-slider-track-border` | `track` | `box-shadow` | `default` | `--xh-border-subtle` | color-slider 的 track 部件 box-shadow 覆盖槽。 |
| `--xh-color-slider-track-radius` | `track` | `border-radius` | `default` | `--xh-shape-pill` | color-slider 的 track 部件 border-radius 覆盖槽。 |
| `--xh-color-slider-track-thickness` | `control`<br>`root`<br>`track` | `block-size`<br>`inline-size` | `default`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`size=lg`<br>`size=sm` | `--xh-space-2`<br>`--xh-space-3`<br>`--xh-space-4` | color-slider 的 control、root、track 部件 block-size、inline-size 覆盖槽。 |
| `--xh-color-slider-value-text-bg` | `value-text` | `background` | `default` | `--xh-bg-brand` | color-slider 的 value-text 部件 background 覆盖槽。 |
| `--xh-color-slider-value-text-fg` | `value-text` | `color` | `default` | `--xh-fg-on-brand` | color-slider 的 value-text 部件 color 覆盖槽。 |
| `--xh-color-slider-value-text-font-size` | `value-text` | `font-size` | `default` | `--xh-text-caption-size` | color-slider 的 value-text 部件 font-size 覆盖槽。 |
| `--xh-color-slider-value-text-offset` | `value-text` | `margin-block-end`<br>`margin-inline` | `default`<br>`orientation=vertical` | `--xh-space-2` | color-slider 的 value-text 部件 margin-block-end、margin-inline 覆盖槽。 |
| `--xh-color-slider-value-text-px` | `value-text` | `padding-inline` | `default` | `--xh-space-2` | color-slider 的 value-text 部件 padding-inline 覆盖槽。 |
| `--xh-color-slider-value-text-py` | `value-text` | `padding-block` | `default` | `--xh-space-0_5` | color-slider 的 value-text 部件 padding-block 覆盖槽。 |
| `--xh-color-slider-value-text-radius` | `value-text` | `border-radius` | `default` | `--xh-shape-control` | color-slider 的 value-text 部件 border-radius 覆盖槽。 |
| `--xh-color-slider-vertical-length` | `control` | `block-size` | `orientation=vertical` | `--xh-overlay-menu-min-w` | color-slider 的 control 部件 block-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`box-shadow` · `opacity` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
