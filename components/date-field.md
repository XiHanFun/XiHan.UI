来源：https://ui.docs.xihanfun.com/components/date-field

# DateField `日期输入`

分段的日期输入框：年、月、日各占一段，方向键加减，不弹日历。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/date-field" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/date-field.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/date-field" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/date-field" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/date-field.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

三段各是一个可加减的数，整组只占一个 Tab 位，三段填齐才第一次报出值

```vue
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldHiddenInput,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string | null>(null);
</script>

<template>
  <XhDateFieldRoot v-model:value="value" locale="zh-CN" name="due">
    <XhDateFieldLabel>截止日期</XhDateFieldLabel>
    <XhDateFieldControl>
      <XhDateFieldSegmentGroup>
        <!-- 段只声明下标，是年是月由 locale 算出；中间的「年 / 月 / 日」是普通节点 -->
        <XhDateFieldSegment :index="0" />
        <span>年</span>
        <XhDateFieldSegment :index="1" />
        <span>月</span>
        <XhDateFieldSegment :index="2" />
        <span>日</span>
      </XhDateFieldSegmentGroup>
    </XhDateFieldControl>
    <!-- 表单出口：值是 ISO 串，没填齐时它就是空的 -->
    <XhDateFieldHiddenInput />
  </XhDateFieldRoot>

  <span style="font-size: 13px">当前值：{{ value ?? "（未填齐）" }}</span>
</template>
```

```html
<div style="display: grid; gap: 8px; justify-items: start">
  <xh-date-field id="date-field-basic" locale="zh-CN" name="due">
    <div data-xh-part="root">
      <label data-xh-part="label">截止日期</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <!-- 段只声明下标，是年是月由 locale 算出；中间的「年 / 月 / 日」是普通节点 -->
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
      <!-- 表单出口：值是 ISO 串，没填齐时它就是空的 -->
      <input data-xh-part="hidden-input" />
    </div>
  </xh-date-field>

  <span style="font-size: 13px">当前值：<span id="date-field-basic-readout">（未填齐）</span></span>
</div>

<script type="module">
  // 值变化回显在下面那行文字里
  const field = document.getElementById("date-field-basic");
  const readout = document.getElementById("date-field-basic-readout");
  field.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value ?? "（未填齐）";
  });
</script>
```

## 示例

### 段序随 locale

同一份标记，locale 换成 en-US 后段序自动排成月日年

```vue
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const zh = ref<string | null>("2026-07-28");
const us = ref<string | null>("2026-07-28");
</script>

<template>
  <div style="display: grid; gap: 16px">
    <XhDateFieldRoot v-model:value="zh" locale="zh-CN">
      <XhDateFieldLabel>zh-CN</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>年</span>
          <XhDateFieldSegment :index="1" />
          <span>月</span>
          <XhDateFieldSegment :index="2" />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>

    <XhDateFieldRoot v-model:value="us" locale="en-US">
      <XhDateFieldLabel>en-US</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>/</span>
          <XhDateFieldSegment :index="1" />
          <span>/</span>
          <XhDateFieldSegment :index="2" />
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>

    <p style="margin: 0; font-size: 13px">
      两份值都是 ISO 串：{{ zh ?? "（空）" }} · {{ us ?? "（空）" }}
    </p>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px">
  <xh-date-field id="date-field-locale-zh" locale="zh-CN" default-value="2026-07-28">
    <div data-xh-part="root">
      <label data-xh-part="label">zh-CN</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field id="date-field-locale-us" locale="en-US" default-value="2026-07-28">
    <div data-xh-part="root">
      <label data-xh-part="label">en-US</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>/</span>
          <span data-xh-part="segment" index="1"></span>
          <span>/</span>
          <span data-xh-part="segment" index="2"></span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <p style="margin: 0; font-size: 13px">
    两份值都是 ISO 串：<span id="date-field-locale-zh-readout">2026-07-28</span> ·
    <span id="date-field-locale-us-readout">2026-07-28</span>
  </p>
</div>

<script type="module">
  // 两份各自回显自己的值
  for (const id of ["date-field-locale-zh", "date-field-locale-us"]) {
    const readout = document.getElementById(`${id}-readout`);
    document.getElementById(id).addEventListener("value-change", (event) => {
      readout.textContent = event.detail.value ?? "（空）";
    });
  }
</script>
```

### 可填区间

min / max 收窄各段的加减范围，越界的初值只做标注、不被改写

```vue
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 16px">
    <XhDateFieldRoot
      default-value="2026-07-28"
      locale="zh-CN"
      min="2020-01-01"
      max="2030-12-31"
    >
      <XhDateFieldLabel>在区间内（2020 – 2030）</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>年</span>
          <XhDateFieldSegment :index="1" />
          <span>月</span>
          <XhDateFieldSegment :index="2" />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>

    <!-- 初值早于 min：root 挂上 data-out-of-range，值本身原样留着 -->
    <XhDateFieldRoot default-value="2019-05-01" locale="zh-CN" min="2020-01-01">
      <XhDateFieldLabel>越界（min 2020-01-01）</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>年</span>
          <XhDateFieldSegment :index="1" />
          <span>月</span>
          <XhDateFieldSegment :index="2" />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px">
  <xh-date-field default-value="2026-07-28" locale="zh-CN" min="2020-01-01" max="2030-12-31">
    <div data-xh-part="root">
      <label data-xh-part="label">在区间内（2020 – 2030）</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <!-- 初值早于 min：root 挂上 data-out-of-range，值本身原样留着 -->
  <xh-date-field default-value="2019-05-01" locale="zh-CN" min="2020-01-01">
    <div data-xh-part="root">
      <label data-xh-part="label">越界（min 2020-01-01）</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>
</div>
```

### 禁用与非法

禁用整组退出 Tab 序、隐藏输入不再提交；invalid 只改观感与 aria，不动值

```vue
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 16px">
    <XhDateFieldRoot default-value="2026-07-28" locale="zh-CN" disabled>
      <XhDateFieldLabel>禁用</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>年</span>
          <XhDateFieldSegment :index="1" />
          <span>月</span>
          <XhDateFieldSegment :index="2" />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>

    <XhDateFieldRoot default-value="2026-07-28" locale="zh-CN" read-only>
      <XhDateFieldLabel>只读</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>年</span>
          <XhDateFieldSegment :index="1" />
          <span>月</span>
          <XhDateFieldSegment :index="2" />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>

    <XhDateFieldRoot default-value="2026-07-28" locale="zh-CN" invalid>
      <XhDateFieldLabel>invalid</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>年</span>
          <XhDateFieldSegment :index="1" />
          <span>月</span>
          <XhDateFieldSegment :index="2" />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px">
  <xh-date-field default-value="2026-07-28" locale="zh-CN" disabled>
    <div data-xh-part="root">
      <label data-xh-part="label">禁用</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field default-value="2026-07-28" locale="zh-CN" read-only>
    <div data-xh-part="root">
      <label data-xh-part="label">只读</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field default-value="2026-07-28" locale="zh-CN" invalid>
    <div data-xh-part="root">
      <label data-xh-part="label">invalid</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>
</div>
```

### 形态

variant 只改分段框的底色与描边用法，分段结构与键盘行为都不变

```vue
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
</script>

<template>
  <div style="display: grid; gap: 16px; justify-items: start">
    <XhDateFieldRoot
      v-for="v in variants"
      :key="v"
      :variant="v"
      default-value="2026-07-28"
      locale="zh-CN"
    >
      <XhDateFieldLabel>{{ v }}</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>年</span>
          <XhDateFieldSegment :index="1" />
          <span>月</span>
          <XhDateFieldSegment :index="2" />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px; justify-items: start">
  <xh-date-field variant="outline" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">outline</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field variant="subtle" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">subtle</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field variant="ghost" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">ghost</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>
</div>
```

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，只看语气这一轴

```vue
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhDateFieldRoot
      v-for="t in tones"
      :key="t"
      variant="subtle"
      :tone="t"
      default-value="2026-07-28"
      locale="zh-CN"
    >
      <XhDateFieldLabel>{{ t }}</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>年</span>
          <XhDateFieldSegment :index="1" />
          <span>月</span>
          <XhDateFieldSegment :index="2" />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-date-field variant="subtle" tone="brand" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">brand</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field variant="subtle" tone="neutral" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">neutral</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field variant="subtle" tone="success" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">success</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field variant="subtle" tone="warning" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">warning</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field variant="subtle" tone="danger" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">danger</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field variant="subtle" tone="info" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">info</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>
</div>
```

### 尺寸

不传 size 即默认档；行高、内边距与字号一起换档，标题也跟着变

```vue
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";

const sizes = [
  { size: "sm", label: "sm" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "lg" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px">
    <XhDateFieldRoot
      v-for="s in sizes"
      :key="s.label"
      :size="s.size"
      default-value="2026-07-28"
      locale="zh-CN"
    >
      <XhDateFieldLabel>{{ s.label }}</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>年</span>
          <XhDateFieldSegment :index="1" />
          <span>月</span>
          <XhDateFieldSegment :index="2" />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px">
  <xh-date-field size="sm" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">sm</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">默认</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <xh-date-field size="lg" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">lg</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>
</div>
```

### 精确到分

granularity=minute 在年月日后面接出时、分两段，值随之带上 T 与时间位

```vue
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string | null>("2026-07-28T13:45");
</script>

<template>
  <XhDateFieldRoot v-model:value="value" locale="zh-CN" granularity="minute">
    <XhDateFieldLabel>发布时间</XhDateFieldLabel>
    <XhDateFieldControl>
      <XhDateFieldSegmentGroup>
        <!-- 段序仍由 locale 排：前三段是年月日，时分按精度追加在后面 -->
        <XhDateFieldSegment :index="0" />
        <span>年</span>
        <XhDateFieldSegment :index="1" />
        <span>月</span>
        <XhDateFieldSegment :index="2" />
        <span>日</span>
        <span>&nbsp;</span>
        <XhDateFieldSegment :index="3" />
        <span>:</span>
        <XhDateFieldSegment :index="4" />
      </XhDateFieldSegmentGroup>
    </XhDateFieldControl>
  </XhDateFieldRoot>

  <span style="font-size: 13px">当前值：{{ value ?? "（未填齐）" }}</span>
</template>
```

```html
<div style="display: grid; gap: 8px; justify-items: start">
  <xh-date-field
    id="date-field-datetime"
    locale="zh-CN"
    granularity="minute"
    default-value="2026-07-28T13:45"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">发布时间</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <!-- 段序仍由 locale 排：前三段是年月日，时分按精度追加在后面 -->
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
          <span>&nbsp;</span>
          <span data-xh-part="segment" index="3"></span>
          <span>:</span>
          <span data-xh-part="segment" index="4"></span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <span style="font-size: 13px">当前值：<span id="date-field-datetime-readout">2026-07-28T13:45</span></span>
</div>

<script type="module">
  // 值变化回显在下面那行文字里
  const field = document.getElementById("date-field-datetime");
  const readout = document.getElementById("date-field-datetime-readout");
  field.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value ?? "（未填齐）";
  });
</script>
```

### 外部写值与清空

值由宿主持有，按钮直接写值；清空交给组件自带的清空钮，有值才出现；填齐与越界两个判据由组件给出

```vue
<script setup lang="ts">
import {
  XhButton,
  XhDateFieldClearTrigger,
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string | null>(null);

// 相对今天偏移若干天的 ISO 串
function shift(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

const today = shift(0);
const nextWeek = shift(7);
</script>

<template>
  <XhDateFieldRoot
    v-slot="{ complete, outOfRange, setValue }"
    v-model:value="value"
    :min="today"
    locale="zh-CN"
  >
    <XhDateFieldLabel>取件日期</XhDateFieldLabel>
    <XhDateFieldControl>
      <XhDateFieldSegmentGroup>
        <XhDateFieldSegment :index="0" />
        <span>年</span>
        <XhDateFieldSegment :index="1" />
        <span>月</span>
        <XhDateFieldSegment :index="2" />
        <span>日</span>
      </XhDateFieldSegmentGroup>
      <!-- 一段都没填时清空钮收起；填了任意一段就出现 -->
      <XhDateFieldClearTrigger />
    </XhDateFieldControl>

    <div style="display: flex; gap: 8px">
      <XhButton size="sm" variant="outline" @click="setValue(today)">今天</XhButton>
      <XhButton size="sm" variant="outline" @click="setValue(nextWeek)">
        七天后
      </XhButton>
    </div>

    <span style="font-size: 13px">
      {{ complete ? (outOfRange ? "早于今天，收不了件" : "可取件") : "未填齐" }}
    </span>
  </XhDateFieldRoot>
</template>
```

```html
<xh-date-field id="date-field-actions" value="" locale="zh-CN">
  <div data-xh-part="root">
    <label data-xh-part="label">取件日期</label>
    <div data-xh-part="control">
      <div data-xh-part="segment-group">
        <span data-xh-part="segment" index="0"></span>
        <span>年</span>
        <span data-xh-part="segment" index="1"></span>
        <span>月</span>
        <span data-xh-part="segment" index="2"></span>
        <span>日</span>
      </div>
      <!-- 一段都没填时清空钮收起；填了任意一段就出现 -->
      <button data-xh-part="clear-trigger"></button>
    </div>

    <div style="display: flex; gap: 8px">
      <xh-button id="date-field-actions-today" size="sm" variant="outline">
        <button data-xh-part="root">今天</button>
      </xh-button>
      <xh-button id="date-field-actions-next-week" size="sm" variant="outline">
        <button data-xh-part="root">七天后</button>
      </xh-button>
    </div>

    <span id="date-field-actions-status" style="font-size: 13px">未填齐</span>
  </div>
</xh-date-field>

<script type="module">
  const field = document.getElementById("date-field-actions");
  const root = field.querySelector('[data-xh-part="root"]');
  const status = document.getElementById("date-field-actions-status");

  // 相对今天偏移若干天的 ISO 串
  function shift(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  }

  const today = shift(0);
  const nextWeek = shift(7);
  field.min = today;

  // 填齐与越界两个判据落在根节点上，等这一轮更新写完再读
  async function sync() {
    await field.updateComplete;
    status.textContent = root.hasAttribute("data-complete")
      ? root.hasAttribute("data-out-of-range")
        ? "早于今天，收不了件"
        : "可取件"
      : "未填齐";
  }

  function write(next) {
    field.value = next;
    void sync();
  }

  field.addEventListener("value-change", (event) => write(event.detail.value ?? ""));
  document.getElementById("date-field-actions-today").addEventListener("click", () => write(today));
  document
    .getElementById("date-field-actions-next-week")
    .addEventListener("click", () => write(nextWeek));
  void sync();
</script>
```

### 值变化事件

value-change 每次带上整份 ISO 串，段位被清掉时它是 null

```vue
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const log = ref<string[]>([]);

// 只留最近三条，新的排在前面
function onValueChange(details: { value: string | null }) {
  log.value = [details.value ?? "null", ...log.value].slice(0, 3);
}
</script>

<template>
  <XhDateFieldRoot
    default-value="2026-07-28"
    locale="zh-CN"
    @value-change="onValueChange"
  >
    <XhDateFieldLabel>改一改再看下面</XhDateFieldLabel>
    <XhDateFieldControl>
      <XhDateFieldSegmentGroup>
        <XhDateFieldSegment :index="0" />
        <span>年</span>
        <XhDateFieldSegment :index="1" />
        <span>月</span>
        <XhDateFieldSegment :index="2" />
        <span>日</span>
      </XhDateFieldSegmentGroup>
    </XhDateFieldControl>
  </XhDateFieldRoot>

  <span style="font-size: 13px">
    最近变化：{{ log.length ? log.join(" ← ") : "（还没动过）" }}
  </span>
</template>
```

```html
<div style="display: grid; gap: 8px; justify-items: start">
  <xh-date-field id="date-field-events" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">改一改再看下面</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <span style="font-size: 13px">
    最近变化：<span id="date-field-events-log">（还没动过）</span>
  </span>
</div>

<script type="module">
  // 只留最近三条，新的排在前面
  const field = document.getElementById("date-field-events");
  const output = document.getElementById("date-field-events-log");
  let log = [];

  field.addEventListener("value-change", (event) => {
    log = [event.detail.value ?? "null", ...log].slice(0, 3);
    output.textContent = log.join(" ← ");
  });
</script>
```

### 段位自定义文本

段位插槽给出这一段的类型、取值与焦点状态，离焦后年份只留两位、月份换成中文名

```vue
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string | null>("2026-07-28");

const MONTH_NAMES = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
];

// 插槽交出来的这一段
interface Segment {
  type: string;
  value: number | null;
  text: string;
  empty: boolean;
  focused: boolean;
}

// 空段与正在编辑的段照原样显示，其余按自己的写法渲染
function display(segment: Segment) {
  if (segment.empty || segment.focused)
    return segment.text;
  if (segment.type === "year")
    return segment.text.slice(-2);
  if (segment.type === "month")
    return MONTH_NAMES[(segment.value ?? 1) - 1];
  return segment.text;
}
</script>

<template>
  <XhDateFieldRoot v-model:value="value" locale="zh-CN">
    <XhDateFieldLabel>发布日期</XhDateFieldLabel>
    <XhDateFieldControl>
      <XhDateFieldSegmentGroup>
        <XhDateFieldSegment v-slot="{ segment }" :index="0">
          {{ display(segment) }}
        </XhDateFieldSegment>
        <span>年</span>
        <XhDateFieldSegment v-slot="{ segment }" :index="1">
          {{ display(segment) }}
        </XhDateFieldSegment>
        <XhDateFieldSegment v-slot="{ segment }" :index="2">
          {{ display(segment) }}
        </XhDateFieldSegment>
        <span>日</span>
      </XhDateFieldSegmentGroup>
    </XhDateFieldControl>
  </XhDateFieldRoot>

  <span style="font-size: 13px">值仍是 ISO 串：{{ value ?? "（未填齐）" }}</span>
</template>
```

```html
<div style="display: grid; gap: 8px; justify-items: start">
  <xh-date-field id="date-field-segment-format" default-value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">发布日期</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
    </div>
  </xh-date-field>

  <span style="font-size: 13px">
    值仍是 ISO 串：<span id="date-field-segment-format-value">2026-07-28</span>
  </span>
</div>

<script type="module">
  const field = document.getElementById("date-field-segment-format");
  const group = field.querySelector('[data-xh-part="segment-group"]');
  const readout = document.getElementById("date-field-segment-format-value");
  const segments = [...group.querySelectorAll('[data-xh-part="segment"]')];

  const MONTH_NAMES = [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ];

  // 这一段的类型、取值与焦点状态，组件都写在段位节点自己身上
  function display(segment) {
    const type = segment.getAttribute("data-segment");
    // 标准写法恒留在 aria-valuetext 上：改写的只是看得见的那份
    const text = segment.getAttribute("aria-valuetext") ?? "";
    const empty = segment.hasAttribute("data-placeholder");
    const focused = segment.hasAttribute("data-focus");
    if (empty || focused) return text;
    if (type === "year") return text.slice(-2);
    if (type === "month") return MONTH_NAMES[Number(segment.getAttribute("aria-valuenow") ?? 1) - 1];
    return text;
  }

  // 元素每次接线都会把段位文字写回标准写法，这里在它写完之后照自己的写法改一遍
  function paint() {
    for (const segment of segments) {
      const text = display(segment);
      if (segment.textContent !== text) segment.textContent = text;
    }
  }

  new MutationObserver(paint).observe(group, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["aria-valuetext", "aria-valuenow", "data-focus", "data-placeholder"],
  });

  field.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value ?? "（未填齐）";
  });
  paint();
</script>
```

### 对外值换个写法

组件读写的恒是 ISO 串，宿主在读写两头各转一次换成自己的格式，表单也提交这一份

```vue
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

// 宿主与后端约定的写法
const stored = ref("2026/07/28");

// 读时换成 ISO 交给组件，写回时换回宿主的写法
const iso = computed<string | null>({
  get: () => (stored.value ? stored.value.split("/").join("-") : null),
  set: (next) => {
    stored.value = next ? next.split("-").join("/") : "";
  },
});
</script>

<template>
  <XhDateFieldRoot v-model:value="iso" locale="zh-CN">
    <XhDateFieldLabel>结算日期</XhDateFieldLabel>
    <XhDateFieldControl>
      <XhDateFieldSegmentGroup>
        <XhDateFieldSegment :index="0" />
        <span>年</span>
        <XhDateFieldSegment :index="1" />
        <span>月</span>
        <XhDateFieldSegment :index="2" />
        <span>日</span>
      </XhDateFieldSegmentGroup>
    </XhDateFieldControl>
    <!-- 不用内建的隐藏输入，自己写一份提交宿主格式 -->
    <input type="hidden" name="settle" :value="stored">
  </XhDateFieldRoot>

  <span style="font-size: 13px">
    随表单提交的是：{{ stored || "（未填齐）" }} · 组件里的值是：{{ iso ?? "null" }}
  </span>
</template>
```

```html
<div style="display: grid; gap: 8px; justify-items: start">
  <xh-date-field id="date-field-value-format" value="2026-07-28" locale="zh-CN">
    <div data-xh-part="root">
      <label data-xh-part="label">结算日期</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" index="0"></span>
          <span>年</span>
          <span data-xh-part="segment" index="1"></span>
          <span>月</span>
          <span data-xh-part="segment" index="2"></span>
          <span>日</span>
        </div>
      </div>
      <!-- 不用内建的隐藏输入，自己写一份提交宿主格式 -->
      <input type="hidden" name="settle" value="2026/07/28" />
    </div>
  </xh-date-field>

  <span style="font-size: 13px">
    随表单提交的是：<span id="date-field-value-format-stored">2026/07/28</span> ·
    组件里的值是：<span id="date-field-value-format-iso">2026-07-28</span>
  </span>
</div>

<script type="module">
  const field = document.getElementById("date-field-value-format");
  const hidden = field.querySelector('input[name="settle"]');
  const storedOut = document.getElementById("date-field-value-format-stored");
  const isoOut = document.getElementById("date-field-value-format-iso");

  // 组件报上来的是 ISO 串，写回组件时照收，交给表单前换成宿主的写法
  function apply(iso) {
    const stored = iso ? iso.split("-").join("/") : "";
    field.value = iso ?? "";
    hidden.value = stored;
    storedOut.textContent = stored || "（未填齐）";
    isoOut.textContent = iso ?? "null";
  }

  field.addEventListener("value-change", (event) => apply(event.detail.value));
</script>
```

### 段位可拼装

segments 决定这份控件由哪几块组成；段位可按段名认领，不必数下标

```vue
<script setup lang="ts">
import type { DateSegmentSet } from "@xihan-ui/headless";
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 值的形态不变，仍是 ISO 日期串：季度取那一季的头一个月、周取那一周的周首日
const quarter = ref<string | null>("2026-04-01");
const week = ref<string | null>("2026-08-10");
const at = ref<string | null>("2026-08-17T09");

const QUARTER: DateSegmentSet = ["year", "quarter"];
const WEEK: DateSegmentSet = ["year", "week"];
const AT: DateSegmentSet = ["year", "month", "day", "hour", "dayPeriod"];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <XhDateFieldRoot v-model:value="quarter" :segments="QUARTER" locale="zh-CN">
      <XhDateFieldLabel>结算季度</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <!-- 按段名认领：写死这一格就是年、那一格就是季度，不必数下标 -->
          <XhDateFieldSegment segment="year" />
          <span>-</span>
          <XhDateFieldSegment segment="quarter" />
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>
    <span style="font-size: 13px">{{ quarter ?? "（未填齐）" }}</span>

    <XhDateFieldRoot v-model:value="week" :segments="WEEK" locale="zh-CN">
      <XhDateFieldLabel>排期周</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment segment="year" />
          <span>-</span>
          <XhDateFieldSegment segment="week" />
        </XhDateFieldSegmentGroup>
        <!-- 「周」与「年 / 月 / 日」一样是普通节点，段位自己只出数字 -->
        <span>周</span>
      </XhDateFieldControl>
    </XhDateFieldRoot>
    <span style="font-size: 13px">{{ week ?? "（未填齐）" }}（那一周的周首日）</span>

    <XhDateFieldRoot v-model:value="at" :segments="AT" locale="zh-CN">
      <XhDateFieldLabel>开始时间</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment segment="year" />
          <span>-</span>
          <XhDateFieldSegment segment="month" />
          <span>-</span>
          <XhDateFieldSegment segment="day" />
          <span>&nbsp;</span>
          <!-- 段集里带上下午时，小时段收的是 12 时制的那个数；a / p 键直接指定 -->
          <XhDateFieldSegment segment="hour" />
          <span>&nbsp;</span>
          <XhDateFieldSegment segment="dayPeriod" />
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>
    <span style="font-size: 13px">{{ at ?? "（未填齐）" }}</span>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 16px">
  <!-- 值的形态不变，仍是 ISO 日期串：季度取那一季的头一个月 -->
  <xh-date-field
    id="date-field-segments-quarter"
    segments="year,quarter"
    locale="zh-CN"
    default-value="2026-04-01"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">结算季度</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <!-- 按段名认领：写死这一格就是年、那一格就是季度，不必数下标 -->
          <span data-xh-part="segment" segment="year"></span>
          <span>-</span>
          <span data-xh-part="segment" segment="quarter"></span>
        </div>
      </div>
    </div>
  </xh-date-field>
  <span style="font-size: 13px" id="date-field-segments-quarter-readout">2026-04-01</span>

  <xh-date-field
    id="date-field-segments-week"
    segments="year,week"
    locale="zh-CN"
    default-value="2026-08-10"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">排期周</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="year"></span>
          <span>-</span>
          <span data-xh-part="segment" segment="week"></span>
        </div>
        <!-- 「周」与「年 / 月 / 日」一样是普通节点，段位自己只出数字 -->
        <span>周</span>
      </div>
    </div>
  </xh-date-field>
  <span style="font-size: 13px">
    <span id="date-field-segments-week-readout">2026-08-10</span>（那一周的周首日）
  </span>

  <xh-date-field
    id="date-field-segments-at"
    segments="year,month,day,hour,dayPeriod"
    locale="zh-CN"
    default-value="2026-08-17T09"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">开始时间</label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment" segment="year"></span>
          <span>-</span>
          <span data-xh-part="segment" segment="month"></span>
          <span>-</span>
          <span data-xh-part="segment" segment="day"></span>
          <span>&nbsp;</span>
          <!-- 段集里带上下午时，小时段收的是 12 时制的那个数；a / p 键直接指定 -->
          <span data-xh-part="segment" segment="hour"></span>
          <span>&nbsp;</span>
          <span data-xh-part="segment" segment="dayPeriod"></span>
        </div>
      </div>
    </div>
  </xh-date-field>
  <span style="font-size: 13px" id="date-field-segments-at-readout">2026-08-17T09</span>
</div>

<script type="module">
  // 三份各自回显自己的值
  for (const id of [
    "date-field-segments-quarter",
    "date-field-segments-week",
    "date-field-segments-at",
  ]) {
    const readout = document.getElementById(`${id}-readout`);
    document.getElementById(id).addEventListener("value-change", (event) => {
      readout.textContent = event.detail.value ?? "（未填齐）";
    });
  }
</script>
```

## 设计指引

### 何时使用

- 用户已经知道确切日期（生日、证件有效期），打字比翻日历快。
- 需要键盘全程可用。

### 何时不用

- 用户需要看着日历挑（选会议时间、看星期几）：用[日期选择器](./date-picker)。
- 只要时间不要日期：用[时间输入](./time-field)。

### 特性

- 段序随 `locale` 变，不是写死的年月日。不给 `locale` 就跟宿主浏览器语言，读不到才落 `en-US`（月日年）。
- `min` / `max` 收窄各段的加减范围；越界的初值只做标注、不被改写。
- `granularity` 决定精确到日还是到分。
- 段位文本、对外值的写法与段位的拼装都可以换。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-date-field>` |
| Vue 组件 | `XhDateFieldClearTrigger` `XhDateFieldControl` `XhDateFieldHiddenInput` `XhDateFieldLabel` `XhDateFieldRoot` `XhDateFieldSegment` `XhDateFieldSegmentGroup` |
| 组合式函数 | `useDateField` |
| 状态机 | `dateFieldMachine` |
| 皮肤 | `@xihan-ui/styles/date-field.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="date-field"`：**`root`** · `label` · **`control`** · `segment-group` · **`segment`** · `clear-trigger` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| null` |  | 受控值，ISO 串（'2026-07-28' / '2026-07-28T13:45'）；null 表示空。给定即受控。 |
| `defaultValue` | `string \| null` |  | 非受控初值，同样是 ISO 串。 |
| `min` | `string` |  | 下界，ISO 串。参与各段区间的收窄，并决定 outOfRange。 |
| `max` | `string` |  | 上界，ISO 串。 |
| `locale` | `string` |  | BCP 47 语言标记，决定年月日三段的先后。不给按宿主语言，宿主也没有时按 en-US（月日年）排。 |
| `timeZone` | `string` |  | IANA 时区名，只用来取「今天」：空段上按上下键时从今天的对应位起步。 |
| `granularity` | `DateGranularity` |  | 精度，默认 day（只有年月日三段）。给了 segments 时它不再作数。 |
| `segments` | `DateSegmentSet` |  | 段集：这份控件由哪几块组成，给了就以它为准，granularity 让路。写 `['year', 'quarter']` 得到「2026 Q2」、`['year', 'week']` 得到「2026 33」。归一后为空（如 `[]`）视同没给。 值仍是 ISO 日期（时间）串，故段集里必须有 year，否则段位编辑得动但拼不出值。 |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `required` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；给了隐藏输入才带 name，ISO 串随表单一并提交。 |
| `placeholder` | `{ readonly [K in DateSegmentType]?: string }` |  | 各段未填时显示的占位串，逐段覆盖内置默认（yyyy / mm / dd / hh / mm / ss）。 |
| `translations` | `DateFieldTranslations` |  | 各段的读屏名字，逐段覆盖内置默认。段是 spinbutton，没有名字读屏只念得出一串数字。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定描边与底色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: DateFieldValueChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `DateFieldValueChangeDetails` | 值变化；detail 为 `{ value: string \| null }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDateFieldRoot` | `default` | `DateFieldRootSlotProps` |  |
| `XhDateFieldSegment` | `default` | `DateFieldSegmentSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.CLEAR` · `SEGMENT.STEP` · `SEGMENT.TYPE` · `SEGMENT.CLEAR` · `SEGMENT.PERIOD` · `SEGMENT.FOCUS` · `SEGMENT.BLUR` · `FORM.RESET`

**判据**：`canEdit`

## connect API

`useDateField` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | ISO 串；段位没填齐时是 null。 |
| `valueAsDate` | `Date \| null` | 同一个值的原生 Date；空值或算不出来时为 null。按 timeZone 换算。 |
| `segments` | `DateFieldSegmentState[]` | 逐段投影，文档序即此刻的段序（给了 segments 就是它归一后的顺序，否则由 locale 排）。 |
| `complete` | `boolean` | 段位填齐了（value 非 null）。 |
| `empty` | `boolean` | 一段都没填。 |
| `outOfRange` | `boolean` | 填齐了但落在 min/max 之外。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `focusedSegment` | `DateSegmentType \| null` | 焦点落在哪一段；焦点在组外时为 null。 |
| `locale` | `string` |  |
| `granularity` | `DateGranularity` |  |
| `setValue` | `(next: string \| null) => void` | 直接写整份值；传 null 等于清空。 |
| `clear` | `() => void` | 清空全部段位；disabled / readOnly 下不动。 |
| `canClear` | `boolean` | 清空钮此刻是否可用：有段填了值、且可编辑。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` | 标题不是原生 label（段位是 div，不可被 label 标注），点它由连接层代为把焦点送进首段。 |
| `getControlProps` | `() => T['element']` | role=group 的分段容器。 |
| `getSegmentGroupProps` | `() => T['element']` | 段位与分隔符的外壳：占满盒里剩下的宽度，把清空钮顶到框内末端。 |
| `segmentOf` | `(props: DateFieldSegmentProps) => DateFieldSegmentState \| undefined` | 作者的那一句声明落在哪一段上；段集里没有这一块（或下标越界）时缺席。文字由适配器照它渲染。 |
| `getSegmentProps` | `(props: DateFieldSegmentProps) => T['element']` |  |
| `getClearTriggerProps` | `() => T['button']` | 清空钮：不占 Tab 位，没值或不可编辑时收起；点完焦点回到首段。 |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：一份 type=hidden 的原生输入，值是 ISO 串。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowUp` | focus in a segment, not disabled/readOnly | 本段加一，到区间上界回绕到下界；空段则落到今天的对应位 |
| `ArrowDown` | focus in a segment, not disabled/readOnly | 本段减一，到区间下界回绕到上界；空段则落到今天的对应位 |
| `ArrowRight` | focus in a segment, not disabled | 焦点移到下一段（跳过收起的段）；已在末段则不动，不回绕 |
| `ArrowLeft` | focus in a segment, not disabled | 焦点移到上一段；已在首段则不动，不回绕 |
| `Home` | focus in a segment, not disabled | 焦点移到首段 |
| `End` | focus in a segment, not disabled | 焦点移到末段 |
| `Backspace` | focus in a segment, not disabled/readOnly | 清掉本段，焦点不动；整份值随之变成 null |
| `0` / `1` / `2` / `3` / `4` / `5` / `6` / `7` / `8` / `9` | focus in a segment, not disabled/readOnly | 往本段补一位数字；补满（再补一位必溢出或位数用尽）即自动跳下一段。上下午段没有数字位，不收数字 |
| `a` / `p` | focus in 上下午段, not disabled/readOnly | 直接指定上午 / 下午；上下键在两者之间翻面 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `control` | `aria-disabled` | 'true' \| 'false' |
| `control` | `aria-labelledby` | `label` 部件的 id |
| `control` | `role` | 'group' |
| `segment` | `aria-disabled` | undefined \| 'true' \| 'false' |
| `segment` | `aria-invalid` | undefined \| 'true' \| 'false' |
| `segment` | `aria-label` | item?.label |
| `segment` | `aria-readonly` | undefined \| 'true' \| 'false' |
| `segment` | `aria-required` | undefined \| 'true' \| 'false' |
| `segment` | `aria-valuemax` | undefined \| String(item.max) |
| `segment` | `aria-valuemin` | undefined \| String(item.min) |
| `segment` | `aria-valuenow` | undefined \| String(item.value) |
| `segment` | `aria-valuetext` | item?.text |
| `segment` | `role` | undefined \| 'spinbutton' |
| `clear-trigger` | `aria-label` | props.translations.clearTrigger |

## 样式

默认皮肤 `@xihan-ui/styles/date-field.css` 按部件选择：`[data-scope="date-field"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-complete` | ''（条件成立时才出现） |
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
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `segment-group` | `data-disabled` | ''（条件成立时才出现） |
| `segment-group` | `data-invalid` | ''（条件成立时才出现） |
| `segment-group` | `data-readonly` | ''（条件成立时才出现） |
| `segment` | `data-disabled` | ''（条件成立时才出现） |
| `segment` | `data-focus` | ''（条件成立时才出现） |
| `segment` | `data-index` | String(index) \| undefined |
| `segment` | `data-invalid` | ''（条件成立时才出现） |
| `segment` | `data-placeholder` | ''（条件成立时才出现） |
| `segment` | `data-readonly` | ''（条件成立时才出现） |
| `segment` | `data-segment` | item?.type |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-date-field-action-bg` | `clear-trigger` | `background` | `default` | `transparent` | date-field 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-date-field-action-bg-active` | `clear-trigger` | `background` | `active` | `--xh-bg-subtle-active` | date-field 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-date-field-action-bg-hover` | `clear-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | date-field 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-date-field-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | date-field 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-date-field-action-fg-hover` | `clear-trigger` | `color` | `hover` | `--xh-fg-default` | date-field 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-date-field-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | date-field 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-date-field-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-control` | date-field 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-date-field-action-size` | `clear-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | date-field 的 clear-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-date-field-control-bg` | `control` | `background` | `default` | `--xh-_date-field-control-bg` | date-field 的 control 部件 background 覆盖槽。 |
| `--xh-date-field-control-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` | date-field 的 control 部件 background 覆盖槽。 |
| `--xh-date-field-control-bg-hover` | `control` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly` | `--xh-_date-field-control-bg-hover` | date-field 的 control 部件 background 覆盖槽。 |
| `--xh-date-field-control-bg-readonly` | `control` | `background` | `readonly` | `--xh-bg-subtle` | date-field 的 control 部件 background 覆盖槽。 |
| `--xh-date-field-control-border` | `control` | `border` | `default` | `--xh-_date-field-control-border` | date-field 的 control 部件 border 覆盖槽。 |
| `--xh-date-field-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])` | `--xh-_tone` | date-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-date-field-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid])` | `--xh-_date-field-control-border-hover` | date-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-date-field-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` | date-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-date-field-control-fg` | `control` | `color` | `default` | `--xh-fg-default` | date-field 的 control 部件 color 覆盖槽。 |
| `--xh-date-field-control-gap` | `control` | `gap` | `default` | `--xh-_date-field-gap` | date-field 的 control 部件 gap 覆盖槽。 |
| `--xh-date-field-control-h` | `control` | `block-size` | `default` | `--xh-_date-field-control-h` | date-field 的 control 部件 block-size 覆盖槽。 |
| `--xh-date-field-control-min-w` | `control`<br>`root` | `min-inline-size` | `default` | `--xh-control-min-w` | date-field 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-date-field-control-px` | `control` | `padding-inline` | `default` | `--xh-_date-field-control-px` | date-field 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-date-field-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | date-field 的 control 部件 border-radius 覆盖槽。 |
| `--xh-date-field-control-shadow` | `control` | `box-shadow` | `default` | `--xh-_date-field-control-shadow` | date-field 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-date-field-font-size` | `control` | `font-size` | `default` | `--xh-_date-field-font-size` | date-field 的 control 部件 font-size 覆盖槽。 |
| `--xh-date-field-gap` | `root` | `gap` | `default` | `--xh-space-1` | date-field 的 root 部件 gap 覆盖槽。 |
| `--xh-date-field-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | date-field 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-date-field-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | date-field 的 label 部件 color 覆盖槽。 |
| `--xh-date-field-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | date-field 的 label 部件 color 覆盖槽。 |
| `--xh-date-field-label-font-size` | `label` | `font-size` | `default` | `--xh-_date-field-label-font-size` | date-field 的 label 部件 font-size 覆盖槽。 |
| `--xh-date-field-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | date-field 的 label 部件 font-weight 覆盖槽。 |
| `--xh-date-field-placeholder-fg` | `segment` | `color` | `placeholder` | `--xh-fg-subtle` | date-field 的 segment 部件 color 覆盖槽。 |
| `--xh-date-field-segment-bg-focus` | `segment` | `background` | `focus`<br>`focus-visible` | `--xh-_date-field-segment-bg` | date-field 的 segment 部件 background 覆盖槽。 |
| `--xh-date-field-segment-fg-focus` | `segment` | `color` | `focus`<br>`focus-visible`<br>`placeholder` | `--xh-_date-field-segment-fg` | date-field 的 segment 部件 color 覆盖槽。 |
| `--xh-date-field-segment-px` | `segment` | `padding-inline` | `default` | `--xh-space-1` | date-field 的 segment 部件 padding-inline 覆盖槽。 |
| `--xh-date-field-segment-py` | `segment` | `padding-block` | `default` | `--xh-space-0` | date-field 的 segment 部件 padding-block 覆盖槽。 |
| `--xh-date-field-segment-radius` | `segment` | `border-radius` | `default` | `--xh-shape-inset` | date-field 的 segment 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[表单字段](./field)；与[日期选择器](./date-picker)共用同一套段位部件。

## 最佳实践

- 给出 `min` / `max`，方向键才有边界。
- 明确对外值的写法（ISO 串还是别的），并与后端对齐。

## 反模式

- 用一个[文本输入](./text-field)收日期再自己解析：各地区的写法互不相同，解析出来的结果不可控。
