来源：https://ui.docs.xihanfun.com/components/color-picker

# ColorPicker 颜色选择器

在色域中自由选取一个颜色：触发按钮显示当前色，浮层内包含取色面、色相与透明度两条滑块、数值框、屏幕取色与预设色板。它是颜色家族的组合件：两条滑块是[颜色滑块](./color-slider)，预设色板是[颜色色块选择器](./color-swatch-picker)，触发按钮内的色块与[颜色色块](./color-swatch)同族；只需要其中一件时不使用完整的选择器。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/color-picker" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/color-picker.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/color-picker" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/color-picker" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/color-picker.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

取色面选择饱和度与明度，下方一条色相滑块；滑块是内嵌的颜色滑块组件，Vue / React 的挂载点不写子节点即自动铺开

```vue
<script setup lang="ts">
import {
  XhColorPickerAreaThumb,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerHueSlider,
  XhColorPickerLabel,
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
        <XhColorPickerHueSlider />
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
</template>
```

```html
<!-- 自定义元素不替作者建节点：挂载点里写的是 color-slider 自己的 control / track / thumb -->
<xh-color-picker default-value="#00a98e">
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
        <div data-xh-part="hue-slider">
          <div data-xh-part="control">
            <div data-xh-part="track"></div>
            <div data-xh-part="thumb"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-color-picker>
```

## 组件结构

加粗的是必需部件。

`data-scope="color-picker"`：`root` · `label` · `control` · `tag-list` · `trigger` · `value-text` · `swatch` · `positioner` · **`content`** · **`saturation-area`** · **`area-thumb`** · `hue-slider` · `alpha-slider` · `channel-input` · `eye-dropper-trigger` · `swatch-picker` · `recent-swatch-picker` · `confirm-trigger` · `hidden-input`

## 示例

### 预设色板

swatches 提供一组常用颜色，浮层中内嵌一台色块选择器：方向键在格子间移动、按颜色比较选中

```vue
<script setup lang="ts">
import {
  XhColorPickerAreaThumb,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerSwatchPicker,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";

const swatches = ["#00a98e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];
</script>

<template>
  <XhColorPickerRoot default-value="#00a98e" :swatches="swatches">
    <XhColorPickerLabel>主题色</XhColorPickerLabel>
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
        <XhColorPickerSwatchPicker />
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
</template>
```

```html
<!-- 挂载点顶替色板的 root；每格是 color-swatch-picker 的 item，色块面、选中标记与表单影子由作者手写 -->
<xh-color-picker
  default-value="#00a98e"
  swatches="#00a98e,#3b82f6,#f59e0b,#ef4444,#8b5cf6"
>
  <div data-xh-part="root">
    <label data-xh-part="label">主题色</label>
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
        <div data-xh-part="swatch-picker">
          <div data-xh-part="item" value="#00a98e">
            <input data-xh-part="hidden-input" />
            <span data-xh-part="swatch"></span>
            <span data-xh-part="indicator"></span>
          </div>
          <div data-xh-part="item" value="#3b82f6">
            <input data-xh-part="hidden-input" />
            <span data-xh-part="swatch"></span>
            <span data-xh-part="indicator"></span>
          </div>
          <div data-xh-part="item" value="#f59e0b">
            <input data-xh-part="hidden-input" />
            <span data-xh-part="swatch"></span>
            <span data-xh-part="indicator"></span>
          </div>
          <div data-xh-part="item" value="#ef4444">
            <input data-xh-part="hidden-input" />
            <span data-xh-part="swatch"></span>
            <span data-xh-part="indicator"></span>
          </div>
          <div data-xh-part="item" value="#8b5cf6">
            <input data-xh-part="hidden-input" />
            <span data-xh-part="swatch"></span>
            <span data-xh-part="indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-color-picker>
```

### 禁用

禁止更改颜色

```vue
<script setup lang="ts">
import {
  XhColorPickerAreaThumb,
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
</script>

<template>
  <XhColorPickerRoot default-value="#9ca3af" disabled>
    <XhColorPickerLabel>主题色</XhColorPickerLabel>
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
    <label data-xh-part="label">主题色</label>
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

alpha 开启后值串带透明度，浮层中多一条透明度滑块；两条滑块共用同一份工作色，调节色相不会把透明度归 1

```vue
<script setup lang="ts">
import {
  XhColorPickerAlphaSlider,
  XhColorPickerAreaThumb,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerHueSlider,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";
</script>

<template>
  <XhColorPickerRoot default-value="rgba(0, 169, 142, 0.6)" format="rgba" alpha>
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
        <XhColorPickerHueSlider />
        <XhColorPickerAlphaSlider />
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
</template>
```

```html
<xh-color-picker default-value="rgba(0, 169, 142, 0.6)" format="rgba" alpha>
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
        <div data-xh-part="hue-slider">
          <div data-xh-part="control">
            <div data-xh-part="track"></div>
            <div data-xh-part="thumb"></div>
          </div>
        </div>
        <div data-xh-part="alpha-slider">
          <div data-xh-part="control">
            <div data-xh-part="track"></div>
            <div data-xh-part="thumb"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-color-picker>
```

### 精确输入

输入色值或使用屏幕取色

```vue
<script setup lang="ts">
import { PipetteIcon } from "@xihan-ui/icons";
import {
  XhColorPickerAreaThumb,
  XhColorPickerChannelInput,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerEyeDropperTrigger,
  XhColorPickerHueSlider,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
  XhIcon,
} from "@xihan-ui/vue";

const inputRow = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 1fr",
  gap: "6px",
};

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
          <XhColorPickerEyeDropperTrigger><XhIcon :icon="PipetteIcon" /></XhColorPickerEyeDropperTrigger>
          <XhColorPickerHueSlider style="flex: 1" />
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
          <button data-xh-part="eye-dropper-trigger">
            <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.5 4.5a2.4 2.4 0 0 0-3.4 0L12.6 8L16 11.4L19.5 7.9a2.4 2.4 0 0 0 0-3.4Z"/><path d="M11.6 9L15 12.4"/><path d="M3.5 20.5L4.5 19.5H7.5L16 11"/><path d="M4.5 19.5V16.5L12.6 8.4"/></svg>
          </button>
          <div data-xh-part="hue-slider" style="flex: 1">
            <div data-xh-part="control">
              <div data-xh-part="track"></div>
              <div data-xh-part="thumb"></div>
            </div>
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
  document.getElementById("color-picker-inputs").translations = {
    eyeDropperTrigger: "从屏幕上取色",
  };
</script>
```

### oklch 写法

format="oklch" 让值串与主题令牌同一色空间，取到的颜色可以直接写回令牌；工作色在 sRGB 内，超出 sRGB 的 oklch 值按通道夹回

```vue
<script setup lang="ts">
import {
  XhColorPickerAreaThumb,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerHueSlider,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";
</script>

<template>
  <XhColorPickerRoot default-value="oklch(62.31% 0.188 259.81)" format="oklch">
    <XhColorPickerLabel>主题主色</XhColorPickerLabel>
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
        <XhColorPickerHueSlider />
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
</template>
```

```html
<xh-color-picker default-value="oklch(62.31% 0.188 259.81)" format="oklch">
  <div data-xh-part="root">
    <label data-xh-part="label">主题主色</label>
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
        <div data-xh-part="hue-slider">
          <div data-xh-part="control">
            <div data-xh-part="track"></div>
            <div data-xh-part="thumb"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-color-picker>
```

### 常驻形态

inline 让取色面直接铺在页面里，与浮层形态同一台机器、同一组部件，只是不写 control、trigger 与 positioner；取色面不抢焦点，也不因点外或 Esc 收起

```vue
<script setup lang="ts">
import {
  XhColorPickerAreaThumb,
  XhColorPickerChannelInput,
  XhColorPickerContent,
  XhColorPickerHueSlider,
  XhColorPickerLabel,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
} from "@xihan-ui/vue";
import { ref } from "vue";

const color = ref<string[]>(["#3b82f6"]);
</script>

<template>
  <XhColorPickerRoot v-model:value="color" inline>
    <XhColorPickerLabel>画笔颜色</XhColorPickerLabel>
    <XhColorPickerContent>
      <XhColorPickerSaturationArea>
        <XhColorPickerAreaThumb />
      </XhColorPickerSaturationArea>
      <XhColorPickerHueSlider />
      <XhColorPickerChannelInput channel="hex" />
    </XhColorPickerContent>
  </XhColorPickerRoot>
  <p>当前：<code>{{ color[0] }}</code></p>
</template>
```

```html
<xh-color-picker id="color-picker-inline" default-value="#3b82f6" inline>
  <div data-xh-part="root">
    <label data-xh-part="label">画笔颜色</label>
    <div data-xh-part="content">
      <div data-xh-part="saturation-area">
        <div data-xh-part="area-thumb"></div>
      </div>
      <div data-xh-part="hue-slider">
        <div data-xh-part="control">
          <div data-xh-part="track"></div>
          <div data-xh-part="thumb"></div>
        </div>
      </div>
      <input data-xh-part="channel-input" channel="hex" />
    </div>
  </div>
</xh-color-picker>
<p>当前：<code id="color-picker-inline-value">#3b82f6</code></p>

<script type="module">
  const picker = document.getElementById("color-picker-inline");
  const readout = document.getElementById("color-picker-inline-value");
  picker.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0];
  });
</script>
```

### 最近使用色

一轮取色结束（浮层收起，或常驻形态下焦点离开取色面）且颜色变了，就记进最近使用色，最新的在最前、同色只留一份；受控写回由宿主保存，刷新后还在

```vue
<script setup lang="ts">
import {
  XhButton,
  XhColorPickerAreaThumb,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerHueSlider,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRecentSwatchPicker,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 宿主自己决定存在哪：这里演示放进一个 ref，真实场景可以存进本地存储或用户偏好
const recent = ref<string[]>(["#ef4444", "#f59e0b"]);
</script>

<template>
  <XhColorPickerRoot
    v-slot="{ clearRecentColors }"
    v-model:recent-colors="recent"
    default-value="#3b82f6"
    :max-recent-colors="6"
  >
    <XhColorPickerLabel>标记颜色</XhColorPickerLabel>
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
        <XhColorPickerHueSlider />
        <XhColorPickerRecentSwatchPicker />
        <XhButton v-if="recent.length" size="sm" variant="ghost" @click="clearRecentColors()">清空最近使用</XhButton>
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>
</template>
```

```html
<xh-color-picker id="color-picker-recent" default-value="#3b82f6" recent-colors="#ef4444,#f59e0b" max-recent-colors="6">
  <div data-xh-part="root">
    <label data-xh-part="label">标记颜色</label>
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
        <div data-xh-part="hue-slider">
          <div data-xh-part="control">
            <div data-xh-part="track"></div>
            <div data-xh-part="thumb"></div>
          </div>
        </div>
        <div data-xh-part="recent-swatch-picker"></div>
        <xh-button id="color-picker-recent-clear" size="sm" variant="ghost">
          <button data-xh-part="root">清空最近使用</button>
        </xh-button>
      </div>
    </div>
  </div>
</xh-color-picker>

<script type="module">
  const picker = document.getElementById("color-picker-recent");
  const mount = picker.querySelector('[data-xh-part="recent-swatch-picker"]');
  const clear = document.getElementById("color-picker-recent-clear");

  // 格子由作者按当前列表铺：每格是 color-swatch-picker 的 item，色块面、选中标记与表单影子手写
  function render(colors) {
    mount.replaceChildren(
      ...colors.map((value) => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.setAttribute("value", value);
        item.innerHTML =
          '<input data-xh-part="hidden-input" />' +
          '<span data-xh-part="swatch"></span>' +
          '<span data-xh-part="indicator"></span>';
        return item;
      })
    );
    clear.hidden = colors.length === 0;
  }

  // 受控：宿主收下新列表再写回（真实场景顺手存进本地存储）
  picker.addEventListener("recent-colors-change", (event) => {
    picker.recentColors = event.detail.recentColors;
    render(event.detail.recentColors);
  });
  clear.addEventListener("click", () => picker.clearRecentColors());

  render(["#ef4444", "#f59e0b"]);
</script>
```

### 多选成标签

selectionMode="multiple" 时浮层里调出的颜色是草稿，按「添加」收进值、浮层不收，可以接着添；预设色板点一下切换选中。选中的颜色在输入行里排成带色点的标签，点叉或在展开钮上按退格摘掉

```vue
<script setup lang="ts">
import {
  XhColorPickerAreaThumb,
  XhColorPickerConfirmTrigger,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerHiddenInput,
  XhColorPickerHueSlider,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerSwatchPicker,
  XhColorPickerTagList,
  XhColorPickerTrigger,
  XhColorPickerValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const swatches = ["#00a98e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];
const value = ref<string[]>(["#00a98e", "#3b82f6"]);
</script>

<template>
  <XhColorPickerRoot
    v-model:value="value"
    name="palette"
    selection-mode="multiple"
    :swatches="swatches"
  >
    <XhColorPickerLabel>配色</XhColorPickerLabel>
    <XhColorPickerControl>
      <XhColorPickerTagList />
      <XhColorPickerTrigger>
        <XhColorPickerSwatch />
        <XhColorPickerValueText />
      </XhColorPickerTrigger>
    </XhColorPickerControl>
    <XhColorPickerHiddenInput />
    <XhColorPickerPositioner>
      <XhColorPickerContent>
        <XhColorPickerSaturationArea>
          <XhColorPickerAreaThumb />
        </XhColorPickerSaturationArea>
        <XhColorPickerHueSlider />
        <XhColorPickerSwatchPicker />
        <XhColorPickerConfirmTrigger>添加</XhColorPickerConfirmTrigger>
      </XhColorPickerContent>
    </XhColorPickerPositioner>
  </XhColorPickerRoot>

  <span aria-live="polite" style="font-size: 13px">
    当前值：{{ value.join("、") || "（空）" }}
  </span>
</template>
```

```html
<xh-color-picker
  id="color-picker-multiple"
  name="palette"
  selection-mode="multiple"
  swatches="#00a98e,#3b82f6,#f59e0b,#ef4444,#8b5cf6"
>
  <div data-xh-part="root">
    <label data-xh-part="label">配色</label>
    <div data-xh-part="control">
      <span data-xh-part="tag-list"></span>
      <button data-xh-part="trigger">
        <span data-xh-part="swatch"></span>
        <span data-xh-part="value-text"></span>
      </button>
    </div>
    <input data-xh-part="hidden-input" />
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="saturation-area">
          <div data-xh-part="area-thumb"></div>
        </div>
        <div data-xh-part="hue-slider">
          <div data-xh-part="control">
            <div data-xh-part="track"></div>
            <div data-xh-part="thumb"></div>
          </div>
        </div>
        <div data-xh-part="swatch-picker">
          <div data-xh-part="item" value="#00a98e">
            <span data-xh-part="swatch"></span>
            <span data-xh-part="indicator"></span>
          </div>
          <div data-xh-part="item" value="#3b82f6">
            <span data-xh-part="swatch"></span>
            <span data-xh-part="indicator"></span>
          </div>
          <div data-xh-part="item" value="#f59e0b">
            <span data-xh-part="swatch"></span>
            <span data-xh-part="indicator"></span>
          </div>
          <div data-xh-part="item" value="#ef4444">
            <span data-xh-part="swatch"></span>
            <span data-xh-part="indicator"></span>
          </div>
          <div data-xh-part="item" value="#8b5cf6">
            <span data-xh-part="swatch"></span>
            <span data-xh-part="indicator"></span>
          </div>
        </div>
        <button data-xh-part="confirm-trigger">添加</button>
      </div>
    </div>
  </div>
</xh-color-picker>

<span aria-live="polite" style="font-size: 13px">
  当前值：<span id="color-picker-multiple-value">#00a98e、#3b82f6</span>
</span>

<script type="module">
  const picker = document.getElementById("color-picker-multiple");
  const readout = document.getElementById("color-picker-multiple-value");

  const tagList = picker.querySelector('[data-xh-part="tag-list"]');

  // 标签按 tags 铺：一个选中值一枚，带删除钮；放不下的那些合成一枚 +N，文字由元素填
  function paintTags() {
    const overflow = document.createElement("span");
    overflow.dataset.xhPart = "overflow-tag";
    tagList.replaceChildren(
      ...picker.tags.map((tag) => {
        const node = document.createElement("span");
        node.dataset.xhPart = "tag";
        node.setAttribute("value", tag.value);
        const label = document.createElement("span");
        label.dataset.xhPart = "tag-label";
        label.textContent = tag.label;
        const remove = document.createElement("button");
        remove.dataset.xhPart = "item-delete-trigger";
        node.append(label, remove);
        return node;
      }),
      overflow,
    );
  }

  // 多选的值是数组，只走 property：设初值、每次变更写回
  function apply(next) {
    picker.value = next;
    readout.textContent = next.join("、") || "（空）";
    paintTags();
  }

  apply(["#00a98e", "#3b82f6"]);
  picker.addEventListener("value-change", (event) => apply(event.detail.value));
</script>
```

## 设计指引

### 何时使用

- 用户需要自定义主题色、标注色或画布颜色，且不限于固定选项。
- 需要挑出一组颜色（配色方案、图表系列色）时，用多选把它们收成一排标签。
- 既需要可视化挑选（取色面、滑块）也需要精确输入（十六进制、分量框）。
- 需要从屏幕取色。

### 何时不用

- 只从几个固定颜色中选一个时，使用[颜色色块选择器](./color-swatch-picker)。
- 只调整一个通道（色相、透明度）时，使用[颜色滑块](./color-slider)。
- 用户已知颜色串并直接输入时，使用[颜色字段](./color-field)。
- 只展示一个颜色时，使用[颜色色块](./color-swatch)。

### 特性

- 工作色始终是 HSVA：取色面两轴是饱和度与明度，纯黑与灰度处的色相由锚点保持，拖到黑色再拉回时色相不丢失。
- `format` 决定值串写法（hex / rgba / hsla / oklch），`alpha` 决定是否带透明度；关闭时透明度滑块与输入框整体禁用。oklch 与令牌同一色空间，便于把取到的颜色写回主题；工作色在 sRGB 内，超出 sRGB 的 oklch 值按通道夹回。HSB 不是 CSS 颜色写法，不作值串格式，需要 HSB 数值时读 `hsva`。
- 色相与透明度两条滑块是内嵌的颜色滑块：整份工作色交给它们，调整色相不会把透明度归 1；键盘（方向键、PageUp / PageDown、Home / End、Shift 大步）与拖动都由滑块自身处理。
- 预设色板是内嵌的色块选择器：方向键在格子间移动并选中，当前颜色所在格按颜色比较（写法不同也能匹配）。
- 数值框输入只保留草稿，可解析时立即取值；不可解析时保留原文并报输入错误，回车同时拦截表单提交。
- 屏幕取色通过浮层内的按钮触发，环境不提供 EyeDropper 时始终禁用；取到的颜色与色板、外部 setValue 走同一条取值路径。
- 格式、输入、颜色解析与屏幕取色四路错误相互独立，修正一路不影响其他路。
- 值恒为颜色串数组：单选恒为一项（取色器总有一个颜色），宿主可以写裸串；`onValueChange` 的 `value` 恒为数组。
- 受控 `value` 与 `open`：宿主不写回时界面不变化，回调照常发出；表单出口经 `hidden-input` 提交选中的值串。
- 多选（`selectionMode="multiple"`）时浮层里调出的工作色是草稿，按「添加」（`confirm-trigger`）收进值，浮层不收、工作色留着，接着调就能添下一个；预设色板点一下切换选中，格子本身不再标选中。工作色解析不出、已经选过（按颜色比较，写法不同也算同一个）或到了 `maxSelected` 时「添加」不可按。
- 多选的选中值在输入行里排成标签（与[选择器](./select)多选同一套库内[标签](./tag)），按加入先后：每枚标签前一个该颜色的色点，值文字收起，触发钮只剩一颗显示工作色的色块并成为键盘入口，在它上面按退格摘掉最后一个，点标签上的叉摘掉那一个；标签不截短、一行放不下就折行，超过 `maxTagCount`（默认 3）的折进 +N；表单一个选中值一份同名隐藏输入。
- `inline` 是常驻形态：取色面直接铺在页面里，与浮层形态同一台机器、同一组部件，只是不写 `control` / `trigger` / `positioner`。取色面是静态内容面（surface 圆角、描边、不落影），不抢焦点、不入层栈，点外与 Escape 都不收起。
- 最近使用色：一轮取色结束且颜色变了就记一笔，最新的在最前、同色只留一份、最多留 `maxRecentColors` 个（缺省 8）。浮层形态以收起为一轮，常驻形态以焦点离开取色面为一轮；只经 `setValue` 改的不记。`recentColors` 可受控，由宿主持久化；`recent-swatch-picker` 挂载点渲染它们，还没有时收起。

### 组合

- 四个挂载点 `hue-slider` / `alpha-slider` / `swatch-picker` / `recent-swatch-picker` 同时充当内嵌组件的根节点，内部放置的是[颜色滑块](./color-slider)与[颜色色块选择器](./color-swatch-picker)自己的部件；不写子节点时自动铺开最简结构。
- 放入[表单字段](./field)承接标题、说明与错误信息，`disabled` / `readOnly` 随字段下发。
- 与[颜色字段](./color-field)并排：选择器挑颜色，字段显示并微调该值。

### 最佳实践

- 通过 `swatches` 提供常用色，多数用户从这里即可完成选择。
- 触发按钮内同时放色块与值串，读屏与视觉各有一路。
- 多选时在浮层末尾放「添加」，并配上预设色板：常用色点一下就进出，自定义色调好再添。
- 需要精确输入时放数值框；一个十六进制框比四个分量框更节省空间。

### 反模式

- 只显示颜色不显示数值，颜色不能是唯一的信息通道。
- 有对比度要求的场景不提供校验反馈。
- 关闭 `alpha` 后仍保留透明度滑块，整条禁用的控件只会造成困惑。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-color-picker>` |
| Vue 组件 | `XhColorPickerAlphaSlider` `XhColorPickerAreaThumb` `XhColorPickerChannelInput` `XhColorPickerConfirmTrigger` `XhColorPickerContent` `XhColorPickerControl` `XhColorPickerEyeDropperTrigger` `XhColorPickerHiddenInput` `XhColorPickerHueSlider` `XhColorPickerItemDeleteTrigger` `XhColorPickerLabel` `XhColorPickerOverflowTag` `XhColorPickerPositioner` `XhColorPickerRecentSwatchPicker` `XhColorPickerRoot` `XhColorPickerSaturationArea` `XhColorPickerSwatch` `XhColorPickerSwatchPicker` `XhColorPickerTag` `XhColorPickerTagLabel` `XhColorPickerTagList` `XhColorPickerTrigger` `XhColorPickerValueText` |
| 组合式函数 | `useColorPicker` |
| 状态机 | `colorPickerMachine` |
| 皮肤 | `@xihan-ui/styles/color-picker.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| string[]` |  | 选中的颜色，值串数组。提供即受控：写入只发 onValueChange 不落内部值。 单选可写裸串，内部一律归一为数组；单选给空数组时按缺省色 #000000。 |
| `defaultValue` | `string \| string[]` |  |  |
| `selectionMode` | `ColorPickerSelectionMode` |  | 选择模式，默认 single。 |
| `maxSelected` | `number` |  | multiple 下最多选几个颜色：选满后「添加」不可按、色块只能点掉已选的。非整数向下取整，小于 1 或不是有限数时不设上限。 |
| `maxTagCount` | `number` |  | 多选时输入行最多摆几枚标签，其余折进 +N 那一枚；默认 3。 |
| `format` | `ColorFormat` |  | 值串的写法，默认 hex。修改它只改变对外的序列化，工作色恒为 HSVA。 |
| `open` | `boolean` |  | 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `disabled` | `boolean` |  | 整个控件禁用：trigger 与两个按钮使用原生 disabled，取色区与滑杆退出 Tab 序列。 |
| `readOnly` | `boolean` |  | 只读：浮层照常展开（可查看当前颜色），但任何改值的动作都不发生。 |
| `swatches` | `string[]` |  | 预设色板：交给内嵌的色块选择器铺格，选中的格按颜色比较。 |
| `inline` | `boolean` |  | 常驻形态：取色面直接铺在页面里，不经触发钮与浮层，与浮层形态共用同一台机器与同一组部件。 开着时恒为展开态，open / defaultOpen / onOpenChange 不起作用，也不接管焦点与点外关闭。 |
| `recentColors` | `string[]` |  | 最近使用色（最新的在最前）。提供即受控：内部只发 onRecentColorsChange，由宿主写回（也由宿主持久化）。 一次取色结束时记一笔：浮层形态在收起那一刻，常驻形态在焦点离开取色面那一刻； 这一轮里颜色没变、或只经 api.setValue 改过就不记。 |
| `defaultRecentColors` | `string[]` |  |  |
| `maxRecentColors` | `number` |  | 最近使用色最多留几个，默认 8；写 0 即不记。 |
| `name` | `string` |  | 表单字段名；提供后表单影子才带 name 并参与提交。 |
| `alpha` | `boolean` |  | 带透明度，默认关闭。关闭时值串恒为不透明，透明度滑杆与输入框整条禁用。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `variant` | `ControlVariant` |  | 盒的形态：outline / subtle / ghost，默认 outline，与同族字段同一套字段外壳。 |
| `dir` | `Direction` |  | 文字方向。只改写横轴（取色区的饱和度、通道滑杆）上左右两键与指针的语义。 |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `translations` | `Partial<ColorPickerTranslations>` |  |  |
| `onValueChange` | `(details: ColorPickerValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |
| `onOpenChange` | `(details: ColorPickerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onRecentColorsChange` | `(details: ColorPickerRecentColorsChangeDetails) => void` |  | 最近使用色变化意图回调；受控时是唯一出口。 |
| `onColorError` | `(details: ColorPickerErrorDetails) => void` |  | 格式、文本、颜色解析或屏幕取色失败；与 value / open 事件独立。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ColorPickerValueChangeDetails` | 选中的颜色变化；detail 为 `{ value: string[] }`，单选恒为一项 |
| `open-change` | `ColorPickerOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `color-error` | `ColorPickerErrorDetails` | 格式、输入、颜色解析或屏幕取色失败；detail 为判别式错误对象 |
| `recent-colors-change` | `ColorPickerRecentColorsChangeDetails` | 一轮取色结束、颜色变了，最近使用色随之变化；detail 为 `{ recentColors: string[] }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhColorPickerRoot` | `default` | `ColorPickerRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhColorPickerChannelInput` | `channel` | `ColorPickerInputChannel` |  | 该输入框编辑的通道：hex 是整串，r/g/b 是分量，a 是透明度百分数；默认或无法识别时按 hex 处理。 |
| `XhColorPickerPositioner` | `container` | `() => Element \| null` |  | 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 |
| `XhColorPickerRoot` | `children` | `SlotChildren<ColorPickerRootSlotProps>` |  |  |
| `XhColorPickerTag` | `value` | `string` | 是 | 它代表哪个选中颜色。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `label` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `value-text` | 'open' \| 'closed' |
| `swatch` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `saturation-area` | 'open' \| 'closed' |
| `area-thumb` | 'open' \| 'closed' |
| `channel-input` | 'open' \| 'closed' |
| `eye-dropper-trigger` | 'picking' \| 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`closed` · `open` · `open.idle` · `open.dragging` · `open.picking`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `SELECTED.SET` · `VALUE.ADD` · `VALUE.REMOVE` · `VALUE.TOGGLE` · `TAG_LIST.TRACKED` · `AREA.SET` · `AREA.STEP` · `AREA.TO_EDGE` · `HSVA.SET` · `INPUT.CHANGE` · `INPUT.COMMIT` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `EYE_DROPPER.OPEN` · `EYE_DROPPER.RESULT` · `EYE_DROPPER.CANCEL` · `EYE_DROPPER.ERROR` · `ERROR.CLEAR` · `SESSION.END` · `RECENT.CLEAR` · `INLINE.SYNC` · `INLINE.CLOSE` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`isOpenControlled` · `canInteract` · `canPick` · `isInline`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `value` | `string[]` | 选中的颜色，值串数组（与 onValueChange 发出的是同一个）：单选恒为一项，多选按加入先后。 |
| `selectionMode` | `ColorPickerSelectionMode` |  |
| `color` | `string` | 工作色的值串：触发钮里的色块与值文字显示它；单选时就是选中值，多选时是浮层里调着的草稿。 |
| `rgba` | `ColorRgba` |  |
| `hsva` | `ColorHsva` | 工作色。取色区与色相滑杆读取的都是它。 |
| `format` | `ColorFormat` |  |
| `alpha` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `dragging` | `boolean` | 指针正在拖动某一部位。 |
| `picking` | `boolean` | 屏幕取色正在进行。 |
| `eyeDropperSupported` | `boolean` |  |
| `errors` | `ColorPickerErrors` | 格式、文本、颜色解析与屏幕取色四路互不覆盖的错误。 |
| `swatches` | `string[]` | 预设色板（原样透传 swatches prop，默认为空数组）。 |
| `inline` | `boolean` | 常驻形态。 |
| `recentColors` | `string[]` | 最近使用色，最新的在最前。 |
| `canAdd` | `boolean` | 多选时「添加」此刻可按：工作色还没选过、也没到 maxSelected。 |
| `tags` | `ColorPickerTagMeta[]` | 多选时可见的标签（受 maxTagCount 截断），与 value 同序；单选恒为空数组。 |
| `overflowCount` | `number` | 被 maxTagCount 折叠的标签数。 |
| `overflowText` | `string` | +N 标签显示的文字（由 translations.overflowTag 计算）；没有折叠的标签时为空串。 |
| `hueSlider` | `ColorSliderApi<T>` | 色相颜色滑块的 api：部件属性与取值都从这里获取，DOM 带 data-scope="color-slider"。 |
| `alphaSlider` | `ColorSliderApi<T>` | 透明度颜色滑块的 api。 |
| `swatchPicker` | `ColorSwatchPickerApi<T>` | 预设色板的 api，DOM 带 data-scope="color-swatch-picker"。 |
| `recentSwatchPicker` | `ColorSwatchPickerApi<T>` | 最近使用色那台色块选择器的 api。 |
| `inputText` | `(channel: ColorPickerInputChannel) => string` | 某个数值框当前应显示的文字（有草稿显示草稿，否则显示规范文本）。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[]) => void` | 改选中值：单选取首项改工作色，多选整份替换。 |
| `add` | `() => void` | 多选：把工作色收进值（与按「添加」同一条路）。 |
| `deselect` | `(value: string) => void` | 多选：摘掉一个选中值。 |
| `clearError` | `() => void` | 清除四路显式错误；屏幕取色重试也会先清除自己那一路。 |
| `clearRecentColors` | `() => void` | 清空最近使用色。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getTagListProps` | `() => T['element']` | 标签行：多选时放在盒里、触发钮之前，收纳可见标签与 +N 标签；单选时整体 hidden。 |
| `getTagProps` | `(props: ColorPickerTagProps) => T['element']` | 标签：一个选中值一个，即库内 tag 的 root（data-scope="tag"），另带 data-value 与画色点用的颜色。 |
| `getTagLabelProps` | `() => T['element']` | 标签文字所在的块（tag 的 label）；标签与 +N 共用。 |
| `getOverflowTagProps` | `() => T['element']` | 被折叠的标签合成的一个：同样是 tag 的 root，显示 overflowText、带 data-count；没有折叠的标签时 hidden。 |
| `getItemDeleteTriggerProps` | `(props: ColorPickerTagProps) => T['button']` | 标签删除按钮：即所在标签那份 tag 的 close-trigger，可及名使用 translations.deleteItem；不占 Tab 位、按下不夺焦。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getValueTextProps` | `() => T['element']` |  |
| `getSwatchProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getSaturationAreaProps` | `() => T['element']` |  |
| `getAreaThumbProps` | `() => T['element']` |  |
| `getHueSliderProps` | `() => T['element']` | 色相滑块的挂载点，同时充当该滑块的根节点：滑块 root 的状态标记同步写在它身上。 |
| `getAlphaSliderProps` | `() => T['element']` | 透明度滑块的挂载点，同上。 |
| `getChannelInputProps` | `(props: ColorPickerInputProps) => T['input']` |  |
| `getEyeDropperTriggerProps` | `() => T['button']` |  |
| `getSwatchPickerProps` | `() => T['element']` | 预设色板的挂载点，同时充当色板的根节点（role=radiogroup 与键盘处理都在它身上）。 |
| `getRecentSwatchPickerProps` | `() => T['element']` | 最近使用色的挂载点，同上；还没有最近使用色时收起。 |
| `getConfirmTriggerProps` | `() => T['button']` | 「添加」：多选时把工作色收进值，浮层不收；单选时 hidden。文字由作者写。 |
| `getHiddenInputProps` | `(props?: ColorPickerHiddenInputProps) => T['input']` | 表单影子：值随表单提交。提供 name 后才带 name，未提供时不参与提交。 多选时一个选中值一份同名输入：传 `{ value }` 产出那一份，不传是首个选中值那一份。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Backspace` | focus in trigger, multiple, 有选中值, not disabled/readOnly | 摘掉最后一个选中值（标签行末尾那一枚） |
| `ArrowRight` / `ArrowLeft` | focus in area-thumb, not disabled/readOnly | 按 1 调饱和度；RTL 下左右对调，语义恒是"朝饱和走一格" |
| `ArrowUp` / `ArrowDown` | focus in area-thumb, not disabled/readOnly | 按 1 调明度，屏幕向上恒是变亮，与 dir 无关 |
| `Shift+ArrowRight` / `Shift+ArrowLeft` / `Shift+ArrowUp` / `Shift+ArrowDown` | focus in area-thumb, not disabled/readOnly | 同上，但一步走 10 |
| `Home` / `End` | focus in area-thumb, not disabled/readOnly | 饱和度取 0 / 100（与 aria-valuenow 报的是同一条轴） |
| `Enter` | focus in channel-input | 收下框里的字；收不了就保留草稿并报告输入错误。一并拦住表单提交 |
| `Escape` | open（本层在层栈顶） | 收起浮层，焦点归还触发器；常驻形态不入层栈，不接管这个键 |
| `Enter` / `Space` | held on eye-dropper-trigger, not disabled | 按住期间取色按钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，屏幕取色一开（窗口随即失焦）或浮层收起时一并撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `trigger` | `aria-labelledby` | `label` 部件的 id `value-text` 部件的 id |
| `swatch` | `aria-hidden` | 'true' |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-labelledby` | `label` 部件的 id |
| `content` | `aria-modal` | undefined \| 'false' |
| `content` | `role` | 'group' \| 'dialog' |
| `area-thumb` | `aria-disabled` | 'true' \| 'false' |
| `area-thumb` | `aria-label` | label.area |
| `area-thumb` | `aria-valuemax` | '100' |
| `area-thumb` | `aria-valuemin` | '0' |
| `area-thumb` | `aria-valuenow` | String(Math.round(hsva.s)) |
| `area-thumb` | `aria-valuetext` | label.areaValueText(Math.round(hsva.s), Math.round(hs… |
| `area-thumb` | `role` | 'slider' |
| `channel-input` | `aria-invalid` | 'true' \| 'false' |
| `channel-input` | `aria-label` | label.input(channel) |
| `eye-dropper-trigger` | `aria-label` | label.eyeDropperTrigger |

- 触发按钮是原生按钮，`aria-haspopup="dialog"`，名称由标题与当前值串合成；浮层是非模态 `role="dialog"`。
- 多选标签上的删除钮不占 Tab 位，可及名取 `translations.deleteItem`；键盘从触发钮上按退格摘掉最后一个。色点只是辅助，标签文字就是值串，颜色不是唯一的信息通道。
- 取色面的拇指是 `role="slider"`：`aria-valuenow` 报告饱和度，明度写入 `aria-valuetext`。
- 两条滑块的名称与带单位的播报文本取自 `translations.channel` / `channelValueText`，由内嵌滑块读出。
- 色板是 `role="radiogroup"`，每格 `role="radio"`；整组名称取 `translations.swatchGroup`，每格读 `translations.swatch(value)`；最近使用色同一套，整组名称取 `translations.recentSwatchGroup`。
- 常驻形态的取色面是 `role="group"`，由标题命名，不是对话框。
- Escape 收起浮层并把焦点归还触发按钮。

## 样式参考

### 皮肤

`@xihan-ui/styles/color-picker.css` 按 `[data-scope="color-picker"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-color-picker` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-inline` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `label` | `data-readonly` | ''（条件成立时才出现） |
| `label` | `data-state` | 'open' \| 'closed' |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-state` | 'open' \| 'closed' |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-layout` | 'multi-tag' \| undefined |
| `control` | `data-xh-field-size` | props.size |
| `tag-list` | `data-disabled` | ''（条件成立时才出现） |
| `tag-list` | `data-instant` | ''（条件成立时才出现） |
| `tag-list` | `data-xh-tag-list` | '' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-readonly` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `value-text` | `data-disabled` | ''（条件成立时才出现） |
| `value-text` | `data-readonly` | ''（条件成立时才出现） |
| `value-text` | `data-state` | 'open' \| 'closed' |
| `swatch` | `data-disabled` | ''（条件成立时才出现） |
| `swatch` | `data-readonly` | ''（条件成立时才出现） |
| `swatch` | `data-state` | 'open' \| 'closed' |
| `swatch` | `data-value` | context.get('value') |
| `swatch` | `data-xh-swatch` | '' |
| `swatch` | `data-xh-swatch-size` | props.size |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-disabled` | ''（条件成立时才出现） |
| `content` | `data-inline` | ''（条件成立时才出现） |
| `content` | `data-instant` | ''（条件成立时才出现） |
| `content` | `data-placement` | undefined \| 定位引擎算出的实际落位 |
| `content` | `data-readonly` | ''（条件成立时才出现） |
| `content` | `data-state` | 'open' \| 'closed' |
| `saturation-area` | `data-disabled` | ''（条件成立时才出现） |
| `saturation-area` | `data-dragging` | ''（条件成立时才出现） |
| `saturation-area` | `data-readonly` | ''（条件成立时才出现） |
| `saturation-area` | `data-state` | 'open' \| 'closed' |
| `area-thumb` | `data-disabled` | ''（条件成立时才出现） |
| `area-thumb` | `data-dragging` | ''（条件成立时才出现） |
| `area-thumb` | `data-readonly` | ''（条件成立时才出现） |
| `area-thumb` | `data-state` | 'open' \| 'closed' |
| `hue-slider` | `data-channel` | 'hue' |
| `alpha-slider` | `data-channel` | 'alpha' |
| `alpha-slider` | `data-disabled` | ''（条件成立时才出现） |
| `channel-input` | `data-channel` | channel |
| `channel-input` | `data-disabled` | ''（条件成立时才出现） |
| `channel-input` | `data-invalid` | ''（条件成立时才出现） |
| `channel-input` | `data-readonly` | ''（条件成立时才出现） |
| `channel-input` | `data-state` | 'open' \| 'closed' |
| `eye-dropper-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `eye-dropper-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `eye-dropper-trigger` | `data-readonly` | ''（条件成立时才出现） |
| `eye-dropper-trigger` | `data-state` | 'picking' \| 'open' \| 'closed' |
| `confirm-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `confirm-trigger` | `data-xh-action-control` | '' |
| `confirm-trigger` | `data-xh-action-display` | 'always' |
| `confirm-trigger` | `data-xh-action-profile` | 'text' |
| `confirm-trigger` | `data-xh-action-size` | 'sm' |
| `confirm-trigger` | `data-xh-action-variant` | 'solid' |
| `confirm-trigger` | `data-xh-ink-surface` | '' |
| `overflow-tag` | `data-count` | String(overflowCount) |
| `tag` | `data-value` | v |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-color-picker-action-bg` | `eye-dropper-trigger` | `background` | `default` | `transparent` | color-picker 的 eye-dropper-trigger 部件 background 覆盖槽。 |
| `--xh-color-picker-action-bg-active` | `eye-dropper-trigger` | `background` | `is(:active, [data-pressed])`<br>`not(:disabled)`<br>`pressed`<br>`state=picking` | `--xh-bg-subtle-active`<br>`--xh-bg-subtle-hover` | color-picker 的 eye-dropper-trigger 部件 background 覆盖槽。 |
| `--xh-color-picker-action-bg-hover` | `eye-dropper-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle` | color-picker 的 eye-dropper-trigger 部件 background 覆盖槽。 |
| `--xh-color-picker-action-border` | `eye-dropper-trigger` | `border` | `default` | `--xh-border-control` | color-picker 的 eye-dropper-trigger 部件 border 覆盖槽。 |
| `--xh-color-picker-action-border-active` | `eye-dropper-trigger` | `border-color` | `state=picking` | `--xh-bg-brand` | color-picker 的 eye-dropper-trigger 部件 border-color 覆盖槽。 |
| `--xh-color-picker-action-fg` | `eye-dropper-trigger` | `color` | `default` | `--xh-fg-muted` | color-picker 的 eye-dropper-trigger 部件 color 覆盖槽。 |
| `--xh-color-picker-action-fg-hover` | `eye-dropper-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-default` | color-picker 的 eye-dropper-trigger 部件 color 覆盖槽。 |
| `--xh-color-picker-action-font-size` | `eye-dropper-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | color-picker 的 eye-dropper-trigger 部件 font-size 覆盖槽。 |
| `--xh-color-picker-action-radius` | `eye-dropper-trigger` | `border-radius` | `default` | `--xh-shape-control` | color-picker 的 eye-dropper-trigger 部件 border-radius 覆盖槽。 |
| `--xh-color-picker-action-size` | `eye-dropper-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | color-picker 的 eye-dropper-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-color-picker-alpha-slider-gap` | `alpha-slider` | `gap` | `default` | `--xh-stack-gap-md` | color-picker 的 alpha-slider 部件 gap 覆盖槽。 |
| `--xh-color-picker-confirm-trigger-bg` | `confirm-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` | color-picker 的 confirm-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-color-picker-confirm-trigger-bg-active` | `confirm-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | color-picker 的 confirm-trigger 部件 background-color 覆盖槽。 |
| `--xh-color-picker-confirm-trigger-bg-hover` | `confirm-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | color-picker 的 confirm-trigger 部件 background-color 覆盖槽。 |
| `--xh-color-picker-confirm-trigger-fg` | `confirm-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | color-picker 的 confirm-trigger 部件 color 覆盖槽。 |
| `--xh-color-picker-confirm-trigger-h` | `confirm-trigger` | `block-size` | `default` | `--xh-_action-profile-visual-size` | color-picker 的 confirm-trigger 部件 block-size 覆盖槽。 |
| `--xh-color-picker-confirm-trigger-px` | `confirm-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | color-picker 的 confirm-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-color-picker-confirm-trigger-radius` | `confirm-trigger` | `border-radius` | `default` | `--xh-shape-control` | color-picker 的 confirm-trigger 部件 border-radius 覆盖槽。 |
| `--xh-color-picker-confirm-trigger-shadow` | `confirm-trigger` | `box-shadow` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `none` | color-picker 的 confirm-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-color-picker-content-bg` | `content` | `background` | `default` | `--xh-bg-surface` | color-picker 的 content 部件 background 覆盖槽。 |
| `--xh-color-picker-content-border` | `content` | `border` | `default` | `--xh-border-default` | color-picker 的 content 部件 border 覆盖槽。 |
| `--xh-color-picker-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | color-picker 的 content 部件 color 覆盖槽。 |
| `--xh-color-picker-content-gap` | `content` | `gap` | `default` | `--xh-space-3` | color-picker 的 content 部件 gap 覆盖槽。 |
| `--xh-color-picker-content-px` | `content` | `padding-inline` | `default` | `--xh-space-3` | color-picker 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-color-picker-content-py` | `content` | `padding-block` | `default` | `--xh-space-3` | color-picker 的 content 部件 padding-block 覆盖槽。 |
| `--xh-color-picker-content-radius` | `content` | `border-radius` | `default`<br>`inline` | `--xh-shape-overlay`<br>`--xh-shape-surface` | color-picker 的 content 部件 border-radius 覆盖槽。 |
| `--xh-color-picker-content-shadow` | `content` | `box-shadow` | `default`<br>`inline` | `--xh-elevation-floating`<br>`none` | color-picker 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-color-picker-content-w` | `content` | `inline-size` | `default` | `--xh-overlay-min-w` | color-picker 的 content 部件 inline-size 覆盖槽。 |
| `--xh-color-picker-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` | color-picker 的 control 部件 background-color 覆盖槽。 |
| `--xh-color-picker-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` | color-picker 的 control 部件 background-color 覆盖槽。 |
| `--xh-color-picker-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` | color-picker 的 control 部件 background-color 覆盖槽。 |
| `--xh-color-picker-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` | color-picker 的 control 部件 background-color 覆盖槽。 |
| `--xh-color-picker-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` | color-picker 的 control 部件 border 覆盖槽。 |
| `--xh-color-picker-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` | color-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-color-picker-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` | color-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-color-picker-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` | color-picker 的 control 部件 color 覆盖槽。 |
| `--xh-color-picker-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_color-picker-gap` | color-picker 的 control 部件 gap 覆盖槽。 |
| `--xh-color-picker-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_color-picker-h` | color-picker 的 control 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-color-picker-control-max-h` | `control` | `max-block-size` | `xh-field-layout=multi-tag` | `--xh-viewport-h-sm` | color-picker 的 control 部件 max-block-size 覆盖槽。 |
| `--xh-color-picker-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` | color-picker 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-color-picker-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_color-picker-px` | color-picker 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-color-picker-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` | color-picker 的 control 部件 border-radius 覆盖槽。 |
| `--xh-color-picker-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` | color-picker 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-color-picker-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` | color-picker 的 root 部件 inline-size、min-inline-size 覆盖槽。 |
| `--xh-color-picker-gap` | `root` | `gap` | `default` | `--xh-space-1` | color-picker 的 root 部件 gap 覆盖槽。 |
| `--xh-color-picker-hue-slider-gap` | `hue-slider` | `gap` | `default` | `--xh-stack-gap-md` | color-picker 的 hue-slider 部件 gap 覆盖槽。 |
| `--xh-color-picker-input-bg` | `channel-input` | `background` | `default` | `transparent` | color-picker 的 channel-input 部件 background 覆盖槽。 |
| `--xh-color-picker-input-bg-disabled` | `channel-input` | `background` | `disabled` | `--xh-bg-subtle` | color-picker 的 channel-input 部件 background 覆盖槽。 |
| `--xh-color-picker-input-bg-readonly` | `channel-input` | `background` | `readonly` | `--xh-bg-subtle` | color-picker 的 channel-input 部件 background 覆盖槽。 |
| `--xh-color-picker-input-border` | `channel-input` | `border` | `default` | `--xh-border-control` | color-picker 的 channel-input 部件 border 覆盖槽。 |
| `--xh-color-picker-input-border-focus` | `channel-input` | `border-color` | `focus-visible` | `--xh-border-control-focus` | color-picker 的 channel-input 部件 border-color 覆盖槽。 |
| `--xh-color-picker-input-border-invalid` | `channel-input` | `border-color` | `invalid` | `--xh-border-invalid` | color-picker 的 channel-input 部件 border-color 覆盖槽。 |
| `--xh-color-picker-input-font-size` | `channel-input` | `font-size` | `default` | `--xh-text-secondary-size` | color-picker 的 channel-input 部件 font-size 覆盖槽。 |
| `--xh-color-picker-input-h` | `channel-input` | `block-size` | `default` | `--xh-control-h-sm` | color-picker 的 channel-input 部件 block-size 覆盖槽。 |
| `--xh-color-picker-input-px` | `channel-input` | `padding-inline` | `default` | `--xh-control-px-sm` | color-picker 的 channel-input 部件 padding-inline 覆盖槽。 |
| `--xh-color-picker-input-radius` | `channel-input` | `border-radius` | `default` | `--xh-shape-control` | color-picker 的 channel-input 部件 border-radius 覆盖槽。 |
| `--xh-color-picker-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | color-picker 的 label 部件 color 覆盖槽。 |
| `--xh-color-picker-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | color-picker 的 label 部件 font-size 覆盖槽。 |
| `--xh-color-picker-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | color-picker 的 label 部件 font-weight 覆盖槽。 |
| `--xh-color-picker-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | color-picker 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-color-picker-max-h` | `content` | `max-block-size` | `default` | `--xh-viewport-h-md` | color-picker 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-color-picker-saturation-area-h` | `saturation-area` | `block-size` | `default` | `9rem` | color-picker 的 saturation-area 部件 block-size 覆盖槽。 |
| `--xh-color-picker-saturation-area-radius` | `saturation-area` | `border-radius` | `default` | `--xh-shape-control` | color-picker 的 saturation-area 部件 border-radius 覆盖槽。 |
| `--xh-color-picker-slider-thumb-size` | `alpha-slider`<br>`hue-slider` | `--xh-_thumb-size` | `default` | `--xh-track-thumb-size` | color-picker 的 alpha-slider、hue-slider 部件 --xh-_thumb-size 覆盖槽。 |
| `--xh-color-picker-slider-track-thickness` | `alpha-slider`<br>`hue-slider` | `--xh-_track-thickness` | `default` | `--xh-space-3` | color-picker 的 alpha-slider、hue-slider 部件 --xh-_track-thickness 覆盖槽。 |
| `--xh-color-picker-swatch-border` | `swatch` | `--xh-swatch-border` | `default` | `--xh-border-default` | color-picker 的 swatch 部件 --xh-swatch-border 覆盖槽。 |
| `--xh-color-picker-swatch-cell` | `recent-swatch-picker`<br>`swatch-picker` | `--xh-_color-swatch-picker-cell` | `is([data-part='swatch-picker'], [data-part='recent-swatch-picker'])` | `--xh-control-h-sm` | color-picker 的 recent-swatch-picker、swatch-picker 部件 --xh-_color-swatch-picker-cell 覆盖槽。 |
| `--xh-color-picker-swatch-gap` | `recent-swatch-picker`<br>`swatch-picker` | `gap` | `is([data-part='swatch-picker'], [data-part='recent-swatch-picker'])` | `--xh-control-gap-sm` | color-picker 的 recent-swatch-picker、swatch-picker 部件 gap 覆盖槽。 |
| `--xh-color-picker-swatch-icon-size` | `recent-swatch-picker`<br>`swatch-picker` | `--xh-icon-size` | `is([data-part='swatch-picker'], [data-part='recent-swatch-picker'])` | `--xh-_color-swatch-picker-mark` | color-picker 的 recent-swatch-picker、swatch-picker 部件 --xh-icon-size 覆盖槽。 |
| `--xh-color-picker-swatch-picker-gap` | `recent-swatch-picker`<br>`swatch-picker` | `gap` | `is([data-part='swatch-picker'], [data-part='recent-swatch-picker'])` | `--xh-_color-swatch-picker-gap` | color-picker 的 recent-swatch-picker、swatch-picker 部件 gap 覆盖槽。 |
| `--xh-color-picker-swatch-radius` | `swatch` | `--xh-swatch-radius` | `default` | `--xh-shape-inset` | color-picker 的 swatch 部件 --xh-swatch-radius 覆盖槽。 |
| `--xh-color-picker-swatch-size` | `swatch` | `--xh-swatch-size` | `default` | `--xh-_swatch-size` | color-picker 的 swatch 部件 --xh-swatch-size 覆盖槽。 |
| `--xh-color-picker-tag-dot-border` | `root`<br>`tag-list` | `border` | `value` | `--xh-border-default` | color-picker 的 root、tag-list 部件 border 覆盖槽。 |
| `--xh-color-picker-tag-dot-size` | `root`<br>`tag-list` | `block-size`<br>`inline-size` | `value` | `--xh-control-indicator-sm` | color-picker 的 root、tag-list 部件 block-size、inline-size 覆盖槽。 |
| `--xh-color-picker-tag-list-gap` | `tag-list` | `gap` | `xh-tag-list` | `--xh-space-1` | color-picker 的 tag-list 部件 gap 覆盖槽。 |
| `--xh-color-picker-thumb-border` | `area-thumb` | `border` | `default` | `--xh-color-neutral-0` | color-picker 的 area-thumb 部件 border 覆盖槽。 |
| `--xh-color-picker-thumb-radius` | `area-thumb` | `border-radius` | `default` | `--xh-shape-circle` | color-picker 的 area-thumb 部件 border-radius 覆盖槽。 |
| `--xh-color-picker-thumb-scale-dragging` | `area-thumb` | `scale` | `dragging` | `--xh-motion-scale-drag` | color-picker 的 area-thumb 部件 scale 覆盖槽。 |
| `--xh-color-picker-thumb-shadow` | `area-thumb` | `box-shadow` | `default` | `--xh-elevation-raised` | color-picker 的 area-thumb 部件 box-shadow 覆盖槽。 |
| `--xh-color-picker-thumb-size` | `area-thumb` | `block-size`<br>`inline-size`<br>`margin-block-start`<br>`margin-inline-start` | `default` | `14px` | color-picker 的 area-thumb 部件 block-size、inline-size、margin-block-start、margin-inline-start 覆盖槽。 |
| `--xh-color-picker-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | color-picker 的 trigger 部件 color 覆盖槽。 |
| `--xh-color-picker-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-text-body-size` | color-picker 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-color-picker-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_color-picker-gap` | color-picker 的 trigger 部件 gap 覆盖槽。 |
| `--xh-color-picker-value-fg` | `value-text` | `color` | `default` | `--xh-fg-default` | color-picker 的 value-text 部件 color 覆盖槽。 |
| `--xh-color-picker-value-font-size` | `value-text` | `font-size` | `default` | `--xh-text-body-size` | color-picker 的 value-text 部件 font-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 切换 · 指示与换位 · 出现（锚定列表） · 出现（无锚定弹出）（见[动效规范](../design/motion#角色)）。

可覆盖的动效槽：`--xh-color-picker-thumb-scale-dragging`。

共享关键帧 `xh-fade-out` · `xh-overlay-slide-in` · `xh-overlay-slide-out` · `xh-pop-in` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`background-color` · `border-color` · `scale` · `translate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

- 浮层的宽度与高度分别受可用空间约束，窄视口下面板不会超出屏幕，容纳不下时在面板内滚动。
- 粗指针下命中区是取色面、滑块整条与色板整格。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

- `dir="rtl"` 只对调横轴（取色面的饱和度、两条滑块）上左右方向键与指针的语义，上下方向键始终是屏幕向上为增大。
