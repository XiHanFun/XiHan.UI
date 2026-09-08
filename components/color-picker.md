来源：https://ui.docs.xihanfun.com/components/color-picker

# 颜色选择器 `color-picker`

选一个颜色：色域面板加通道滑块，另有预设色板与屏幕取色。

## 何时使用

- 用户要自由指定颜色（主题定制、标注、画布）。

## 何时不用

- 可选颜色是固定的几种：用[单选组](./radio-group)配色块，或[选择器](./select)。

## 特性

- 必备部件是 `root` · `content` · `saturation-area` · `area-thumb`，缺一个组件就不工作。
- `format` 决定值串写法；面板里也可以让用户自己切换写法。
- `alpha` 打开透明度通道。
- 支持屏幕取色（依赖平台能力）与数值输入。

## 示例

### 基础用法

必备部件是 trigger / content / saturation-area / area-thumb，缺一个组件就不工作

```vue
<script setup lang="ts">
import {
  XhColorPickerAreaThumb,
  XhColorPickerChannelSlider,
  XhColorPickerChannelSliderThumb,
  XhColorPickerChannelSliderTrack,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";
</script>

<template>
  <XhColorPickerRoot default-value="#00a98e">
    <XhColorPickerControl>
      <XhColorPickerTrigger>
        <XhColorPickerSwatch />
        <XhColorPickerValueText />
      </XhColorPickerTrigger>
    </XhColorPickerControl>
    <XhColorPickerPositioner>
      <XhColorPickerContent>
        <XhColorPickerSaturationArea>
          <XhColorPickerAreaThumb />
        </XhColorPickerSaturationArea>
        <XhColorPickerChannelSlider channel="hue">
          <XhColorPickerChannelSliderTrack />
          <XhColorPickerChannelSliderThumb />
        </XhColorPickerChannelSlider>
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
</template>
```

```html
<xh-color-picker default-value="#00a98e">
  <div data-xh-part="root">
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="swatch"></span>
        <span data-xh-part="value-text"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="saturation-area">
          <div data-xh-part="area-thumb"></div>
        </div>
        <div data-xh-part="channel-slider" channel="hue">
          <div data-xh-part="channel-slider-track"></div>
          <div data-xh-part="channel-slider-thumb"></div>
        </div>
      </div>
    </div>
  </div>
</xh-color-picker>
```

### 受控

传了 value 就由宿主说了算，取色只回写不自改

```vue
<script setup lang="ts">
import {
  XhColorPickerAreaThumb,
  XhColorPickerChannelSlider,
  XhColorPickerChannelSliderThumb,
  XhColorPickerChannelSliderTrack,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const color = ref("#3b82f6");
</script>

<template>
  <XhColorPickerRoot v-model:value="color">
    <XhColorPickerControl>
      <XhColorPickerTrigger>
        <XhColorPickerSwatch />
      </XhColorPickerTrigger>
    </XhColorPickerControl>
    <XhColorPickerPositioner>
      <XhColorPickerContent>
        <XhColorPickerSaturationArea>
          <XhColorPickerAreaThumb />
        </XhColorPickerSaturationArea>
        <XhColorPickerChannelSlider channel="hue">
          <XhColorPickerChannelSliderTrack />
          <XhColorPickerChannelSliderThumb />
        </XhColorPickerChannelSlider>
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
  <span>当前：{{ color }}</span>
</template>
```

```html
<xh-color-picker id="color-picker-controlled" value="#3b82f6">
  <div data-xh-part="root">
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="swatch"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="saturation-area">
          <div data-xh-part="area-thumb"></div>
        </div>
        <div data-xh-part="channel-slider" channel="hue">
          <div data-xh-part="channel-slider-track"></div>
          <div data-xh-part="channel-slider-thumb"></div>
        </div>
      </div>
    </div>
  </div>
</xh-color-picker>
<span>当前：<span id="color-picker-controlled-value">#3b82f6</span></span>

<script type="module">
  // 值由宿主握着：变更经事件回来，写回去才生效
  const picker = document.getElementById("color-picker-controlled");
  const readout = document.getElementById("color-picker-controlled-value");

  picker.addEventListener("value-change", (event) => {
    picker.value = event.detail.value;
    readout.textContent = event.detail.value;
  });
</script>
```

### 预设色板

swatches 给出常用色，选中即写回 value

```vue
<script setup lang="ts">
import {
  XhColorPickerAreaThumb,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerSwatchGroup,
  XhColorPickerSwatchItem,
  XhColorPickerTrigger,
} from "@xihan-ui/vue";

const swatches = ["#00a98e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];
</script>

<template>
  <XhColorPickerRoot default-value="#00a98e" :swatches="swatches">
    <XhColorPickerControl>
      <XhColorPickerTrigger>
        <XhColorPickerSwatch />
      </XhColorPickerTrigger>
    </XhColorPickerControl>
    <XhColorPickerPositioner>
      <XhColorPickerContent>
        <XhColorPickerSaturationArea>
          <XhColorPickerAreaThumb />
        </XhColorPickerSaturationArea>
        <XhColorPickerSwatchGroup>
          <XhColorPickerSwatchItem v-for="c in swatches" :key="c" :value="c" />
        </XhColorPickerSwatchGroup>
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
</template>
```

```html
<!-- 色板写成逗号分隔的一串 -->
<xh-color-picker
  default-value="#00a98e"
  swatches="#00a98e,#3b82f6,#f59e0b,#ef4444,#8b5cf6"
>
  <div data-xh-part="root">
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="swatch"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="saturation-area">
          <div data-xh-part="area-thumb"></div>
        </div>
        <div data-xh-part="swatch-group">
          <button data-xh-part="swatch-item" value="#00a98e"></button>
          <button data-xh-part="swatch-item" value="#3b82f6"></button>
          <button data-xh-part="swatch-item" value="#f59e0b"></button>
          <button data-xh-part="swatch-item" value="#ef4444"></button>
          <button data-xh-part="swatch-item" value="#8b5cf6"></button>
        </div>
      </div>
    </div>
  </div>
</xh-color-picker>
```

### 禁用

disabled 同时挡住触发器与面板内的所有交互

```vue
<script setup lang="ts">
import {
  XhColorPickerAreaThumb,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";
</script>

<template>
  <XhColorPickerRoot default-value="#9ca3af" disabled>
    <XhColorPickerControl>
      <XhColorPickerTrigger>
        <XhColorPickerSwatch />
        <XhColorPickerValueText />
      </XhColorPickerTrigger>
    </XhColorPickerControl>
    <XhColorPickerPositioner>
      <XhColorPickerContent>
        <XhColorPickerSaturationArea>
          <XhColorPickerAreaThumb />
        </XhColorPickerSaturationArea>
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
</template>
```

```html
<xh-color-picker default-value="#9ca3af" disabled>
  <div data-xh-part="root">
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="swatch"></span>
        <span data-xh-part="value-text"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="saturation-area">
          <div data-xh-part="area-thumb"></div>
        </div>
      </div>
    </div>
  </div>
</xh-color-picker>
```

### 透明度

alpha 打开后多一条透明度滑杆，值串跟着带上透明度；关掉时透明度恒是不透明，那条滑杆整条不可用

```vue
<script setup lang="ts">
import {
  XhColorPickerAreaThumb,
  XhColorPickerChannelSlider,
  XhColorPickerChannelSliderThumb,
  XhColorPickerChannelSliderTrack,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const overlay = ref("rgba(0, 169, 142, 0.6)");
</script>

<template>
  <XhColorPickerRoot v-model:value="overlay" format="rgba" alpha>
    <XhColorPickerLabel>蒙版颜色</XhColorPickerLabel>
    <XhColorPickerControl>
      <XhColorPickerTrigger>
        <XhColorPickerSwatch />
        <XhColorPickerValueText />
      </XhColorPickerTrigger>
    </XhColorPickerControl>
    <XhColorPickerPositioner>
      <XhColorPickerContent>
        <XhColorPickerSaturationArea>
          <XhColorPickerAreaThumb />
        </XhColorPickerSaturationArea>
        <XhColorPickerChannelSlider channel="hue">
          <XhColorPickerChannelSliderTrack />
          <XhColorPickerChannelSliderThumb />
        </XhColorPickerChannelSlider>
        <XhColorPickerChannelSlider channel="alpha">
          <XhColorPickerChannelSliderTrack />
          <XhColorPickerChannelSliderThumb />
        </XhColorPickerChannelSlider>
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
</template>
```

```html
<xh-color-picker id="color-picker-alpha" format="rgba" alpha>
  <div data-xh-part="root">
    <label data-xh-part="label">蒙版颜色</label>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="swatch"></span>
        <span data-xh-part="value-text"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="saturation-area">
          <div data-xh-part="area-thumb"></div>
        </div>
        <div data-xh-part="channel-slider" channel="hue">
          <div data-xh-part="channel-slider-track"></div>
          <div data-xh-part="channel-slider-thumb"></div>
        </div>
        <div data-xh-part="channel-slider" channel="alpha">
          <div data-xh-part="channel-slider-track"></div>
          <div data-xh-part="channel-slider-thumb"></div>
        </div>
      </div>
    </div>
  </div>
</xh-color-picker>

<script type="module">
  // 值由宿主握着：变更经事件回来，写回去才生效
  const picker = document.getElementById("color-picker-alpha");

  picker.value = "rgba(0, 169, 142, 0.6)";
  picker.addEventListener("value-change", (event) => {
    picker.value = event.detail.value;
  });
</script>
```

### 值串写法

format 只决定对外的序列化，工作色始终是同一套；三种写法各挑一个色，改动后按各自的写法产出

```vue
<script setup lang="ts">
import {
  XhColorPickerAreaThumb,
  XhColorPickerChannelSlider,
  XhColorPickerChannelSliderThumb,
  XhColorPickerChannelSliderTrack,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";

const cases = [
  { format: "hex", value: "#00a98e" },
  { format: "rgba", value: "rgba(59, 130, 246, 1)" },
  { format: "hsla", value: "hsla(38, 92%, 50%, 1)" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhColorPickerRoot
      v-for="item in cases"
      :key="item.format"
      :format="item.format"
      :default-value="item.value"
    >
      <XhColorPickerLabel>{{ item.format }}</XhColorPickerLabel>
      <XhColorPickerControl>
        <XhColorPickerTrigger>
          <XhColorPickerSwatch />
          <XhColorPickerValueText />
        </XhColorPickerTrigger>
      </XhColorPickerControl>
      <XhColorPickerPositioner>
        <XhColorPickerContent>
          <XhColorPickerSaturationArea>
            <XhColorPickerAreaThumb />
          </XhColorPickerSaturationArea>
          <XhColorPickerChannelSlider channel="hue">
            <XhColorPickerChannelSliderTrack />
            <XhColorPickerChannelSliderThumb />
          </XhColorPickerChannelSlider>
        </XhColorPickerContent>
      </XhColorPickerPositioner>
    </XhColorPickerRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-color-picker format="hex" default-value="#00a98e">
    <div data-xh-part="root">
      <label data-xh-part="label">hex</label>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="swatch"></span>
          <span data-xh-part="value-text"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="saturation-area">
            <div data-xh-part="area-thumb"></div>
          </div>
          <div data-xh-part="channel-slider" channel="hue">
            <div data-xh-part="channel-slider-track"></div>
            <div data-xh-part="channel-slider-thumb"></div>
          </div>
        </div>
      </div>
    </div>
  </xh-color-picker>

  <xh-color-picker format="rgba" default-value="rgba(59, 130, 246, 1)">
    <div data-xh-part="root">
      <label data-xh-part="label">rgba</label>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="swatch"></span>
          <span data-xh-part="value-text"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="saturation-area">
            <div data-xh-part="area-thumb"></div>
          </div>
          <div data-xh-part="channel-slider" channel="hue">
            <div data-xh-part="channel-slider-track"></div>
            <div data-xh-part="channel-slider-thumb"></div>
          </div>
        </div>
      </div>
    </div>
  </xh-color-picker>

  <xh-color-picker format="hsla" default-value="hsla(38, 92%, 50%, 1)">
    <div data-xh-part="root">
      <label data-xh-part="label">hsla</label>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="swatch"></span>
          <span data-xh-part="value-text"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="saturation-area">
            <div data-xh-part="area-thumb"></div>
          </div>
          <div data-xh-part="channel-slider" channel="hue">
            <div data-xh-part="channel-slider-track"></div>
            <div data-xh-part="channel-slider-thumb"></div>
          </div>
        </div>
      </div>
    </div>
  </xh-color-picker>
</div>
```

### 数值输入与屏幕取色

四个数值框各管一路，回车才收下，收不下的留着草稿并标红；宿主环境没有取色接口时那个按钮自己禁用

```vue
<script setup lang="ts">
import {
  XhColorPickerAreaThumb,
  XhColorPickerChannelInput,
  XhColorPickerChannelSlider,
  XhColorPickerChannelSliderThumb,
  XhColorPickerChannelSliderTrack,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerEyeDropperTrigger,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";

const inputRow = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 1fr",
  gap: "6px",
};

// 取色按钮里只有一个符号，读屏念的名字从这里来
const translations = {
  eyeDropperTrigger: "从屏幕上取色",
};
</script>

<template>
  <XhColorPickerRoot default-value="#3b82f6" :translations="translations">
    <XhColorPickerLabel>品牌色</XhColorPickerLabel>
    <XhColorPickerControl>
      <XhColorPickerTrigger>
        <XhColorPickerSwatch />
        <XhColorPickerValueText />
      </XhColorPickerTrigger>
    </XhColorPickerControl>
    <XhColorPickerPositioner>
      <XhColorPickerContent>
        <XhColorPickerSaturationArea>
          <XhColorPickerAreaThumb />
        </XhColorPickerSaturationArea>
        <div style="display: flex; align-items: center; gap: 8px">
          <XhColorPickerEyeDropperTrigger>◎</XhColorPickerEyeDropperTrigger>
          <XhColorPickerChannelSlider channel="hue" style="flex: 1">
            <XhColorPickerChannelSliderTrack />
            <XhColorPickerChannelSliderThumb />
          </XhColorPickerChannelSlider>
        </div>
        <div :style="inputRow">
          <XhColorPickerChannelInput channel="hex" />
          <XhColorPickerChannelInput channel="r" />
          <XhColorPickerChannelInput channel="g" />
          <XhColorPickerChannelInput channel="b" />
        </div>
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
</template>
```

```html
<xh-color-picker id="color-picker-inputs" default-value="#3b82f6">
  <div data-xh-part="root">
    <label data-xh-part="label">品牌色</label>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="swatch"></span>
        <span data-xh-part="value-text"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="saturation-area">
          <div data-xh-part="area-thumb"></div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px">
          <button data-xh-part="eye-dropper-trigger">◎</button>
          <div data-xh-part="channel-slider" channel="hue" style="flex: 1">
            <div data-xh-part="channel-slider-track"></div>
            <div data-xh-part="channel-slider-thumb"></div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 6px">
          <input data-xh-part="channel-input" channel="hex" />
          <input data-xh-part="channel-input" channel="r" />
          <input data-xh-part="channel-input" channel="g" />
          <input data-xh-part="channel-input" channel="b" />
        </div>
      </div>
    </div>
  </div>
</xh-color-picker>

<script type="module">
  // 取色按钮里只有一个符号，读屏念的名字从这里来
  document.getElementById("color-picker-inputs").translations = {
    eyeDropperTrigger: "从屏幕上取色",
  };
</script>
```

### 空态与面板按钮

受控时「没有颜色」由宿主表达：值置空，触发器换成占位方框；面板底下的两个按钮是作者自己的，收起浮层同样归宿主

```vue
<script setup lang="ts">
import {
  XhButton,
  XhColorPickerAreaThumb,
  XhColorPickerChannelSlider,
  XhColorPickerChannelSliderThumb,
  XhColorPickerChannelSliderTrack,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const color = ref("#3b82f6");

function clear(setOpen: (next: boolean) => void) {
  color.value = "";
  setOpen(false);
}

const placeholder = {
  display: "inline-flex",
  flex: "none",
  alignItems: "center",
  justifyContent: "center",
  inlineSize: "1.125rem",
  blockSize: "1.125rem",
  border: "1px dashed var(--xh-border-strong)",
  borderRadius: "var(--xh-radius-sm)",
  fontSize: "10px",
  color: "var(--xh-fg-muted)",
};

const actions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
};
</script>

<template>
  <div style="display: grid; gap: 12px">
    <XhColorPickerRoot v-slot="{ setOpen }" v-model:value="color">
      <XhColorPickerLabel>主题色</XhColorPickerLabel>
      <XhColorPickerControl>
        <XhColorPickerTrigger>
          <XhColorPickerSwatch v-if="color" />
          <span v-else :style="placeholder">∅</span>
          <XhColorPickerValueText>{{ color || "未设置" }}</XhColorPickerValueText>
        </XhColorPickerTrigger>
      </XhColorPickerControl>
      <XhColorPickerPositioner>
        <XhColorPickerContent>
          <XhColorPickerSaturationArea>
            <XhColorPickerAreaThumb />
          </XhColorPickerSaturationArea>
          <XhColorPickerChannelSlider channel="hue">
            <XhColorPickerChannelSliderTrack />
            <XhColorPickerChannelSliderThumb />
          </XhColorPickerChannelSlider>
          <div :style="actions">
            <XhButton size="sm" variant="ghost" @click="clear(setOpen)">
              清空
            </XhButton>
            <XhButton size="sm" @click="setOpen(false)">确定</XhButton>
          </div>
        </XhColorPickerContent>
      </XhColorPickerPositioner>
    </XhColorPickerRoot>

    <span>当前：{{ color || "未设置" }}</span>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <xh-color-picker id="color-picker-clearable" value="#3b82f6" open="false">
    <div data-xh-part="root">
      <label data-xh-part="label">主题色</label>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="swatch"></span>
          <span
            id="color-picker-clearable-blank"
            style="
              display: none;
              flex: none;
              align-items: center;
              justify-content: center;
              inline-size: 1.125rem;
              block-size: 1.125rem;
              border: 1px dashed var(--xh-border-strong);
              border-radius: var(--xh-radius-sm);
              font-size: 10px;
              color: var(--xh-fg-muted);
            "
            >∅</span
          >
          <span data-xh-part="value-text">#3b82f6</span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="saturation-area">
            <div data-xh-part="area-thumb"></div>
          </div>
          <div data-xh-part="channel-slider" channel="hue">
            <div data-xh-part="channel-slider-track"></div>
            <div data-xh-part="channel-slider-thumb"></div>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 8px">
            <xh-button size="sm" variant="ghost">
              <button data-xh-part="root" id="color-picker-clearable-clear">
                清空
              </button>
            </xh-button>
            <xh-button size="sm">
              <button data-xh-part="root" id="color-picker-clearable-ok">
                确定
              </button>
            </xh-button>
          </div>
        </div>
      </div>
    </div>
  </xh-color-picker>

  <span>当前：<span id="color-picker-clearable-readout">#3b82f6</span></span>
</div>

<script type="module">
  // 值与开合都由宿主握着：变更经事件回来，写回去才生效
  const picker = document.getElementById("color-picker-clearable");
  const swatch = picker.querySelector('[data-xh-part="swatch"]');
  const blank = document.getElementById("color-picker-clearable-blank");
  const text = picker.querySelector('[data-xh-part="value-text"]');
  const readout = document.getElementById("color-picker-clearable-readout");

  function paint(color) {
    swatch.style.display = color ? "" : "none";
    blank.style.display = color ? "none" : "inline-flex";
    text.textContent = color || "未设置";
    readout.textContent = color || "未设置";
  }

  picker.addEventListener("value-change", (event) => {
    picker.value = event.detail.value;
    paint(event.detail.value);
  });

  picker.addEventListener("open-change", (event) => {
    picker.open = event.detail.open;
  });

  document
    .getElementById("color-picker-clearable-clear")
    .addEventListener("click", () => {
      picker.value = "";
      picker.open = false;
      paint("");
    });

  document
    .getElementById("color-picker-clearable-ok")
    .addEventListener("click", () => {
      picker.open = false;
    });
</script>
```

### 随表单提交

值串的表单出口由作者自己挂：把当前值写进一份 input[type=hidden] 就带得走；浮层就地渲染，节点始终留在 form 里

```vue
<script setup lang="ts">
import {
  XhButton,
  XhColorPickerAreaThumb,
  XhColorPickerChannelSlider,
  XhColorPickerChannelSliderThumb,
  XhColorPickerChannelSliderTrack,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const submitted = ref("");

function onSubmit(event: Event) {
  const data = new FormData(event.target as HTMLFormElement);
  submitted.value = String(data.get("brandColor") ?? "");
}
</script>

<template>
  <form style="display: grid; gap: 12px" @submit.prevent="onSubmit">
    <XhColorPickerRoot v-slot="{ value }" default-value="#00a98e">
      <XhColorPickerLabel>品牌色</XhColorPickerLabel>
      <XhColorPickerControl>
        <XhColorPickerTrigger>
          <XhColorPickerSwatch />
          <XhColorPickerValueText />
        </XhColorPickerTrigger>
      </XhColorPickerControl>
      <input type="hidden" name="brandColor" :value="value">
      <XhColorPickerPositioner>
        <XhColorPickerContent>
          <XhColorPickerSaturationArea>
            <XhColorPickerAreaThumb />
          </XhColorPickerSaturationArea>
          <XhColorPickerChannelSlider channel="hue">
            <XhColorPickerChannelSliderTrack />
            <XhColorPickerChannelSliderThumb />
          </XhColorPickerChannelSlider>
        </XhColorPickerContent>
      </XhColorPickerPositioner>
    </XhColorPickerRoot>

    <div>
      <XhButton type="submit" size="sm">提交</XhButton>
    </div>

    <span v-if="submitted">表单收到：{{ submitted }}</span>
  </form>
</template>
```

```html
<form id="color-picker-form" style="display: grid; gap: 12px">
  <xh-color-picker id="color-picker-form-picker" default-value="#00a98e">
    <div data-xh-part="root">
      <label data-xh-part="label">品牌色</label>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="swatch"></span>
          <span data-xh-part="value-text"></span>
        </button>
      </div>
      <input type="hidden" name="brandColor" value="#00a98e" />
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="saturation-area">
            <div data-xh-part="area-thumb"></div>
          </div>
          <div data-xh-part="channel-slider" channel="hue">
            <div data-xh-part="channel-slider-track"></div>
            <div data-xh-part="channel-slider-thumb"></div>
          </div>
        </div>
      </div>
    </div>
  </xh-color-picker>

  <div>
    <xh-button type="submit" size="sm">
      <button data-xh-part="root">提交</button>
    </xh-button>
  </div>

  <span id="color-picker-form-result" style="display: none"></span>
</form>

<script type="module">
  // 当前值跟着写进隐藏字段，提交时由 FormData 带走
  const form = document.getElementById("color-picker-form");
  const picker = document.getElementById("color-picker-form-picker");
  const field = form.querySelector('input[name="brandColor"]');
  const result = document.getElementById("color-picker-form-result");

  picker.addEventListener("value-change", (event) => {
    field.value = event.detail.value;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    result.style.display = "";
    result.textContent = `表单收到：${new FormData(form).get("brandColor") ?? ""}`;
  });
</script>
```

### 面板里切换写法

format 只管对外的序列化：换过之后把当前值原样写回一次，值串就改按新写法产出，工作色一点不动

```vue
<script setup lang="ts">
import {
  XhButton,
  XhColorPickerAreaThumb,
  XhColorPickerChannelSlider,
  XhColorPickerChannelSliderThumb,
  XhColorPickerChannelSliderTrack,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";
import { nextTick, ref } from "vue";

type Format = "hex" | "rgba" | "hsla";

const formats: Format[] = ["hex", "rgba", "hsla"];

const format = ref<Format>("hex");
const color = ref("#3b82f6");

async function applyFormat(next: Format, setValue: (value: string) => void) {
  format.value = next;
  // 等新写法落到组件上，再把当前值原样写回一次
  await nextTick();
  setValue(color.value);
}

const modes = {
  display: "flex",
  gap: "6px",
};
</script>

<template>
  <div style="display: grid; gap: 12px">
    <XhColorPickerRoot
      v-slot="{ setValue }"
      v-model:value="color"
      :format="format"
    >
      <XhColorPickerLabel>强调色</XhColorPickerLabel>
      <XhColorPickerControl>
        <XhColorPickerTrigger>
          <XhColorPickerSwatch />
          <XhColorPickerValueText />
        </XhColorPickerTrigger>
      </XhColorPickerControl>
      <XhColorPickerPositioner>
        <XhColorPickerContent>
          <XhColorPickerSaturationArea>
            <XhColorPickerAreaThumb />
          </XhColorPickerSaturationArea>
          <XhColorPickerChannelSlider channel="hue">
            <XhColorPickerChannelSliderTrack />
            <XhColorPickerChannelSliderThumb />
          </XhColorPickerChannelSlider>
          <div :style="modes">
            <XhButton
              v-for="item in formats"
              :key="item"
              size="sm"
              :variant="item === format ? 'solid' : 'ghost'"
              @click="applyFormat(item, setValue)"
            >
              {{ item }}
            </XhButton>
          </div>
        </XhColorPickerContent>
      </XhColorPickerPositioner>
    </XhColorPickerRoot>

    <span>当前：{{ color }}</span>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <xh-color-picker id="color-picker-format-switch" format="hex" value="#3b82f6">
    <div data-xh-part="root">
      <label data-xh-part="label">强调色</label>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="swatch"></span>
          <span data-xh-part="value-text"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="saturation-area">
            <div data-xh-part="area-thumb"></div>
          </div>
          <div data-xh-part="channel-slider" channel="hue">
            <div data-xh-part="channel-slider-track"></div>
            <div data-xh-part="channel-slider-thumb"></div>
          </div>
          <!-- 三个写法钮：当前那个实心，其余幽灵 -->
          <div id="color-picker-format-switch-modes" style="display: flex; gap: 6px">
            <xh-button size="sm" variant="solid" data-format="hex">
              <button data-xh-part="root">hex</button>
            </xh-button>
            <xh-button size="sm" variant="ghost" data-format="rgba">
              <button data-xh-part="root">rgba</button>
            </xh-button>
            <xh-button size="sm" variant="ghost" data-format="hsla">
              <button data-xh-part="root">hsla</button>
            </xh-button>
          </div>
        </div>
      </div>
    </div>
  </xh-color-picker>

  <span>当前：<span id="color-picker-format-switch-value">#3b82f6</span></span>
</div>

<script type="module">
  const picker = document.getElementById("color-picker-format-switch");
  const readout = document.getElementById("color-picker-format-switch-value");
  const modes = document.getElementById("color-picker-format-switch-modes");

  // 值由宿主握着：变更经事件回来，写回去才生效
  picker.addEventListener("value-change", (event) => {
    picker.value = event.detail.value;
    readout.textContent = event.detail.value;
  });

  modes.addEventListener("click", (event) => {
    const pressed = event.target.closest("xh-button");
    if (!pressed) {
      return;
    }
    // 先换写法，再把当前值原样写回一次：落值那一刻才按新写法序列化
    picker.format = pressed.dataset.format;
    picker.setValue(picker.value);
    for (const item of modes.children) {
      item.variant = item === pressed ? "solid" : "ghost";
    }
  });
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-color-picker>` |
| Vue 组件 | `XhColorPickerAreaThumb` `XhColorPickerChannelInput` `XhColorPickerChannelSlider` `XhColorPickerChannelSliderThumb` `XhColorPickerChannelSliderTrack` `XhColorPickerContent` `XhColorPickerControl` `XhColorPickerEyeDropperTrigger` `XhColorPickerHiddenInput` `XhColorPickerLabel` `XhColorPickerPositioner` `XhColorPickerRoot` `XhColorPickerSaturationArea` `XhColorPickerSwatch` `XhColorPickerSwatchGroup` `XhColorPickerSwatchItem` `XhColorPickerTrigger` `XhColorPickerValueText` |
| 组合式函数 | `useColorPicker` |
| 状态机 | `colorPickerMachine` |
| 皮肤 | `@xihan-ui/styles/color-picker.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="color-picker"`：`root` · `label` · `control` · **`trigger`** · `value-text` · `swatch` · `positioner` · **`content`** · **`saturation-area`** · **`area-thumb`** · `channel-slider` · `channel-slider-track` · `channel-slider-thumb` · `channel-input` · `eye-dropper-trigger` · `swatch-group` · `swatch-item` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 颜色值串。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string` |  |  |
| `format` | `ColorPickerFormat` |  | 值串的写法，默认 hex。改它只改对外的序列化，工作色恒是 HSVA。 |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `disabled` | `boolean` |  | 整个控件禁用：trigger 与两个按钮走原生 disabled，取色区与滑杆退出 Tab 序列。 |
| `readOnly` | `boolean` |  | 只读：浮层照开（看得见当前颜色），但任何改值的动作都不发生。 |
| `swatches` | `string[]` |  | 预设色板。作者据此渲染 swatch-item，组件只负责标出哪一格正被选中。 |
| `name` | `string` |  | 表单字段名；给了表单影子才带 name 并参与提交。 |
| `alpha` | `boolean` |  | 带透明度，默认关。关掉时值串恒不透明，透明度那条滑杆与输入框整条禁用。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `dir` | `Direction` |  | 文字方向。只改写横轴（取色区的饱和度、通道滑杆）上左右两键与指针的语义。 |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `translations` | `Partial<ColorPickerTranslations>` |  |  |
| `onValueChange` | `(details: ColorPickerValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onOpenChange` | `(details: ColorPickerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ColorPickerValueChangeDetails` | 颜色变化；detail 为 `{ value: string }` |
| `open-change` | `ColorPickerOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhColorPickerRoot` | `default` | `ColorPickerRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `positioner` | 'open' \| 'closed' |
| `eye-dropper-trigger` | 'picking' \| 'open' \| 'closed' |
| `swatch-item` | 'checked' \| 'unchecked' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`closed` · `open` · `open.idle` · `open.dragging` · `open.picking`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `AREA.SET` · `AREA.STEP` · `AREA.TO_EDGE` · `CHANNEL.SET` · `CHANNEL.STEP` · `CHANNEL.TO_EDGE` · `INPUT.CHANGE` · `INPUT.COMMIT` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `EYE_DROPPER.OPEN` · `EYE_DROPPER.RESULT` · `EYE_DROPPER.CANCEL` · `FORM.RESET`

**判据**：`isOpenControlled` · `canInteract` · `canPick`

## connect API

`useColorPicker` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `value` | `string` | 当前值串（与 onValueChange 送出的是同一个）。 |
| `rgba` | `ColorPickerRgba` |  |
| `hsva` | `ColorPickerHsva` | 工作色。取色区与色相滑杆读的都是它。 |
| `format` | `ColorPickerFormat` |  |
| `alpha` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `dragging` | `boolean` | 指针正拖着某一处。 |
| `picking` | `boolean` | 屏幕取色正在进行。 |
| `eyeDropperSupported` | `boolean` |  |
| `swatches` | `string[]` | 预设色板（原样透传 swatches prop，缺省是空数组）。 |
| `isSwatchSelected` | `(value: string) => boolean` |  |
| `channelState` | `(channel: ColorPickerChannel) => ColorPickerChannelState` |  |
| `inputText` | `(channel: ColorPickerInputChannel) => string` | 某个数值框此刻该显示的字（有草稿显示草稿，否则显示规范文本）。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getValueTextProps` | `() => T['element']` |  |
| `getSwatchProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getSaturationAreaProps` | `() => T['element']` |  |
| `getAreaThumbProps` | `() => T['element']` |  |
| `getChannelSliderProps` | `(props: ColorPickerChannelProps) => T['element']` |  |
| `getChannelSliderTrackProps` | `(props: ColorPickerChannelProps) => T['element']` |  |
| `getChannelSliderThumbProps` | `(props: ColorPickerChannelProps) => T['element']` |  |
| `getChannelInputProps` | `(props: ColorPickerInputProps) => T['input']` |  |
| `getEyeDropperTriggerProps` | `() => T['button']` |  |
| `getSwatchGroupProps` | `() => T['element']` |  |
| `getSwatchItemProps` | `(props: ColorPickerSwatchItemProps) => T['button']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单影子：值随表单提交。给了 name 才带 name，不给就不参与提交。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowLeft` | focus in area-thumb, not disabled/readOnly | 按 1 调饱和度；RTL 下左右对调，语义恒是"朝饱和走一格" |
| `ArrowUp` / `ArrowDown` | focus in area-thumb, not disabled/readOnly | 按 1 调明度，屏幕向上恒是变亮，与 dir 无关 |
| `Shift+ArrowRight` / `Shift+ArrowLeft` / `Shift+ArrowUp` / `Shift+ArrowDown` | focus in area-thumb, not disabled/readOnly | 同上，但一步走 10 |
| `Home` / `End` | focus in area-thumb, not disabled/readOnly | 饱和度取 0 / 100（与 aria-valuenow 报的是同一条轴） |
| `ArrowRight` / `ArrowLeft` / `ArrowUp` / `ArrowDown` | focus in channel-slider-thumb, channel enabled | 按 1 调该通道；RTL 下左右对调，上下恒是"朝 max 走" |
| `Shift+ArrowRight` / `Shift+ArrowLeft` / `Shift+ArrowUp` / `Shift+ArrowDown` | focus in channel-slider-thumb, channel enabled | 同上，但一步走 10 |
| `Home` / `End` | focus in channel-slider-thumb, channel enabled | 该通道取 min / max（色相 0-360，透明度 0-100） |
| `Enter` | focus in channel-input | 收下框里的字；收不了（打了一半）就复原成规范文本。一并拦住表单提交 |
| `Escape` | open（本层在层栈顶） | 收起浮层，焦点归还触发器 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `trigger` | `aria-labelledby` | `label` 部件的 id `value-text` 部件的 id |
| `swatch` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | `label` 部件的 id |
| `content` | `aria-modal` | 'false' |
| `content` | `role` | 'dialog' |
| `area-thumb` | `aria-disabled` | 'true' \| 'false' |
| `area-thumb` | `aria-label` | label.area |
| `area-thumb` | `aria-valuemax` | '100' |
| `area-thumb` | `aria-valuemin` | '0' |
| `area-thumb` | `aria-valuenow` | String(Math.round(hsva.s)) |
| `area-thumb` | `aria-valuetext` | label.areaValueText(Math.round(hsva.s), Math.round(hs… |
| `area-thumb` | `role` | 'slider' |
| `channel-slider-thumb` | `aria-disabled` | 'true' \| 'false' |
| `channel-slider-thumb` | `aria-label` | label.channel(channel) |
| `channel-slider-thumb` | `aria-orientation` | 'horizontal' |
| `channel-slider-thumb` | `aria-valuemax` | String(info.max) |
| `channel-slider-thumb` | `aria-valuemin` | String(info.min) |
| `channel-slider-thumb` | `aria-valuenow` | String(info.value) |
| `channel-slider-thumb` | `aria-valuetext` | label.channelValueText(channel, info.value) |
| `channel-slider-thumb` | `role` | 'slider' |
| `channel-input` | `aria-invalid` | 'true' \| 'false' |
| `channel-input` | `aria-label` | label.input(channel) |
| `eye-dropper-trigger` | `aria-label` | label.eyeDropperTrigger |
| `swatch-group` | `aria-label` | label.swatchGroup |
| `swatch-group` | `role` | 'group' |
| `swatch-item` | `aria-label` | label.swatch(swatch) |
| `swatch-item` | `aria-pressed` | 'true' \| 'false' |

## 样式

默认皮肤 `@xihan-ui/styles/color-picker.css` 按部件选择：`[data-scope="color-picker"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `swatch` | `data-value` | context.get('value') |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `saturation-area` | `data-dragging` | ''（条件成立时才出现） |
| `area-thumb` | `data-dragging` | ''（条件成立时才出现） |
| `channel-slider` | `data-channel` | channel |
| `channel-slider` | `data-disabled` | ''（条件成立时才出现） |
| `channel-slider` | `data-dragging` | ''（条件成立时才出现） |
| `channel-slider-track` | `data-channel` | channel |
| `channel-slider-track` | `data-disabled` | ''（条件成立时才出现） |
| `channel-slider-thumb` | `data-channel` | channel |
| `channel-slider-thumb` | `data-disabled` | ''（条件成立时才出现） |
| `channel-slider-thumb` | `data-dragging` | ''（条件成立时才出现） |
| `channel-input` | `data-channel` | channel |
| `channel-input` | `data-invalid` | ''（条件成立时才出现） |
| `eye-dropper-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `eye-dropper-trigger` | `data-state` | 'picking' \| 'open' \| 'closed' |
| `swatch-item` | `data-disabled` | ''（条件成立时才出现） |
| `swatch-item` | `data-state` | 'checked' \| 'unchecked' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-color-picker-action-bg` · `--xh-color-picker-action-bg-active` · `--xh-color-picker-action-bg-hover` · `--xh-color-picker-action-border` · `--xh-color-picker-action-border-active` · `--xh-color-picker-action-fg` · `--xh-color-picker-action-fg-hover` · `--xh-color-picker-action-font-size` · `--xh-color-picker-action-radius` · `--xh-color-picker-action-size` · `--xh-color-picker-checker` · `--xh-color-picker-content-bg` · `--xh-color-picker-content-border` · `--xh-color-picker-content-fg` · `--xh-color-picker-content-gap` · `--xh-color-picker-content-px` · `--xh-color-picker-content-py` · `--xh-color-picker-content-radius` · `--xh-color-picker-content-shadow` · `--xh-color-picker-content-w` · `--xh-color-picker-control-bg` · `--xh-color-picker-control-bg-disabled` · `--xh-color-picker-control-bg-hover` · `--xh-color-picker-control-bg-readonly` · `--xh-color-picker-control-border` · `--xh-color-picker-control-border-focus` · `--xh-color-picker-control-border-hover` · `--xh-color-picker-control-fg` · `--xh-color-picker-control-gap` · `--xh-color-picker-control-h` · `--xh-color-picker-control-min-w` · `--xh-color-picker-control-px` · `--xh-color-picker-control-radius` · `--xh-color-picker-control-shadow` · `--xh-color-picker-gap` · `--xh-color-picker-input-bg` · `--xh-color-picker-input-bg-disabled` · `--xh-color-picker-input-bg-readonly` · `--xh-color-picker-input-border` · `--xh-color-picker-input-border-focus` · `--xh-color-picker-input-border-invalid` · `--xh-color-picker-input-font-size` · `--xh-color-picker-input-h` · `--xh-color-picker-input-px` · `--xh-color-picker-input-radius` · `--xh-color-picker-label-fg` · `--xh-color-picker-label-font-size` · `--xh-color-picker-label-font-weight` · `--xh-color-picker-layer` · `--xh-color-picker-max-h` · `--xh-color-picker-saturation-area-h` · `--xh-color-picker-saturation-area-radius` · `--xh-color-picker-swatch-border` · `--xh-color-picker-swatch-border-hover` · `--xh-color-picker-swatch-gap` · `--xh-color-picker-swatch-item-size` · `--xh-color-picker-swatch-radius` · `--xh-color-picker-swatch-ring` · `--xh-color-picker-swatch-size` · `--xh-color-picker-thumb-border` · `--xh-color-picker-thumb-radius` · `--xh-color-picker-thumb-scale-dragging` · `--xh-color-picker-thumb-shadow` · `--xh-color-picker-thumb-size` · `--xh-color-picker-track-radius` · `--xh-color-picker-track-thickness` · `--xh-color-picker-trigger-fg` · `--xh-color-picker-trigger-font-size` · `--xh-color-picker-trigger-gap` · `--xh-color-picker-value-fg` · `--xh-color-picker-value-font-size`

## 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 外面套[表单字段](./field)；预设色板走 `swatches`。

## 最佳实践

- 提供预设色板：绝大多数用户不需要在色域里精挑。
- 回显时同时给色块和色值串，色块用来看、值串用来复制。

## 反模式

- 只给色域不给数值输入：用户手上有确切色值时无处可填。
- 在需要满足对比度的场景里放任意取色而不给对比度提示。
