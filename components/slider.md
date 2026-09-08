来源：https://ui.docs.xihanfun.com/components/slider

# 滑块 `slider`

在一个连续或离散的区间里拖出一个值或一段范围。

## 何时使用

- 用户关心的是相对位置而不是精确数字（音量、透明度、价格区间）。
- 需要即时看到调整的效果。

## 何时不用

- 需要精确输入：用[数字输入](./number-field)，或两者并排。
- 档位只有三四个：用[单选组](./radio-group)或[切换按钮组](./toggle-group)。

## 特性

- 单值与区间共用一套结构，区间时 `minStepsBetweenThumbs` 防止两头交叉。
- `marks` 画刻度，`snapToMarks` 让值吸附到刻度上。
- 两个回调：拖动途中连着发，松手发一次——写存储用后者。
- `getValueText` 决定读屏念出的是什么，别让它只念数字。

## 示例

### 基础用法

值恒是数组，单滑块即长度 1；方向键走一格 step，PageUp 与 PageDown 走 largeStep，Home 与 End 贴到端点

```vue
<script setup lang="ts">
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";
</script>

<template>
  <XhSliderRoot
    v-slot="{ value }"
    :default-value="[40]"
    :min="0"
    :max="100"
    :step="1"
    :large-step="10"
    name="volume"
    style="inline-size: 320px"
  >
    <XhSliderLabel>音量：{{ value[0] }}</XhSliderLabel>
    <XhSliderControl>
      <XhSliderTrack>
        <XhSliderRange />
      </XhSliderTrack>
      <XhSliderThumb>
        <XhSliderHiddenInput />
      </XhSliderThumb>
    </XhSliderControl>
  </XhSliderRoot>
</template>
```

```html
<xh-slider
  id="slider-basic"
  default-value="40"
  min="0"
  max="100"
  step="1"
  large-step="10"
  name="volume"
>
  <div data-xh-part="root" style="inline-size: 320px">
    <label data-xh-part="label">
      音量：<span id="slider-basic-value">40</span>
    </label>
    <div data-xh-part="control">
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
      <div data-xh-part="thumb">
        <input data-xh-part="hidden-input" />
      </div>
    </div>
  </div>
</xh-slider>

<script type="module">
  // 标签里的数字跟着值走
  const slider = document.getElementById("slider-basic");
  const readout = document.getElementById("slider-basic-value");
  slider.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0];
  });
</script>
```

### 区间选择

两个拇指互为对方的边界、永不交叉，minStepsBetweenThumbs 再给它们之间留出格数；getValueText 把值翻成读屏念得出的话

```vue
<script setup lang="ts">
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";
import { ref } from "vue";

const price = ref([200, 600]);

function valueText({ value, index }: { value: number; index: number }) {
  return `${index === 0 ? "起价" : "止价"} ${value} 元`;
}
</script>

<template>
  <XhSliderRoot
    v-model:value="price"
    :min="0"
    :max="1000"
    :step="10"
    :min-steps-between-thumbs="2"
    :get-value-text="valueText"
    name="price"
    style="inline-size: 320px"
  >
    <XhSliderLabel>价格：¥{{ price[0] }} – ¥{{ price[1] }}</XhSliderLabel>
    <XhSliderControl>
      <XhSliderTrack>
        <XhSliderRange />
      </XhSliderTrack>
      <XhSliderThumb :index="0">
        <XhSliderHiddenInput />
      </XhSliderThumb>
      <XhSliderThumb :index="1">
        <XhSliderHiddenInput />
      </XhSliderThumb>
    </XhSliderControl>
  </XhSliderRoot>
</template>
```

```html
<xh-slider
  id="slider-range"
  default-value="200,600"
  min="0"
  max="1000"
  step="10"
  min-steps-between-thumbs="2"
  name="price"
>
  <div data-xh-part="root" style="inline-size: 320px">
    <label data-xh-part="label">
      价格：¥<span id="slider-range-low">200</span> – ¥<span id="slider-range-high">600</span>
    </label>
    <div data-xh-part="control">
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
      <div data-xh-part="thumb" index="0">
        <input data-xh-part="hidden-input" />
      </div>
      <div data-xh-part="thumb" index="1">
        <input data-xh-part="hidden-input" />
      </div>
    </div>
  </div>
</xh-slider>

<script type="module">
  // 格式化函数只走属性；标签里的两个数字跟着值走
  const slider = document.getElementById("slider-range");
  slider.getValueText = ({ value, index }) =>
    `${index === 0 ? "起价" : "止价"} ${value} 元`;

  const low = document.getElementById("slider-range-low");
  const high = document.getElementById("slider-range-high");
  slider.addEventListener("value-change", (event) => {
    low.textContent = event.detail.value[0];
    high.textContent = event.detail.value[1];
  });
</script>
```

### 竖向

orientation 换成 vertical 后整条控件收成一块，键盘与拖动的方向跟着一起翻

```vue
<script setup lang="ts">
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";
</script>

<template>
  <XhSliderRoot v-slot="{ value }" :default-value="[30]" orientation="vertical">
    <XhSliderLabel>亮度：{{ value[0] }}</XhSliderLabel>
    <XhSliderControl>
      <XhSliderTrack>
        <XhSliderRange />
      </XhSliderTrack>
      <XhSliderThumb>
        <XhSliderHiddenInput />
      </XhSliderThumb>
    </XhSliderControl>
  </XhSliderRoot>
</template>
```

```html
<xh-slider id="slider-vertical" default-value="30" orientation="vertical">
  <div data-xh-part="root">
    <label data-xh-part="label">
      亮度：<span id="slider-vertical-value">30</span>
    </label>
    <div data-xh-part="control">
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
      <div data-xh-part="thumb">
        <input data-xh-part="hidden-input" />
      </div>
    </div>
  </div>
</xh-slider>

<script type="module">
  // 标签里的数字跟着值走
  const slider = document.getElementById("slider-vertical");
  const readout = document.getElementById("slider-vertical-value");
  slider.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0];
  });
</script>
```

### 禁用与只读

禁用的拇指退出 Tab 序列、值也不再随表单提交；只读仍可聚焦与朗读，只是推不动

```vue
<script setup lang="ts">
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";
</script>

<template>
  <XhSliderRoot :default-value="[60]" disabled name="brightness" style="inline-size: 280px">
    <XhSliderLabel>禁用</XhSliderLabel>
    <XhSliderControl>
      <XhSliderTrack>
        <XhSliderRange />
      </XhSliderTrack>
      <XhSliderThumb>
        <XhSliderHiddenInput />
      </XhSliderThumb>
    </XhSliderControl>
  </XhSliderRoot>

  <XhSliderRoot :default-value="[60]" read-only style="inline-size: 280px">
    <XhSliderLabel>只读</XhSliderLabel>
    <XhSliderControl>
      <XhSliderTrack>
        <XhSliderRange />
      </XhSliderTrack>
      <XhSliderThumb>
        <XhSliderHiddenInput />
      </XhSliderThumb>
    </XhSliderControl>
  </XhSliderRoot>
</template>
```

```html
<xh-slider default-value="60" disabled name="brightness">
  <div data-xh-part="root" style="inline-size: 280px">
    <label data-xh-part="label">禁用</label>
    <div data-xh-part="control">
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
      <div data-xh-part="thumb">
        <input data-xh-part="hidden-input" />
      </div>
    </div>
  </div>
</xh-slider>

<xh-slider default-value="60" read-only>
  <div data-xh-part="root" style="inline-size: 280px">
    <label data-xh-part="label">只读</label>
    <div data-xh-part="control">
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
      <div data-xh-part="thumb">
        <input data-xh-part="hidden-input" />
      </div>
    </div>
  </div>
</xh-slider>
```

### 语气

tone 决定已填轨道与滑块用哪族颜色，不写时沿用品牌色

```vue
<script setup lang="ts">
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: grid; gap: 16px">
    <XhSliderRoot
      v-for="t in tones"
      :key="t"
      :tone="t"
      :default-value="[60]"
      style="inline-size: 280px"
    >
      <XhSliderLabel>{{ t }}</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderThumb>
          <XhSliderHiddenInput />
        </XhSliderThumb>
      </XhSliderControl>
    </XhSliderRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px">
  <xh-slider tone="brand" default-value="60">
    <div data-xh-part="root" style="inline-size: 280px">
      <label data-xh-part="label">brand</label>
      <div data-xh-part="control">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
        <div data-xh-part="thumb">
          <input data-xh-part="hidden-input" />
        </div>
      </div>
    </div>
  </xh-slider>

  <xh-slider tone="neutral" default-value="60">
    <div data-xh-part="root" style="inline-size: 280px">
      <label data-xh-part="label">neutral</label>
      <div data-xh-part="control">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
        <div data-xh-part="thumb">
          <input data-xh-part="hidden-input" />
        </div>
      </div>
    </div>
  </xh-slider>

  <xh-slider tone="success" default-value="60">
    <div data-xh-part="root" style="inline-size: 280px">
      <label data-xh-part="label">success</label>
      <div data-xh-part="control">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
        <div data-xh-part="thumb">
          <input data-xh-part="hidden-input" />
        </div>
      </div>
    </div>
  </xh-slider>

  <xh-slider tone="warning" default-value="60">
    <div data-xh-part="root" style="inline-size: 280px">
      <label data-xh-part="label">warning</label>
      <div data-xh-part="control">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
        <div data-xh-part="thumb">
          <input data-xh-part="hidden-input" />
        </div>
      </div>
    </div>
  </xh-slider>

  <xh-slider tone="danger" default-value="60">
    <div data-xh-part="root" style="inline-size: 280px">
      <label data-xh-part="label">danger</label>
      <div data-xh-part="control">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
        <div data-xh-part="thumb">
          <input data-xh-part="hidden-input" />
        </div>
      </div>
    </div>
  </xh-slider>

  <xh-slider tone="info" default-value="60">
    <div data-xh-part="root" style="inline-size: 280px">
      <label data-xh-part="label">info</label>
      <div data-xh-part="control">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
        <div data-xh-part="thumb">
          <input data-xh-part="hidden-input" />
        </div>
      </div>
    </div>
  </xh-slider>
</div>
```

### 尺寸

size 改轨道厚度与滑块直径，不写即缺省中档

```vue
<script setup lang="ts">
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 20px">
    <XhSliderRoot :default-value="[50]" size="sm" style="inline-size: 280px">
      <XhSliderLabel>sm</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderThumb>
          <XhSliderHiddenInput />
        </XhSliderThumb>
      </XhSliderControl>
    </XhSliderRoot>

    <XhSliderRoot :default-value="[50]" style="inline-size: 280px">
      <XhSliderLabel>缺省</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderThumb>
          <XhSliderHiddenInput />
        </XhSliderThumb>
      </XhSliderControl>
    </XhSliderRoot>

    <XhSliderRoot :default-value="[50]" size="lg" style="inline-size: 280px">
      <XhSliderLabel>lg</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderThumb>
          <XhSliderHiddenInput />
        </XhSliderThumb>
      </XhSliderControl>
    </XhSliderRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 20px">
  <xh-slider default-value="50" size="sm">
    <div data-xh-part="root" style="inline-size: 280px">
      <label data-xh-part="label">sm</label>
      <div data-xh-part="control">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
        <div data-xh-part="thumb">
          <input data-xh-part="hidden-input" />
        </div>
      </div>
    </div>
  </xh-slider>

  <xh-slider default-value="50">
    <div data-xh-part="root" style="inline-size: 280px">
      <label data-xh-part="label">缺省</label>
      <div data-xh-part="control">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
        <div data-xh-part="thumb">
          <input data-xh-part="hidden-input" />
        </div>
      </div>
    </div>
  </xh-slider>

  <xh-slider default-value="50" size="lg">
    <div data-xh-part="root" style="inline-size: 280px">
      <label data-xh-part="label">lg</label>
      <div data-xh-part="control">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
        <div data-xh-part="thumb">
          <input data-xh-part="hidden-input" />
        </div>
      </div>
    </div>
  </xh-slider>
</div>
```

### 文字方向

dir 换成 rtl 后轨道从右往左填，左右两键的语义跟着对调；上下键与 Home、End 不受影响

```vue
<script setup lang="ts">
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 20px">
    <XhSliderRoot v-slot="{ value }" :default-value="[35]" style="inline-size: 280px">
      <XhSliderLabel>从左往右：{{ value[0] }}</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderThumb>
          <XhSliderHiddenInput />
        </XhSliderThumb>
      </XhSliderControl>
    </XhSliderRoot>

    <!-- 外层节点声明文字方向，轨道与滑块用的逻辑属性据此换向 -->
    <div dir="rtl">
      <XhSliderRoot
        v-slot="{ value }"
        dir="rtl"
        :default-value="[35]"
        style="inline-size: 280px"
      >
        <XhSliderLabel>从右往左：{{ value[0] }}</XhSliderLabel>
        <XhSliderControl>
          <XhSliderTrack>
            <XhSliderRange />
          </XhSliderTrack>
          <XhSliderThumb>
            <XhSliderHiddenInput />
          </XhSliderThumb>
        </XhSliderControl>
      </XhSliderRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: grid; gap: 20px">
  <xh-slider id="slider-ltr" default-value="35">
    <div data-xh-part="root" style="inline-size: 280px">
      <label data-xh-part="label">
        从左往右：<span id="slider-ltr-value">35</span>
      </label>
      <div data-xh-part="control">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
        <div data-xh-part="thumb">
          <input data-xh-part="hidden-input" />
        </div>
      </div>
    </div>
  </xh-slider>

  <!-- 外层节点声明文字方向，轨道与滑块用的逻辑属性据此换向 -->
  <div dir="rtl">
    <xh-slider id="slider-rtl" dir="rtl" default-value="35">
      <div data-xh-part="root" style="inline-size: 280px">
        <label data-xh-part="label">
          从右往左：<span id="slider-rtl-value">35</span>
        </label>
        <div data-xh-part="control">
          <div data-xh-part="track">
            <div data-xh-part="range"></div>
          </div>
          <div data-xh-part="thumb">
            <input data-xh-part="hidden-input" />
          </div>
        </div>
      </div>
    </xh-slider>
  </div>
</div>

<script type="module">
  // 两条轨道各自把当前值写回自己的标签
  for (const id of ["slider-ltr", "slider-rtl"]) {
    const slider = document.getElementById(id);
    const readout = document.getElementById(`${id}-value`);
    slider.addEventListener("value-change", (event) => {
      readout.textContent = event.detail.value[0];
    });
  }
</script>
```

### 滑块里的内容

thumb 是个普通容器，往里放什么都由作者说了算；放得下靠 --xh-slider-thumb-size 把直径撑开

```vue
<script setup lang="ts">
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";

const badge = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  blockSize: "100%",
  fontSize: "11px",
  color: "var(--xh-fg-on-brand)",
};
</script>

<template>
  <XhSliderRoot
    v-slot="{ value }"
    :default-value="[45]"
    :step="5"
    style="inline-size: 320px; --xh-slider-thumb-size: 34px"
  >
    <XhSliderLabel>完成度</XhSliderLabel>
    <XhSliderControl>
      <XhSliderTrack>
        <XhSliderRange />
      </XhSliderTrack>
      <XhSliderThumb>
        <span :style="badge">{{ value[0] }}%</span>
        <XhSliderHiddenInput />
      </XhSliderThumb>
    </XhSliderControl>
  </XhSliderRoot>
</template>
```

```html
<xh-slider id="slider-thumb-content" default-value="45" step="5">
  <div
    data-xh-part="root"
    style="inline-size: 320px; --xh-slider-thumb-size: 34px"
  >
    <label data-xh-part="label">完成度</label>
    <div data-xh-part="control">
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
      <div data-xh-part="thumb">
        <span
          id="slider-thumb-content-badge"
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            block-size: 100%;
            font-size: 11px;
            color: var(--xh-fg-on-brand);
          "
        >
          45%
        </span>
        <input data-xh-part="hidden-input" />
      </div>
    </div>
  </div>
</xh-slider>

<script type="module">
  // 滑块里的数字跟着值走
  const slider = document.getElementById("slider-thumb-content");
  const badge = document.getElementById("slider-thumb-content-badge");
  slider.addEventListener("value-change", (event) => {
    badge.textContent = `${event.detail.value[0]}%`;
  });
</script>
```

### 轨道刻度

刻度分圆点与文案两层：圆点钉在轨道上、文案排在下方且点按跳值，落进已选区间的刻度分段上色；snapToMarks 让拖动/点按/键盘只认刻度落点

```vue
<script setup lang="ts">
import type { SliderMark } from "@xihan-ui/headless";
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTickGroup,
  XhSliderTrack,
} from "@xihan-ui/vue";
import { ref } from "vue";

const marks: SliderMark[] = [
  { value: 0, label: "0°C" },
  { value: 26, label: "26°C" },
  { value: 37, label: "37°C" },
  { value: 100, label: "沸腾" },
];

const free = ref([26]);
const snapped = ref([37]);
</script>

<template>
  <div style="display: grid; gap: 40px; inline-size: 320px">
    <XhSliderRoot v-model:value="free" :marks="marks">
      <XhSliderLabel>自由落点（点文案跳值）</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderTickGroup />
        <XhSliderThumb>
          <XhSliderHiddenInput />
        </XhSliderThumb>
      </XhSliderControl>
    </XhSliderRoot>

    <XhSliderRoot v-model:value="snapped" :marks="marks" snap-to-marks>
      <XhSliderLabel>只认刻度（拖动与方向键都吸档）</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderTickGroup />
        <XhSliderThumb>
          <XhSliderHiddenInput />
        </XhSliderThumb>
      </XhSliderControl>
    </XhSliderRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 40px; inline-size: 320px">
  <xh-slider default-value="26">
    <div data-xh-part="root">
      <label data-xh-part="label">自由落点（点文案跳值）</label>
      <div data-xh-part="control">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
        <div data-xh-part="tick-group">
          <span data-xh-part="tick" value="0"></span>
          <span data-xh-part="tick-label" value="0">0°C</span>
          <span data-xh-part="tick" value="26"></span>
          <span data-xh-part="tick-label" value="26">26°C</span>
          <span data-xh-part="tick" value="37"></span>
          <span data-xh-part="tick-label" value="37">37°C</span>
          <span data-xh-part="tick" value="100"></span>
          <span data-xh-part="tick-label" value="100">沸腾</span>
        </div>
        <div data-xh-part="thumb">
          <input data-xh-part="hidden-input" />
        </div>
      </div>
    </div>
  </xh-slider>

  <xh-slider id="slider-snapped" default-value="37" snap-to-marks>
    <div data-xh-part="root">
      <label data-xh-part="label">只认刻度（拖动与方向键都吸档）</label>
      <div data-xh-part="control">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
        <div data-xh-part="tick-group">
          <span data-xh-part="tick" value="0"></span>
          <span data-xh-part="tick-label" value="0">0°C</span>
          <span data-xh-part="tick" value="26"></span>
          <span data-xh-part="tick-label" value="26">26°C</span>
          <span data-xh-part="tick" value="37"></span>
          <span data-xh-part="tick-label" value="37">37°C</span>
          <span data-xh-part="tick" value="100"></span>
          <span data-xh-part="tick-label" value="100">沸腾</span>
        </div>
        <div data-xh-part="thumb">
          <input data-xh-part="hidden-input" />
        </div>
      </div>
    </div>
  </xh-slider>
</div>

<script type="module">
  // 刻度表是数组，只走属性；开了 snapToMarks 才据它吸档
  document.getElementById("slider-snapped").marks = [
    { value: 0, label: "0°C" },
    { value: 26, label: "26°C" },
    { value: 37, label: "37°C" },
    { value: 100, label: "沸腾" },
  ];
</script>
```

### 拖动时的值气泡

value-text 挂在 thumb 里就跟着走位；推动那一刻由皮肤放它出面，气泡里的文字取自作者的格式化函数

```vue
<script setup lang="ts">
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
  XhSliderValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const budget = ref([1800]);

function money(value: number) {
  return `¥${value.toLocaleString("zh-CN")}`;
}

// 读屏走 aria-valuetext，与可见气泡各念各的同一个值
function valueText({ value }: { value: number }) {
  return money(value);
}
</script>

<template>
  <XhSliderRoot
    v-model:value="budget"
    :min="0"
    :max="5000"
    :step="50"
    :get-value-text="valueText"
    name="budget"
    style="inline-size: 320px; --xh-slider-gap: 32px"
  >
    <XhSliderLabel>预算上限：{{ money(budget[0]) }}</XhSliderLabel>
    <XhSliderControl>
      <XhSliderTrack>
        <XhSliderRange />
      </XhSliderTrack>
      <XhSliderThumb>
        <XhSliderValueText />
        <XhSliderHiddenInput />
      </XhSliderThumb>
    </XhSliderControl>
  </XhSliderRoot>
  <p>已选：{{ money(budget[0]) }}</p>
</template>
```

```html
<xh-slider
  id="slider-budget"
  default-value="1800"
  min="0"
  max="5000"
  step="50"
  name="budget"
>
  <div data-xh-part="root" style="inline-size: 320px; --xh-slider-gap: 32px">
    <label data-xh-part="label">
      预算上限：<span id="slider-budget-label">¥1,800</span>
    </label>
    <div data-xh-part="control">
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
      <div data-xh-part="thumb">
        <span data-xh-part="value-text"></span>
        <input data-xh-part="hidden-input" />
      </div>
    </div>
  </div>
</xh-slider>

<script type="module">
  const slider = document.getElementById("slider-budget");
  const label = document.getElementById("slider-budget-label");

  const money = (value) => `¥${value.toLocaleString("zh-CN")}`;

  // 读屏走 aria-valuetext，气泡里的文字也取同一个格式化函数
  slider.getValueText = ({ value }) => money(value);

  slider.addEventListener("value-change", (event) => {
    label.textContent = money(event.detail.value[0]);
  });
</script>
```

### 离散档位

可选值不必是等距数值：让滑块在档位下标上走，宿主再把下标映射回自己的取值表，键盘与拖动都只落在档位上

```vue
<script setup lang="ts">
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const levels = [1, 5, 10, 50, 100, 500];

const index = ref([2]);

const current = computed(() => levels[index.value[0]]);

function valueText({ value }: { value: number }) {
  return `每页 ${levels[value]} 条`;
}
</script>

<template>
  <div style="inline-size: 320px; display: grid; gap: 12px">
    <XhSliderRoot
      v-model:value="index"
      :min="0"
      :max="levels.length - 1"
      :step="1"
      :large-step="1"
      :get-value-text="valueText"
    >
      <XhSliderLabel>每页 {{ current }} 条</XhSliderLabel>
      <XhSliderControl>
        <XhSliderTrack>
          <XhSliderRange />
        </XhSliderTrack>
        <XhSliderThumb>
          <XhSliderHiddenInput />
        </XhSliderThumb>
      </XhSliderControl>
    </XhSliderRoot>

    <span style="font-size: 12px; color: var(--xh-fg-muted)">
      可选：{{ levels.join(" / ") }}
    </span>
  </div>
</template>
```

```html
<div style="inline-size: 320px; display: grid; gap: 12px">
  <xh-slider
    id="slider-levels"
    default-value="2"
    min="0"
    max="5"
    step="1"
    large-step="1"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">
        每页 <span id="slider-levels-current">10</span> 条
      </label>
      <div data-xh-part="control">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
        <div data-xh-part="thumb">
          <input data-xh-part="hidden-input" />
        </div>
      </div>
    </div>
  </xh-slider>

  <span style="font-size: 12px; color: var(--xh-fg-muted)">
    可选：1 / 5 / 10 / 50 / 100 / 500
  </span>
</div>

<script type="module">
  // 滑块走的是档位下标，取值表由宿主自己映射回来
  const levels = [1, 5, 10, 50, 100, 500];
  const slider = document.getElementById("slider-levels");
  const current = document.getElementById("slider-levels-current");

  slider.getValueText = ({ value }) => `每页 ${levels[value]} 条`;

  slider.addEventListener("value-change", (event) => {
    current.textContent = levels[event.detail.value[0]];
  });
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-slider>` |
| Vue 组件 | `XhSliderControl` `XhSliderHiddenInput` `XhSliderLabel` `XhSliderRange` `XhSliderRoot` `XhSliderThumb` `XhSliderTickGroup` `XhSliderTrack` `XhSliderValueText` |
| 组合式函数 | `useSlider` |
| 状态机 | `sliderMachine` |
| 皮肤 | `@xihan-ui/styles/slider.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="slider"`：**`root`** · `label` · **`control`** · **`track`** · `range` · **`thumb`** · `value-text` · `tick-group` · `tick` · `tick-label` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `number[]` |  |  |
| `defaultValue` | `number[]` |  |  |
| `min` | `number` |  |  |
| `max` | `number` |  |  |
| `step` | `number` |  |  |
| `largeStep` | `number` |  | PageUp / PageDown 的步长，默认 10 倍 step。 |
| `orientation` | `Orientation` |  |  |
| `dir` | `Direction` |  |  |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定拇指直径与轨道厚度 |
| `name` | `string` |  | 表单字段名；多滑块时逐个 append。 |
| `minStepsBetweenThumbs` | `number` |  | 相邻滑块至少隔几格，默认 0（可以贴在一起但不能交换顺序）。 |
| `marks` | `SliderMark[]` |  | 刻度表：轨道上的圆点与文案，点文案即跳值。 |
| `snapToMarks` | `boolean` |  | 只认刻度落点：拖动、点按与键盘都吸到最近/下一档刻度。 |
| `getValueText` | `(details: SliderValueTextDetails) => string` |  | 把值翻成人话，产出写进拇指的 aria-valuetext。 不给就不写这个属性，读屏退回念 aria-valuenow。 |
| `onValueChange` | `(details: SliderValueChangeDetails) => void` |  | 每次推动都发；拖动过程中会连续发很多次。 |
| `onValueChangeEnd` | `(details: SliderValueChangeEndDetails) => void` |  | 只在一次操作结束时发一次，适合拿来发请求。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `SliderValueTextDetails` | 值变化（拖动途中会连发）；detail 为 `{ value: number[] }` |
| `value-change-end` | `SliderValueChangeEndDetails` | 一次操作收尾发一次；detail 为 `{ value: number[], index: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSliderRoot` | `default` | `SliderRootSlotProps` |  |
| `XhSliderTickGroup` | `tick` | `SliderTickGroupTickSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `dragging`

**事件**：`VALUE.SET` · `THUMB.STEP` · `THUMB.TO_MIN` · `THUMB.TO_MAX` · `THUMB.SET` · `THUMB.FOCUS` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `FORM.RESET`

**判据**：`canDrag`

## connect API

`useSlider` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `number[]` |  |
| `range` | `{ start: number, end: number }` | 已选区间在轨道上的起止，0-1。 |
| `thumbs` | `SliderThumbState[]` |  |
| `marks` | `SliderMarkMeta[]` | 刻度呈现数据：夹进区间、升序去重，带位置与分段上色标记。 |
| `dragging` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `valueText` | `(index: number) => string` | 某个拇指的值文本：给了 getValueText 就是它的产出，否则是值本身。 |
| `setValue` | `(next: number[]) => void` |  |
| `setThumbValue` | `(index: number, next: number) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getTrackProps` | `() => T['element']` |  |
| `getRangeProps` | `() => T['element']` |  |
| `getThumbProps` | `(index: number) => T['element']` |  |
| `getValueTextProps` | `(index: number) => T['element']` | 值气泡：挂在拇指里显示这一个拇指的当前值；aria-hidden，读屏走拇指自己的 aria-valuetext。 |
| `getTickGroupProps` | `() => T['element']` | 刻度容器。 |
| `getTickProps` | `(props: SliderTickProps) => T['element']` | 刻度点：轨道上的圆点，纯装饰。 |
| `getTickLabelProps` | `(props: SliderTickProps) => T['element']` | 刻度文案：点按把最近的滑块跳到这一档。 |
| `getHiddenInputProps` | `(index: number) => T['input']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowUp` | focus in thumb, not disabled/readOnly | 按 step 增大；RTL 与竖直排布下按屏幕方向对调，语义恒是"朝 max 走一格" |
| `ArrowLeft` / `ArrowDown` | focus in thumb, not disabled/readOnly | 按 step 减小，同上对调规则 |
| `PageUp` | focus in thumb, not disabled/readOnly | 按 largeStep 增大（默认 10 倍 step） |
| `PageDown` | focus in thumb, not disabled/readOnly | 按 largeStep 减小 |
| `Home` | focus in thumb, not disabled/readOnly | 取 min；多滑块时取自己被邻居允许的下界 |
| `End` | focus in thumb, not disabled/readOnly | 取 max；多滑块时取自己被邻居允许的上界 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `thumb` | `aria-disabled` | 'true' \| 'false' |
| `thumb` | `aria-labelledby` | `label` 部件的 id |
| `thumb` | `aria-orientation` | props.orientation |
| `thumb` | `aria-valuemax` | String(thumb.max) |
| `thumb` | `aria-valuemin` | String(thumb.min) |
| `thumb` | `aria-valuenow` | String(thumb.value) |
| `thumb` | `aria-valuetext` | prop('getValueText')?.({ value: thumb.value, index: t… |
| `thumb` | `role` | 'slider' |
| `value-text` | `aria-hidden` | 'true' |
| `tick` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/slider.css` 按部件选择：`[data-scope="slider"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `thumb` | `data-dragging` | ''（条件成立时才出现） |
| `thumb` | `data-index` | String(thumb.index) |
| `value-text` | `data-dragging` | ''（条件成立时才出现） |
| `value-text` | `data-index` | String(thumb.index) |
| `tick` | `data-passed` | ''（条件成立时才出现） |
| `tick-label` | `data-passed` | ''（条件成立时才出现） |
| `hidden-input` | `data-index` | String(thumb.index) |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-slider-gap` · `--xh-slider-label-fg` · `--xh-slider-label-font-size` · `--xh-slider-label-font-weight` · `--xh-slider-range-bg` · `--xh-slider-range-bg-invalid` · `--xh-slider-range-radius` · `--xh-slider-thumb-bg` · `--xh-slider-thumb-bg-invalid` · `--xh-slider-thumb-border` · `--xh-slider-thumb-radius` · `--xh-slider-thumb-scale-dragging` · `--xh-slider-thumb-shadow` · `--xh-slider-thumb-shadow-dragging` · `--xh-slider-thumb-size` · `--xh-slider-tick-bg` · `--xh-slider-tick-bg-active` · `--xh-slider-tick-label-fg` · `--xh-slider-tick-label-fg-active` · `--xh-slider-tick-label-font-size` · `--xh-slider-tick-label-gap` · `--xh-slider-tick-radius` · `--xh-slider-tick-size` · `--xh-slider-track-bg` · `--xh-slider-track-radius` · `--xh-slider-track-thickness` · `--xh-slider-value-text-bg` · `--xh-slider-value-text-fg` · `--xh-slider-value-text-font-size` · `--xh-slider-value-text-offset` · `--xh-slider-value-text-px` · `--xh-slider-value-text-py` · `--xh-slider-value-text-radius` · `--xh-slider-vertical-length`

## 动效

`box-shadow` · `opacity` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[数字输入](./number-field)并排，两边同步一个值。

## 最佳实践

- 两端标出最小与最大值，用户才知道自己在哪。
- 拖动时用值气泡显示当前值，松手后收起。

## 反模式

- 区间很大却不给数字输入：拖到某个精确值几乎不可能。
- 在移动端把滑块做得又细又短。
