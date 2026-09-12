来源：https://ui.docs.xihanfun.com/components/time-field

# TimeField `时间输入`

分段的时间输入框：时、分、秒各占一段，方向键加减。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/time-field" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/time-field.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/time-field" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/time-field" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/time-field.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

默认 24 小时制，上下键在段区间里回绕，缺一段整份值就退回空串

```vue
<script setup lang="ts">
import {
  XhTimeFieldControl,
  XhTimeFieldHiddenInput,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref("");
</script>

<template>
  <XhTimeFieldRoot v-model:value="value" name="start">
    <XhTimeFieldLabel>开始时间</XhTimeFieldLabel>
    <XhTimeFieldControl>
      <XhTimeFieldSegmentGroup>
        <!-- 段的身份由作者声明；中间的「:」是普通节点，换段时不会被当成一站 -->
        <XhTimeFieldSegment segment="hour" />
        <span>:</span>
        <XhTimeFieldSegment segment="minute" />
      </XhTimeFieldSegmentGroup>
    </XhTimeFieldControl>
    <!-- 表单出口：缺段时它就是空的 -->
    <XhTimeFieldHiddenInput />
  </XhTimeFieldRoot>

  <span style="font-size: 13px">当前值：{{ value || "（未填齐）" }}</span>
</template>
```

```html
<div style="display: grid; gap: 8px; justify-items: start">
  <xh-time-field id="time-field-basic" name="start">
    <div data-xh-part="root">
      <label data-xh-part="label">开始时间</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <!-- 段的身份由作者声明；中间的「:」是普通节点，换段时不会被当成一站 -->
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
      </div>
      <!-- 表单出口：缺段时它就是空的 -->
      <input data-xh-part="hidden-input" />
    </div>
  </xh-time-field>

  <span style="font-size: 13px">当前值：<span id="time-field-basic-readout">（未填齐）</span></span>
</div>

<script type="module">
  // 值变化回显在下面那行文字里
  const field = document.getElementById("time-field-basic");
  const readout = document.getElementById("time-field-basic-readout");
  field.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value || "（未填齐）";
  });
</script>
```

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

granularity=second 让秒段显出来并参与值，空段按上下键从该段边界起步

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

禁用整组退出 Tab 序；越界只做标注，08:00 原样留着不被改写

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

### 形态

variant 只改分段框的底色与描边用法，分段结构与键盘行为都不变

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

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，只看语气这一轴

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

不传 size 即默认档；行高、内边距与字号一起换档，标题也跟着变

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

值由宿主持有，按钮直接写值；框内自带清空钮，有值才显形，点完焦点回到第一段

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

值交给宿主持有，写回来的时间被吸附到清单里的一格，上下键与数字键因此都落在清单上

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

- 用户知道确切时间，打字比翻列表快。
- 需要 12 小时制并带上下午段位。

### 何时不用

- 需要从固定的整点或半点里挑：用[时间选择器](./time-picker)。
- 需要日期：用[日期输入](./date-field)。

### 特性

- `hourCycle` 切 12 / 24 小时制，12 小时制时自动多一个上下午段位。
- `granularity` 决定精确到分还是到秒。
- `min` / `max` 越界时只标注不改写。
- 框内自带清空钮（`clear-trigger`）：有值才显形，点完焦点回到第一段。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-time-field>` |
| Vue 组件 | `XhTimeFieldClearTrigger` `XhTimeFieldControl` `XhTimeFieldHiddenInput` `XhTimeFieldLabel` `XhTimeFieldRoot` `XhTimeFieldSegment` `XhTimeFieldSegmentGroup` |
| 组合式函数 | `useTimeField` |
| 状态机 | `timeFieldMachine` |
| 皮肤 | `@xihan-ui/styles/time-field.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="time-field"`：**`root`** · `label` · **`control`** · `segment-group` · **`segment`** · `clear-trigger` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 受控值，ISO 时间串。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string` |  |  |
| `min` | `string` |  | 下界（含）。只用来标注越界，不改写用户填进去的东西。 |
| `max` | `string` |  | 上界（含）。同上。 |
| `locale` | `string` |  | BCP 47 语言标记。决定上午/下午的文字，以及未显式给 hourCycle 时的小时制。 |
| `hourCycle` | `TimeHourCycle` |  | 小时制。不给则按 locale 推断，locale 也没有时用 24。 |
| `granularity` | `TimeGranularity` |  | 值精确到哪一段，默认 minute。 |
| `disabled` | `boolean` |  | 禁用：段整体退出 Tab 序列、键盘一概不响应，隐藏输入不参与提交。 |
| `readOnly` | `boolean` |  | 只读：仍可聚焦、可用左右键在段间走，但改不动值。 |
| `invalid` | `boolean` |  | 校验失败标注。 |
| `required` | `boolean` |  | 必填标注（落到每段的 aria-required 上）。 |
| `name` | `string` |  | 表单字段名；给了隐藏输入才带 name，值随表单一并提交。 |
| `placeholder` | `string` |  | 空段的占位字符（单字符），按段宽重复，默认 '-'。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定描边与底色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<TimeFieldTranslations>` |  | 段位读屏名的覆盖；不给就用内置英文语义名。 |
| `onValueChange` | `(details: TimeFieldValueChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TimeFieldValueChangeDetails` | 值变化；detail 为 `{ value: string }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTimeFieldRoot` | `default` | `TimeFieldRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.CLEAR` · `SEGMENT.STEP` · `SEGMENT.DIGIT` · `SEGMENT.CLEAR` · `SEGMENT.PERIOD` · `SEGMENT.FOCUS` · `SEGMENT.BLUR` · `FORM.RESET`

**判据**：`canEdit`

## connect API

`useTimeField` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` | ISO 时间串；任一必填段为空时是空串。 |
| `empty` | `boolean` | 值为空串（还没填全）。作者据此点亮提交按钮或显示提示。 |
| `outOfRange` | `boolean` | 已填全但落在 min/max 之外。只是标注，不改写值。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `canClear` | `boolean` | 有值且可编辑（既不 disabled 也不 readOnly）；清空按钮据此显隐。 |
| `hourCycle` | `TimeHourCycle` | 实际生效的小时制（prop 没给时由 locale 推出来的那个）。 |
| `granularity` | `TimeGranularity` |  |
| `segments` | `TimeSegmentType[]` | 此刻参与显示的段，文档序。未列入的段由 connect 打上 hidden 收起。 |
| `focusedSegment` | `TimeSegmentType \| null` | 焦点所在段；焦点在组外时为 null。 |
| `getSegmentText` | `(props: TimeFieldSegmentProps) => string` | 某一段该显示的文字（空段是占位串）。两个适配器都拿它填文本，保证同构。 |
| `setValue` | `(next: string) => void` |  |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getSegmentGroupProps` | `() => T['element']` | 段位与分隔符的外壳：占满盒里剩下的宽度，把清空钮顶到框内末端。 |
| `getSegmentProps` | `(props: TimeFieldSegmentProps) => T['element']` |  |
| `getClearTriggerProps` | `() => T['button']` | 清空按钮：有值才显形，不占 Tab 位，点完焦点回到第一段。 |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：一份 type=hidden 的原生输入，随表单提交 ISO 串。 |

## 键盘

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
| `a` / `p` | focus in 上下午段, 12 小时制, not disabled/readOnly | a 取上午、p 取下午（不区分大小写） |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

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

## 样式

默认皮肤 `@xihan-ui/styles/time-field.css` 按部件选择：`[data-scope="time-field"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

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
| `segment-group` | `data-disabled` | ''（条件成立时才出现） |
| `segment-group` | `data-invalid` | ''（条件成立时才出现） |
| `segment-group` | `data-readonly` | ''（条件成立时才出现） |
| `segment` | `data-disabled` | ''（条件成立时才出现） |
| `segment` | `data-focus` | ''（条件成立时才出现） |
| `segment` | `data-invalid` | ''（条件成立时才出现） |
| `segment` | `data-placeholder` | ''（条件成立时才出现） |
| `segment` | `data-readonly` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-time-field-action-bg` | `clear-trigger` | `background` | `default` | `transparent` | time-field 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-time-field-action-bg-active` | `clear-trigger` | `background` | `active` | `--xh-bg-subtle-active` | time-field 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-time-field-action-bg-hover` | `clear-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | time-field 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-time-field-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | time-field 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-time-field-action-fg-hover` | `clear-trigger` | `color` | `hover` | `--xh-fg-default` | time-field 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-time-field-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | time-field 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-time-field-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-control` | time-field 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-time-field-action-size` | `clear-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | time-field 的 clear-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-time-field-control-bg` | `control` | `background` | `default` | `--xh-_time-field-control-bg` | time-field 的 control 部件 background 覆盖槽。 |
| `--xh-time-field-control-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` | time-field 的 control 部件 background 覆盖槽。 |
| `--xh-time-field-control-bg-hover` | `control` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly` | `--xh-_time-field-control-bg-hover` | time-field 的 control 部件 background 覆盖槽。 |
| `--xh-time-field-control-bg-readonly` | `control` | `background` | `readonly` | `--xh-bg-subtle` | time-field 的 control 部件 background 覆盖槽。 |
| `--xh-time-field-control-border` | `control` | `border` | `default` | `--xh-_time-field-control-border` | time-field 的 control 部件 border 覆盖槽。 |
| `--xh-time-field-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])` | `--xh-_tone` | time-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-time-field-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid])` | `--xh-_time-field-control-border-hover` | time-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-time-field-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` | time-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-time-field-control-fg` | `control` | `color` | `default` | `--xh-fg-default` | time-field 的 control 部件 color 覆盖槽。 |
| `--xh-time-field-control-gap` | `control` | `gap` | `default` | `--xh-_time-field-gap` | time-field 的 control 部件 gap 覆盖槽。 |
| `--xh-time-field-control-h` | `control` | `block-size` | `default` | `--xh-_time-field-control-h` | time-field 的 control 部件 block-size 覆盖槽。 |
| `--xh-time-field-control-min-w` | `control`<br>`root` | `min-inline-size` | `default` | `--xh-control-min-w` | time-field 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-time-field-control-px` | `control` | `padding-inline` | `default` | `--xh-_time-field-control-px` | time-field 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-time-field-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | time-field 的 control 部件 border-radius 覆盖槽。 |
| `--xh-time-field-control-shadow` | `control` | `box-shadow` | `default` | `--xh-_time-field-control-shadow` | time-field 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-time-field-font-size` | `control` | `font-size` | `default` | `--xh-_time-field-font-size` | time-field 的 control 部件 font-size 覆盖槽。 |
| `--xh-time-field-gap` | `root` | `gap` | `default` | `--xh-space-1` | time-field 的 root 部件 gap 覆盖槽。 |
| `--xh-time-field-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | time-field 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-time-field-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | time-field 的 label 部件 color 覆盖槽。 |
| `--xh-time-field-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | time-field 的 label 部件 color 覆盖槽。 |
| `--xh-time-field-label-font-size` | `label` | `font-size` | `default` | `--xh-_time-field-label-font-size` | time-field 的 label 部件 font-size 覆盖槽。 |
| `--xh-time-field-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | time-field 的 label 部件 font-weight 覆盖槽。 |
| `--xh-time-field-placeholder-fg` | `segment` | `color` | `placeholder` | `--xh-fg-subtle` | time-field 的 segment 部件 color 覆盖槽。 |
| `--xh-time-field-segment-bg-focus` | `segment` | `background` | `disabled`<br>`focus`<br>`focus-visible`<br>`not([data-disabled])` | `--xh-_time-field-segment-bg` | time-field 的 segment 部件 background 覆盖槽。 |
| `--xh-time-field-segment-bg-hover` | `segment` | `background` | `disabled`<br>`focus`<br>`hover`<br>`not([data-focus], [data-disabled])` | `--xh-bg-subtle-hover` | time-field 的 segment 部件 background 覆盖槽。 |
| `--xh-time-field-segment-fg-focus` | `segment` | `color` | `disabled`<br>`focus`<br>`focus-visible`<br>`not([data-disabled])`<br>`placeholder` | `--xh-_time-field-segment-fg` | time-field 的 segment 部件 color 覆盖槽。 |
| `--xh-time-field-segment-px` | `segment` | `padding-inline` | `default` | `--xh-space-1` | time-field 的 segment 部件 padding-inline 覆盖槽。 |
| `--xh-time-field-segment-py` | `segment` | `padding-block` | `default` | `--xh-space-0` | time-field 的 segment 部件 padding-block 覆盖槽。 |
| `--xh-time-field-segment-radius` | `segment` | `border-radius` | `default` | `--xh-shape-inset` | time-field 的 segment 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `border-color` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[表单字段](./field)；与[日期输入](./date-field)并排组成日期时间。

## 最佳实践

- 明确时区归属：组件处理的是墙上时间，时区换算是宿主的事。
- 12 小时制下上下午段位不能省，否则用户输入的时间有二义。

## 反模式

- 用文本输入收时间再解析。
