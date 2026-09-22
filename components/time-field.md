来源：https://ui.docs.xihanfun.com/components/time-field

# TimeField 时间字段

按时、分、秒逐段输入时间，适合已经知道目标时间、无需打开选择面板的场景。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/time-field" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/time-field.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/time-field" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/time-field" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/time-field.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

逐段输入并实时获得标准时间值；有值时可以一键清空

```vue
<script setup lang="ts">
import {
  XhTimeFieldClearTrigger,
  XhTimeFieldControl,
  XhTimeFieldHiddenInput,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("09:30");
</script>

<template>
  <XhTimeFieldRoot v-model:value="value" name="start-time">
    <XhTimeFieldLabel>开始时间</XhTimeFieldLabel>
    <XhTimeFieldControl>
      <XhTimeFieldSegmentGroup>
        <XhTimeFieldSegment segment="hour" />
        <span>:</span>
        <XhTimeFieldSegment segment="minute" />
      </XhTimeFieldSegmentGroup>
      <XhTimeFieldClearTrigger />
    </XhTimeFieldControl>
    <XhTimeFieldHiddenInput />
  </XhTimeFieldRoot>

  <span aria-live="polite" style="font-size: 13px">
    当前值：{{ value || "（未填齐）" }}
  </span>
</template>
```

```html
<xh-time-field id="time-field-basic" name="start-time" value="09:30">
  <div data-xh-part="root">
    <label data-xh-part="label">开始时间</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <input data-xh-part="hidden-input" />
  </div>
</xh-time-field>

<span aria-live="polite" style="font-size: 13px">
  当前值：<span id="time-field-basic-value">09:30</span>
</span>

<script type="module">
  const field = document.getElementById("time-field-basic");
  const readout = document.getElementById("time-field-basic-value");

  field.addEventListener("value-change", (event) => {
    const next = event.detail.value;
    field.value = next;
    readout.textContent = next || "（未填齐）";
  });
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="time-field"`：**`root`** · `label` · **`control`** · `segment-group` · **`segment`** · `clear-trigger` · `hidden-input`

## 示例

### 12 小时制

hour-cycle=12 多出一个上午/下午段，值本身仍是 24 小时的串

```vue
<script setup lang="ts">
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("13:45");
</script>

<template>
  <XhTimeFieldRoot v-model:value="value" :hour-cycle="12">
    <XhTimeFieldLabel>会议时间</XhTimeFieldLabel>
    <XhTimeFieldControl>
      <XhTimeFieldSegmentGroup>
        <XhTimeFieldSegment segment="hour" />
        <span>:</span>
        <XhTimeFieldSegment segment="minute" />
        <span>&nbsp;</span>
        <!-- 在这一段上按 a / p 直接指定上下午，翻面只改值不改数字 -->
        <XhTimeFieldSegment segment="dayPeriod" />
      </XhTimeFieldSegmentGroup>
    </XhTimeFieldControl>
  </XhTimeFieldRoot>

  <span style="font-size: 13px">当前值：{{ value || "（未填齐）" }}</span>
</template>
```

```html
<div style="display: grid; gap: 8px; justify-items: start">
  <xh-time-field id="time-field-hour-cycle" hour-cycle="12" default-value="13:45">
    <div data-xh-part="root">
      <label data-xh-part="label">会议时间</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
          <span>&nbsp;</span>
          <!-- 在这一段上按 a / p 直接指定上下午，翻面只改值不改数字 -->
          <span data-xh-part="segment" segment="dayPeriod"></span>
        </div>
      </div>
    </div>
  </xh-time-field>

  <span style="font-size: 13px">当前值：<span id="time-field-hour-cycle-readout">13:45</span></span>
</div>

<script type="module">
  // 值变化回显在下面那行文字里
  const field = document.getElementById("time-field-hour-cycle");
  const readout = document.getElementById("time-field-hour-cycle-readout");
  field.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value || "（未填齐）";
  });
</script>
```

### 精度到秒

granularity=second 使秒段显示并参与值，空段按上下键从该段边界起步

```vue
<script setup lang="ts">
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("");
</script>

<template>
  <XhTimeFieldRoot v-model:value="value" granularity="second">
    <XhTimeFieldLabel>定时</XhTimeFieldLabel>
    <XhTimeFieldControl>
      <XhTimeFieldSegmentGroup>
        <XhTimeFieldSegment segment="hour" />
        <span>:</span>
        <XhTimeFieldSegment segment="minute" />
        <span>:</span>
        <XhTimeFieldSegment segment="second" />
      </XhTimeFieldSegmentGroup>
    </XhTimeFieldControl>
  </XhTimeFieldRoot>

  <span style="font-size: 13px">当前值：{{ value || "（未填齐）" }}</span>
</template>
```

```html
<div style="display: grid; gap: 8px; justify-items: start">
  <xh-time-field id="time-field-granularity" granularity="second">
    <div data-xh-part="root">
      <label data-xh-part="label">定时</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="second"></span>
        </div>
      </div>
    </div>
  </xh-time-field>

  <span style="font-size: 13px">当前值：<span id="time-field-granularity-readout">（未填齐）</span></span>
</div>

<script type="module">
  // 值变化回显在下面那行文字里
  const field = document.getElementById("time-field-granularity");
  const readout = document.getElementById("time-field-granularity-readout");
  field.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value || "（未填齐）";
  });
</script>
```

### 禁用与越界

禁用整组退出 Tab 序列；越界只做标注，08:00 原样保留不被改写

```vue
<script setup lang="ts">
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 16px">
    <XhTimeFieldRoot default-value="13:45" disabled>
      <XhTimeFieldLabel>禁用</XhTimeFieldLabel>
      <XhTimeFieldControl>
        <XhTimeFieldSegmentGroup>
          <XhTimeFieldSegment segment="hour" />
          <span>:</span>
          <XhTimeFieldSegment segment="minute" />
        </XhTimeFieldSegmentGroup>
      </XhTimeFieldControl>
    </XhTimeFieldRoot>

    <XhTimeFieldRoot default-value="08:00" min="09:00" max="18:00">
      <XhTimeFieldLabel>越界（09:00 – 18:00）</XhTimeFieldLabel>
      <XhTimeFieldControl>
        <XhTimeFieldSegmentGroup>
          <XhTimeFieldSegment segment="hour" />
          <span>:</span>
          <XhTimeFieldSegment segment="minute" />
        </XhTimeFieldSegmentGroup>
      </XhTimeFieldControl>
    </XhTimeFieldRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px; justify-items: start">
  <xh-time-field default-value="13:45" disabled>
    <div data-xh-part="root">
      <label data-xh-part="label">禁用</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
      </div>
    </div>
  </xh-time-field>

  <xh-time-field default-value="08:00" min="09:00" max="18:00">
    <div data-xh-part="root">
      <label data-xh-part="label">越界（09:00 – 18:00）</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
      </div>
    </div>
  </xh-time-field>
</div>
```

### 变体

variant 只改变分段框的底色与描边用法，分段结构与键盘行为都不变

```vue
<script setup lang="ts">
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
</script>

<template>
  <div style="display: grid; gap: 16px; justify-items: start">
    <XhTimeFieldRoot v-for="v in variants" :key="v" :variant="v" default-value="09:30">
      <XhTimeFieldLabel>{{ v }}</XhTimeFieldLabel>
      <XhTimeFieldControl>
        <XhTimeFieldSegmentGroup>
          <XhTimeFieldSegment segment="hour" />
          <span>:</span>
          <XhTimeFieldSegment segment="minute" />
        </XhTimeFieldSegmentGroup>
      </XhTimeFieldControl>
    </XhTimeFieldRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px; justify-items: start">
  <xh-time-field variant="outline" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">outline</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
      </div>
    </div>
  </xh-time-field>

  <xh-time-field variant="subtle" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">subtle</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
      </div>
    </div>
  </xh-time-field>

  <xh-time-field variant="ghost" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">ghost</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
      </div>
    </div>
  </xh-time-field>
</div>
```

### 颜色

tone 决定使用哪族颜色，与 variant 正交；这里固定 subtle 形态，只查看语气这一轴

```vue
<script setup lang="ts">
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhTimeFieldRoot v-for="t in tones" :key="t" variant="subtle" :tone="t" default-value="09:30">
      <XhTimeFieldLabel>{{ t }}</XhTimeFieldLabel>
      <XhTimeFieldControl>
        <XhTimeFieldSegmentGroup>
          <XhTimeFieldSegment segment="hour" />
          <span>:</span>
          <XhTimeFieldSegment segment="minute" />
        </XhTimeFieldSegmentGroup>
      </XhTimeFieldControl>
    </XhTimeFieldRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-time-field variant="subtle" tone="brand" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">brand</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
      </div>
    </div>
  </xh-time-field>

  <xh-time-field variant="subtle" tone="neutral" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">neutral</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
      </div>
    </div>
  </xh-time-field>

  <xh-time-field variant="subtle" tone="success" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">success</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
      </div>
    </div>
  </xh-time-field>

  <xh-time-field variant="subtle" tone="warning" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">warning</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
      </div>
    </div>
  </xh-time-field>

  <xh-time-field variant="subtle" tone="danger" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">danger</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
      </div>
    </div>
  </xh-time-field>

  <xh-time-field variant="subtle" tone="info" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">info</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
      </div>
    </div>
  </xh-time-field>
</div>
```

### 尺寸

不传 size 即默认档；行高、内边距与字号一起换档，标题也随之变化

```vue
<script setup lang="ts">
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/vue";

const sizes = [
  { size: "sm", label: "sm" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "lg" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px">
    <XhTimeFieldRoot v-for="s in sizes" :key="s.label" :size="s.size" default-value="09:30">
      <XhTimeFieldLabel>{{ s.label }}</XhTimeFieldLabel>
      <XhTimeFieldControl>
        <XhTimeFieldSegmentGroup>
          <XhTimeFieldSegment segment="hour" />
          <span>:</span>
          <XhTimeFieldSegment segment="minute" />
        </XhTimeFieldSegmentGroup>
      </XhTimeFieldControl>
    </XhTimeFieldRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px">
  <xh-time-field size="sm" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">sm</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
      </div>
    </div>
  </xh-time-field>

  <xh-time-field default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">默认</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
      </div>
    </div>
  </xh-time-field>

  <xh-time-field size="lg" default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label">lg</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
      </div>
    </div>
  </xh-time-field>
</div>
```

### 外部写值与清空

值由宿主持有，按钮直接写值；框内自带清空按钮，有值时才显示，点击后焦点回到第一段

```vue
<script setup lang="ts">
import {
  XhButton,
  XhTimeFieldClearTrigger,
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("");

// 此刻的时分，两位补零
function now() {
  const d = new Date();
  const h = `${d.getHours()}`.padStart(2, "0");
  const m = `${d.getMinutes()}`.padStart(2, "0");
  return `${h}:${m}`;
}
</script>

<template>
  <XhTimeFieldRoot
    v-slot="{ empty, outOfRange, setValue }"
    v-model:value="value"
    min="09:00"
    max="18:00"
  >
    <XhTimeFieldLabel>上门时间</XhTimeFieldLabel>
    <XhTimeFieldControl>
      <XhTimeFieldSegmentGroup>
        <XhTimeFieldSegment segment="hour" />
        <span>:</span>
        <XhTimeFieldSegment segment="minute" />
      </XhTimeFieldSegmentGroup>
      <!-- 一段都没填时这颗按钮收起 -->
      <XhTimeFieldClearTrigger />
    </XhTimeFieldControl>

    <div style="display: flex; gap: 8px">
      <XhButton size="sm" variant="outline" @click="setValue(now())">此刻</XhButton>
      <XhButton size="sm" variant="outline" @click="setValue('09:00')">
        开门时间
      </XhButton>
    </div>

    <span style="font-size: 13px">
      {{ empty ? "未填齐" : outOfRange ? "不在营业时段（09:00 – 18:00）" : "可上门" }}
    </span>
  </XhTimeFieldRoot>
</template>
```

```html
<xh-time-field id="time-field-actions" value="" min="09:00" max="18:00">
  <div data-xh-part="root">
    <label data-xh-part="label">上门时间</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" segment="hour"></span>
        <span>:</span>
        <span data-xh-part="segment" segment="minute"></span>
      </div>
      <!-- 一段都没填时这颗按钮收起 -->
      <button data-xh-part="clear-trigger"></button>
    </div>

    <div style="display: flex; gap: 8px">
      <xh-button id="time-field-actions-now" size="sm" variant="outline">
        <button data-xh-part="root">此刻</button>
      </xh-button>
      <xh-button id="time-field-actions-open" size="sm" variant="outline">
        <button data-xh-part="root">开门时间</button>
      </xh-button>
    </div>

    <span id="time-field-actions-status" style="font-size: 13px">未填齐</span>
  </div>
</xh-time-field>

<script type="module">
  const field = document.getElementById("time-field-actions");
  const root = field.querySelector('[data-xh-part="root"]');
  const status = document.getElementById("time-field-actions-status");

  // 此刻的时分，两位补零
  function now() {
    const d = new Date();
    return `${`${d.getHours()}`.padStart(2, "0")}:${`${d.getMinutes()}`.padStart(2, "0")}`;
  }

  // 空与越界两个判据落在根节点上，等这一轮更新写完再读
  async function sync() {
    await field.updateComplete;
    const empty = root.hasAttribute("data-empty");
    const outOfRange = root.hasAttribute("data-out-of-range");
    status.textContent = empty
      ? "未填齐"
      : outOfRange
        ? "不在营业时段（09:00 – 18:00）"
        : "可上门";
  }

  function write(next) {
    field.value = next;
    void sync();
  }

  field.addEventListener("value-change", (event) => write(event.detail.value));
  document.getElementById("time-field-actions-now").addEventListener("click", () => write(now()));
  document.getElementById("time-field-actions-open").addEventListener("click", () => write("09:00"));
</script>
```

### 可选值白名单

值交给宿主持有，写回的时间被吸附到清单中的一格，上下键与数字键因此都落在清单上

```vue
<script setup lang="ts">
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const allowed = ["08:00", "12:00", "18:00"];

const value = ref(allowed[0]);

// 比原值大就取清单里的下一格，比原值小就取上一格，走到头回绕
function snap(next: string) {
  if (next === "" || allowed.includes(next))
    return next;
  const forward = next > value.value;
  const hit = forward
    ? allowed.find(t => t > next)
    : [...allowed].reverse().find(t => t < next);
  return hit ?? (forward ? allowed[0] : allowed[allowed.length - 1]);
}
</script>

<template>
  <!-- 受控写法：值不交给组件自己存，写入意图先过一遍 snap -->
  <XhTimeFieldRoot :value="value" @update:value="value = snap($event)">
    <XhTimeFieldLabel>发车时刻</XhTimeFieldLabel>
    <XhTimeFieldControl>
      <XhTimeFieldSegmentGroup>
        <XhTimeFieldSegment segment="hour" />
        <span>:</span>
        <XhTimeFieldSegment segment="minute" />
      </XhTimeFieldSegmentGroup>
    </XhTimeFieldControl>
  </XhTimeFieldRoot>

  <span style="font-size: 13px">
    只收 {{ allowed.join(" / ") }}，当前值：{{ value || "（空）" }}
  </span>
</template>
```

```html
<div style="display: grid; gap: 8px; justify-items: start">
  <!-- 受控写法：值不交给组件自己存，写入意图先过一遍 snap -->
  <xh-time-field id="time-field-whitelist" value="08:00">
    <div data-xh-part="root">
      <label data-xh-part="label">发车时刻</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
      </div>
    </div>
  </xh-time-field>

  <span style="font-size: 13px">
    只收 08:00 / 12:00 / 18:00，当前值：<span id="time-field-whitelist-readout">08:00</span>
  </span>
</div>

<script type="module">
  const field = document.getElementById("time-field-whitelist");
  const readout = document.getElementById("time-field-whitelist-readout");
  const allowed = ["08:00", "12:00", "18:00"];
  let value = allowed[0];

  // 比原值大就取清单里的下一格，比原值小就取上一格，走到头回绕
  function snap(next) {
    if (next === "" || allowed.includes(next)) return next;
    const forward = next > value;
    const hit = forward
      ? allowed.find((t) => t > next)
      : [...allowed].reverse().find((t) => t < next);
    return hit ?? (forward ? allowed[0] : allowed[allowed.length - 1]);
  }

  field.addEventListener("value-change", (event) => {
    value = snap(event.detail.value);
    field.value = value;
    readout.textContent = value || "（空）";
  });
</script>
```

## 设计指引

### 何时使用

- 用户知道确切时间，键入比浏览列表更快。
- 需要 12 小时制并带上下午段位。

### 何时不用

- 需要从固定的整点或半点中选择时，使用[时间选择器](./time-picker)。
- 需要日期时，使用[日期字段](./date-field)。

### 特性

- `hourCycle` 切换 12 / 24 小时制，12 小时制时自动增加上下午段位。
- `granularity` 决定精确到分还是到秒。
- `min` / `max` 越界时只标注不改写。
- 标准组合包含标签、输入框、时间段和隐藏表单输入；聚焦只强调正在编辑的时间段。
- 框内自带清空按钮（`clear-trigger`）：有值时才显示，点击后焦点回到第一段。
- 聚焦环、边框和当前段位使用同一段短过渡，焦点进入与离开不会瞬时跳变。

### 组合

- 外层放[表单字段](./field)；与[日期字段](./date-field)并排组成日期时间。

### 最佳实践

- 明确时区归属：组件处理的是本地时间，时区换算由宿主负责。
- 给参与表单提交的字段设置 `name`，并渲染隐藏输入部件。
- 12 小时制下上下午段位不能省略，否则用户输入的时间有歧义。

### 反模式

- 用文本输入接收时间再解析。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-time-field>` |
| Vue 组件 | `XhTimeFieldClearTrigger` `XhTimeFieldControl` `XhTimeFieldHiddenInput` `XhTimeFieldLabel` `XhTimeFieldRoot` `XhTimeFieldSegment` `XhTimeFieldSegmentGroup` |
| 组合式函数 | `useTimeField` |
| 状态机 | `timeFieldMachine` |
| 皮肤 | `@xihan-ui/styles/time-field.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 受控值，ISO 时间串。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 |
| `defaultValue` | `string` |  |  |
| `min` | `string` |  | 下界（含）。只用于标注越界，不改写用户填写的内容。 |
| `max` | `string` |  | 上界（含）。同上。 |
| `locale` | `string` |  | BCP 47 语言标记。决定上午 / 下午的文字，以及未显式提供 hourCycle 时的小时制。 |
| `hourCycle` | `TimeHourCycle` |  | 小时制。未提供时按 locale 推断，locale 也没有时使用 24。 |
| `granularity` | `TimeGranularity` |  | 值精确到哪一段，默认 minute。 |
| `disabled` | `boolean` |  | 禁用：段整体退出 Tab 序列、键盘一概不响应，隐藏输入不参与提交。 |
| `readOnly` | `boolean` |  | 只读：仍可聚焦、可用左右键在段间移动，但不可修改值。 |
| `invalid` | `boolean` |  | 校验失败标注。 |
| `required` | `boolean` |  | 必填标注（写入每段的 aria-required）。 |
| `name` | `string` |  | 表单字段名；提供后隐藏输入才带 name，值随表单一并提交。 |
| `placeholder` | `string` |  | 空段的占位字符（单字符），按段宽重复，默认 '-'。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定底色与描边的绘制方式。默认 outline。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与强调使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<TimeFieldTranslations>` |  | 段位读屏名的覆盖；未提供时使用内置英文语义名。 |
| `onValueChange` | `(details: TimeFieldValueChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TimeFieldValueChangeDetails` | 值变化；detail 为 `{ value: string }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTimeFieldRoot` | `default` | `TimeFieldRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.CLEAR` · `SEGMENT.STEP` · `SEGMENT.DIGIT` · `SEGMENT.CLEAR` · `SEGMENT.PERIOD` · `SEGMENT.FOCUS` · `SEGMENT.BLUR` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`canEdit` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` | ISO 时间串；任一必填段为空时为空串。 |
| `empty` | `boolean` | 值为空串（尚未填全）。作者据此启用提交按钮或显示提示。 |
| `outOfRange` | `boolean` | 已填全但落在 min / max 之外。只是标注，不改写值。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `canClear` | `boolean` | 有值且可编辑（既不 disabled 也不 readOnly）；清空按钮据此显隐。 |
| `hourCycle` | `TimeHourCycle` | 实际生效的小时制（prop 未提供时由 locale 推断的值）。 |
| `granularity` | `TimeGranularity` |  |
| `segments` | `TimeSegmentType[]` | 当前参与显示的段，文档序。未列入的段由 connect 写上 hidden 收起。 |
| `focusedSegment` | `TimeSegmentType \| null` | 焦点所在段；焦点在组外时为 null。 |
| `getSegmentText` | `(props: TimeFieldSegmentProps) => string` | 某一段应显示的文字（空段是占位串）。各适配器都用它填充文本，保证同构。 |
| `setValue` | `(next: string) => void` |  |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getSegmentGroupProps` | `() => T['element']` | 段位与分隔符的外壳：占满盒内剩余宽度，把清空按钮推到框内末端。 |
| `getSegmentProps` | `(props: TimeFieldSegmentProps) => T['element']` |  |
| `getClearTriggerProps` | `() => T['button']` | 清空按钮：有值才显示，不占 Tab 位，点击后焦点回到第一段。 |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：一份 type=hidden 的原生输入，随表单提交 ISO 串。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowUp` | focus in a segment, not disabled/readOnly | 本段加一格，到头回绕；空段落到该段下界 |
| `ArrowDown` | focus in a segment, not disabled/readOnly | 本段减一格，到头回绕；空段落到该段上界 |
| `ArrowRight` | focus in a segment, not disabled | 焦点移到下一段；已在末段则不动，不回绕 |
| `ArrowLeft` | focus in a segment, not disabled | 焦点移到上一段；已在首段则不动，不回绕 |
| `Home` | focus in a segment, not disabled | 焦点移到首段 |
| `End` | focus in a segment, not disabled | 焦点移到末段 |
| `0-9` | focus in a 数字段, not disabled/readOnly | 把数字并进本段；本段再吃不下第二位时自动跳到下一段 |
| `Backspace` / `Delete` | focus in a segment, not disabled/readOnly | 清掉本段；小时被清时上下午段仍保留原来的上午/下午 |
| `Enter` / `Space` | held in clear-trigger, 有值, not disabled/readOnly | 按住期间清空按钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，值清空后按钮藏起一并撤下。清空按钮不占 Tab 位，键盘这一路只在焦点落到它身上时有面 |
| `a` / `p` | focus in 上下午段, 12 小时制, not disabled/readOnly | a 取上午、p 取下午（不区分大小写） |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `control` | `aria-disabled` | 'true' \| 'false' |
| `control` | `aria-invalid` | 'true' \| 'false' |
| `control` | `aria-labelledby` | `label` 部件的 id |
| `control` | `role` | 'group' |
| `segment` | `aria-disabled` | 'true' \| 'false' |
| `segment` | `aria-invalid` | 'true' \| 'false' |
| `segment` | `aria-label` | prop('translations')?.[segment] |
| `segment` | `aria-readonly` | 'true' \| 'false' |
| `segment` | `aria-required` | 'true' \| 'false' |
| `segment` | `aria-valuemax` | range.max |
| `segment` | `aria-valuemin` | range.min |
| `segment` | `aria-valuenow` | segmentNumber(draft, segment, hourCycle) |
| `segment` | `aria-valuetext` | timeSegmentText(draft, segment, { hourCycle, locale, … |
| `segment` | `role` | 'spinbutton' |
| `clear-trigger` | `aria-label` | props.translations.clearTrigger |

## 样式参考

### 皮肤

`@xihan-ui/styles/time-field.css` 使用 `[data-scope="time-field"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-out-of-range` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-empty` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `segment-group` | `data-disabled` | ''（条件成立时才出现） |
| `segment-group` | `data-invalid` | ''（条件成立时才出现） |
| `segment-group` | `data-readonly` | ''（条件成立时才出现） |
| `segment` | `data-disabled` | ''（条件成立时才出现） |
| `segment` | `data-focus` | ''（条件成立时才出现） |
| `segment` | `data-invalid` | ''（条件成立时才出现） |
| `segment` | `data-placeholder` | ''（条件成立时才出现） |
| `segment` | `data-readonly` | ''（条件成立时才出现） |
| `clear-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'has-value' |
| `clear-trigger` | `data-xh-action-has-value` | ''（条件成立时才出现） |
| `clear-trigger` | `data-xh-action-profile` | 'field-inset' |
| `clear-trigger` | `data-xh-action-size` | props.size |
| `clear-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-time-field-action-bg` | `clear-trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | time-field 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-time-field-action-bg-active` | `clear-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | time-field 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-time-field-action-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | time-field 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-time-field-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | time-field 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-time-field-action-fg-hover` | `clear-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` | time-field 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-time-field-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | time-field 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-time-field-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-inset` | time-field 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-time-field-action-size` | `clear-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` | time-field 的 clear-trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-time-field-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` | time-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-time-field-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` | time-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-time-field-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` | time-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-time-field-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` | time-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-time-field-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` | time-field 的 control 部件 border 覆盖槽。 |
| `--xh-time-field-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` | time-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-time-field-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` | time-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-time-field-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` | time-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-time-field-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` | time-field 的 control 部件 color 覆盖槽。 |
| `--xh-time-field-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_time-field-gap` | time-field 的 control 部件 gap 覆盖槽。 |
| `--xh-time-field-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_time-field-control-h` | time-field 的 control 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-time-field-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` | time-field 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-time-field-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_time-field-control-px` | time-field 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-time-field-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` | time-field 的 control 部件 border-radius 覆盖槽。 |
| `--xh-time-field-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` | time-field 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-time-field-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` | time-field 的 root 部件 inline-size、min-inline-size 覆盖槽。 |
| `--xh-time-field-font-size` | `control` | `font-size` | `default` | `--xh-_time-field-font-size` | time-field 的 control 部件 font-size 覆盖槽。 |
| `--xh-time-field-gap` | `root` | `gap` | `default` | `--xh-space-1` | time-field 的 root 部件 gap 覆盖槽。 |
| `--xh-time-field-icon-size` | `control`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | time-field 的 control、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-time-field-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | time-field 的 label 部件 color 覆盖槽。 |
| `--xh-time-field-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | time-field 的 label 部件 color 覆盖槽。 |
| `--xh-time-field-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | time-field 的 label 部件 font-size 覆盖槽。 |
| `--xh-time-field-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | time-field 的 label 部件 font-weight 覆盖槽。 |
| `--xh-time-field-literal-fg` | `segment-group` | `color` | `not([data-scope])` | `--xh-fg-subtle` | time-field 的 segment-group 部件 color 覆盖槽。 |
| `--xh-time-field-placeholder-fg` | `segment` | `color` | `placeholder` | `--xh-fg-subtle` | time-field 的 segment 部件 color 覆盖槽。 |
| `--xh-time-field-segment-bg-focus` | `segment` | `background` | `disabled`<br>`focus`<br>`focus-visible`<br>`not([data-disabled])` | `--xh-_time-field-segment-bg` | time-field 的 segment 部件 background 覆盖槽。 |
| `--xh-time-field-segment-bg-hover` | `segment` | `background` | `disabled`<br>`focus`<br>`hover`<br>`not([data-focus], [data-disabled])` | `--xh-bg-subtle` | time-field 的 segment 部件 background 覆盖槽。 |
| `--xh-time-field-segment-bg-invalid-focus` | `segment` | `background` | `focus`<br>`invalid`<br>`is([data-focus], :focus-visible)` | `--xh-bg-subtle` | time-field 的 segment 部件 background 覆盖槽。 |
| `--xh-time-field-segment-fg-focus` | `segment` | `color` | `disabled`<br>`focus`<br>`focus-visible`<br>`not([data-disabled])`<br>`placeholder` | `--xh-_time-field-segment-fg` | time-field 的 segment 部件 color 覆盖槽。 |
| `--xh-time-field-segment-fg-invalid` | `segment` | `color` | `invalid` | `--xh-fg-danger` | time-field 的 segment 部件 color 覆盖槽。 |
| `--xh-time-field-segment-fg-invalid-focus` | `segment` | `color` | `focus`<br>`invalid`<br>`is([data-focus], :focus-visible)` | `--xh-fg-danger` | time-field 的 segment 部件 color 覆盖槽。 |
| `--xh-time-field-segment-px` | `segment` | `padding-inline` | `default` | `--xh-space-0_5` | time-field 的 segment 部件 padding-inline 覆盖槽。 |
| `--xh-time-field-segment-py` | `segment` | `padding-block` | `default` | `--xh-space-0` | time-field 的 segment 部件 padding-block 覆盖槽。 |
| `--xh-time-field-segment-radius` | `segment` | `border-radius` | `default` | `--xh-shape-inset` | time-field 的 segment 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
