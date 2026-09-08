来源：https://ui.docs.xihanfun.com/components/number-field

# 数字输入 `number-field`

带加减与区间约束的数值输入。

## 何时使用

- 数量、价格、百分比这类需要精确到某一位的数值。
- 需要步进（键盘上下键、加减钮）。

## 何时不用

- 用户更关心相对位置而非精确值：用[滑块](./slider)。
- 值实际是编号或电话（不参与运算）：用[文本输入](./text-field)，数字输入的千分位与步进会碍事。

## 特性

- `step` 与 `largeStep` 分别对应方向键和 PageUp / PageDown。
- 长按加减钮连续步进，首跳延时与间隔都可调。
- `parse` / `format` 一对，用来接固定小数位、千分位、货币符号或自定义换算。
- 越界的值在提交时机被夹回区间。
- `prefix` / `suffix` 在框内摆货币符、单位或图标，两段对读屏隐藏。

## 示例

### 基础用法

加减按钮与输入框共用一份状态；值是原始输入串，不传 value 即为非受控

```vue
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhNumberFieldRoot default-value="1">
    <XhNumberFieldLabel>数量</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldInput />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
  </XhNumberFieldRoot>
</template>
```

```html
<xh-number-field default-value="1">
  <div data-xh-part="root">
    <label data-xh-part="label">数量</label>
    <div data-xh-part="control">
      <button data-xh-part="decrement-trigger"></button>
      <input data-xh-part="input" />
      <button data-xh-part="increment-trigger"></button>
    </div>
  </div>
</xh-number-field>
```

### 区间与步长

方向键走 step，PageUp 与 PageDown 走 largeStep，Home 与 End 取端点；贴到边界时对应按钮转灰

```vue
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhNumberFieldRoot
    v-slot="{ valueAsNumber, canIncrement, canDecrement }"
    default-value="10"
    :min="0"
    :max="20"
    :step="2"
    :large-step="10"
  >
    <XhNumberFieldLabel>数量（0 – 20，每档 2）</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldInput />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
    <span>
      数值：{{ Number.isNaN(valueAsNumber) ? "（空）" : valueAsNumber }} ·
      可加：{{ canIncrement ? "是" : "否" }} · 可减：{{ canDecrement ? "是" : "否" }}
    </span>
  </XhNumberFieldRoot>
</template>
```

```html
<xh-number-field
  id="number-field-range"
  default-value="10"
  min="0"
  max="20"
  step="2"
  large-step="10"
>
  <div data-xh-part="root">
    <label data-xh-part="label">数量（0 – 20，每档 2）</label>
    <div data-xh-part="control">
      <button data-xh-part="decrement-trigger"></button>
      <input data-xh-part="input" />
      <button data-xh-part="increment-trigger"></button>
    </div>
    <span>
      数值：<span id="number-field-range-value">10</span> ·
      可加：<span id="number-field-range-increment">是</span> ·
      可减：<span id="number-field-range-decrement">是</span>
    </span>
  </div>
</xh-number-field>

<script type="module">
  // 数值从事件明细里取；可加可减写在两个按钮的 data-disabled 上，等这一轮接线落定再读
  const field = document.getElementById("number-field-range");
  const value = document.getElementById("number-field-range-value");
  const increment = document.getElementById("number-field-range-increment");
  const decrement = document.getElementById("number-field-range-decrement");
  const incrementTrigger = field.querySelector('[data-xh-part="increment-trigger"]');
  const decrementTrigger = field.querySelector('[data-xh-part="decrement-trigger"]');

  field.addEventListener("value-change", async (event) => {
    const asNumber = event.detail.valueAsNumber;
    value.textContent = Number.isNaN(asNumber) ? "（空）" : String(asNumber);
    await field.updateComplete;
    increment.textContent = incrementTrigger.hasAttribute("data-disabled") ? "否" : "是";
    decrement.textContent = decrementTrigger.hasAttribute("data-disabled") ? "否" : "是";
  });
</script>
```

### 受控

传了 value 就由宿主说了算；value-change 除了原始串还带一份 valueAsNumber

```vue
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const qty = ref("3");
const asNumber = ref(3);
</script>

<template>
  <XhNumberFieldRoot
    v-model:value="qty"
    :min="0"
    :max="99"
    @value-change="asNumber = $event.valueAsNumber"
  >
    <XhNumberFieldLabel>数量</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldInput />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
  </XhNumberFieldRoot>
  <span>输入串：{{ qty === "" ? "（空）" : qty }} · 数值：{{ asNumber }}</span>
</template>
```

```html
<xh-number-field id="number-field-controlled" value="3" min="0" max="99">
  <div data-xh-part="root">
    <label data-xh-part="label">数量</label>
    <div data-xh-part="control">
      <button data-xh-part="decrement-trigger"></button>
      <input data-xh-part="input" />
      <button data-xh-part="increment-trigger"></button>
    </div>
  </div>
</xh-number-field>
<span>
  输入串：<span id="number-field-controlled-text">3</span> ·
  数值：<span id="number-field-controlled-number">3</span>
</span>

<script type="module">
  // 值只在这里写，写回去组件才动
  const field = document.getElementById("number-field-controlled");
  const text = document.getElementById("number-field-controlled-text");
  const number = document.getElementById("number-field-controlled-number");

  field.addEventListener("value-change", (event) => {
    field.value = event.detail.value;
    text.textContent = event.detail.value === "" ? "（空）" : event.detail.value;
    number.textContent = String(event.detail.valueAsNumber);
  });
</script>
```

### 禁用与只读

两者都改不动值，禁用还会把加减按钮一并关掉、值也不再随表单提交

```vue
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhNumberFieldRoot default-value="5" disabled>
    <XhNumberFieldLabel>禁用</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldInput />
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
  </XhNumberFieldRoot>

  <XhNumberFieldRoot default-value="5" read-only>
    <XhNumberFieldLabel>只读</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldInput />
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
  </XhNumberFieldRoot>
</template>
```

```html
<xh-number-field default-value="5" disabled>
  <div data-xh-part="root">
    <label data-xh-part="label">禁用</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="decrement-trigger"></button>
      <button data-xh-part="increment-trigger"></button>
    </div>
  </div>
</xh-number-field>

<xh-number-field default-value="5" read-only>
  <div data-xh-part="root">
    <label data-xh-part="label">只读</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="decrement-trigger"></button>
      <button data-xh-part="increment-trigger"></button>
    </div>
  </div>
</xh-number-field>
```

### 形态

variant 只改皮肤怎么用颜色，加减与键盘行为三档完全一致

```vue
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhNumberFieldRoot v-for="v in variants" :key="v" :variant="v" default-value="1">
      <XhNumberFieldLabel>{{ v }}</XhNumberFieldLabel>
      <XhNumberFieldControl>
        <XhNumberFieldDecrementTrigger />
        <XhNumberFieldInput />
        <XhNumberFieldIncrementTrigger />
      </XhNumberFieldControl>
    </XhNumberFieldRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-number-field variant="outline" default-value="1">
    <div data-xh-part="root">
      <label data-xh-part="label">outline</label>
      <div data-xh-part="control">
        <button data-xh-part="decrement-trigger"></button>
        <input data-xh-part="input" />
        <button data-xh-part="increment-trigger"></button>
      </div>
    </div>
  </xh-number-field>

  <xh-number-field variant="subtle" default-value="1">
    <div data-xh-part="root">
      <label data-xh-part="label">subtle</label>
      <div data-xh-part="control">
        <button data-xh-part="decrement-trigger"></button>
        <input data-xh-part="input" />
        <button data-xh-part="increment-trigger"></button>
      </div>
    </div>
  </xh-number-field>

  <xh-number-field variant="ghost" default-value="1">
    <div data-xh-part="root">
      <label data-xh-part="label">ghost</label>
      <div data-xh-part="control">
        <button data-xh-part="decrement-trigger"></button>
        <input data-xh-part="input" />
        <button data-xh-part="increment-trigger"></button>
      </div>
    </div>
  </xh-number-field>
</div>
```

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 outline 只看语气的差别

```vue
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhNumberFieldRoot v-for="t in tones" :key="t" variant="outline" :tone="t" default-value="1">
      <XhNumberFieldLabel>{{ t }}</XhNumberFieldLabel>
      <XhNumberFieldControl>
        <XhNumberFieldDecrementTrigger />
        <XhNumberFieldInput />
        <XhNumberFieldIncrementTrigger />
      </XhNumberFieldControl>
    </XhNumberFieldRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-number-field variant="outline" tone="brand" default-value="1">
    <div data-xh-part="root">
      <label data-xh-part="label">brand</label>
      <div data-xh-part="control">
        <button data-xh-part="decrement-trigger"></button>
        <input data-xh-part="input" />
        <button data-xh-part="increment-trigger"></button>
      </div>
    </div>
  </xh-number-field>

  <xh-number-field variant="outline" tone="neutral" default-value="1">
    <div data-xh-part="root">
      <label data-xh-part="label">neutral</label>
      <div data-xh-part="control">
        <button data-xh-part="decrement-trigger"></button>
        <input data-xh-part="input" />
        <button data-xh-part="increment-trigger"></button>
      </div>
    </div>
  </xh-number-field>

  <xh-number-field variant="outline" tone="success" default-value="1">
    <div data-xh-part="root">
      <label data-xh-part="label">success</label>
      <div data-xh-part="control">
        <button data-xh-part="decrement-trigger"></button>
        <input data-xh-part="input" />
        <button data-xh-part="increment-trigger"></button>
      </div>
    </div>
  </xh-number-field>

  <xh-number-field variant="outline" tone="warning" default-value="1">
    <div data-xh-part="root">
      <label data-xh-part="label">warning</label>
      <div data-xh-part="control">
        <button data-xh-part="decrement-trigger"></button>
        <input data-xh-part="input" />
        <button data-xh-part="increment-trigger"></button>
      </div>
    </div>
  </xh-number-field>

  <xh-number-field variant="outline" tone="danger" default-value="1">
    <div data-xh-part="root">
      <label data-xh-part="label">danger</label>
      <div data-xh-part="control">
        <button data-xh-part="decrement-trigger"></button>
        <input data-xh-part="input" />
        <button data-xh-part="increment-trigger"></button>
      </div>
    </div>
  </xh-number-field>

  <xh-number-field variant="outline" tone="info" default-value="1">
    <div data-xh-part="root">
      <label data-xh-part="label">info</label>
      <div data-xh-part="control">
        <button data-xh-part="decrement-trigger"></button>
        <input data-xh-part="input" />
        <button data-xh-part="increment-trigger"></button>
      </div>
    </div>
  </xh-number-field>
</div>
```

### 尺寸

输入框高度与加减按钮一起换档，不传 size 即默认档

```vue
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px">
    <XhNumberFieldRoot v-for="s in sizes" :key="s.label" :size="s.size" default-value="1">
      <XhNumberFieldLabel>{{ s.label }}</XhNumberFieldLabel>
      <XhNumberFieldControl>
        <XhNumberFieldDecrementTrigger />
        <XhNumberFieldInput />
        <XhNumberFieldIncrementTrigger />
      </XhNumberFieldControl>
    </XhNumberFieldRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px">
  <xh-number-field size="sm" default-value="1">
    <div data-xh-part="root">
      <label data-xh-part="label">小</label>
      <div data-xh-part="control">
        <button data-xh-part="decrement-trigger"></button>
        <input data-xh-part="input" />
        <button data-xh-part="increment-trigger"></button>
      </div>
    </div>
  </xh-number-field>

  <!-- 中间一档不写 size -->
  <xh-number-field default-value="1">
    <div data-xh-part="root">
      <label data-xh-part="label">默认</label>
      <div data-xh-part="control">
        <button data-xh-part="decrement-trigger"></button>
        <input data-xh-part="input" />
        <button data-xh-part="increment-trigger"></button>
      </div>
    </div>
  </xh-number-field>

  <xh-number-field size="lg" default-value="1">
    <div data-xh-part="root">
      <label data-xh-part="label">大</label>
      <div data-xh-part="control">
        <button data-xh-part="decrement-trigger"></button>
        <input data-xh-part="input" />
        <button data-xh-part="increment-trigger"></button>
      </div>
    </div>
  </xh-number-field>
</div>
```

### 只用输入框

加减钮是可选部件，不渲染它照样能改值：方向键走 step，PageUp 与 PageDown 走 largeStep

```vue
<script setup lang="ts">
import { XhNumberFieldInput, XhNumberFieldLabel, XhNumberFieldRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhNumberFieldRoot
    v-slot="{ value }"
    default-value="60"
    :min="0"
    :max="100"
    :step="5"
    :large-step="25"
  >
    <XhNumberFieldLabel>音量（0 – 100，每档 5）</XhNumberFieldLabel>
    <XhNumberFieldInput style="inline-size: 96px; text-align: center" />
    <span>点进框里按上下键：{{ value === "" ? "（空）" : value }}</span>
  </XhNumberFieldRoot>
</template>
```

```html
<xh-number-field
  id="number-field-no-trigger"
  default-value="60"
  min="0"
  max="100"
  step="5"
  large-step="25"
>
  <div data-xh-part="root">
    <label data-xh-part="label">音量（0 – 100，每档 5）</label>
    <input data-xh-part="input" style="inline-size: 96px; text-align: center" />
    <span>点进框里按上下键：<span id="number-field-no-trigger-value">60</span></span>
  </div>
</xh-number-field>

<script type="module">
  // 值从事件明细里取，原样回显
  const field = document.getElementById("number-field-no-trigger");
  const readout = document.getElementById("number-field-no-trigger-value");

  field.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value === "" ? "（空）" : event.detail.value;
  });
</script>
```

### 加减钮排布

触发器位置由作者写模板决定：放进 control 即减在左、加在右、输入框居中的一体式，不写 control 则照旧三件并排

```vue
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhNumberFieldRoot default-value="1" :min="0" :max="9">
    <XhNumberFieldLabel>一体式（control）</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldInput />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
  </XhNumberFieldRoot>

  <XhNumberFieldRoot default-value="1" :min="0" :max="9">
    <XhNumberFieldLabel>三件并排（不写 control）</XhNumberFieldLabel>
    <div style="display: flex; gap: 4px">
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldInput style="inline-size: 80px; text-align: center" />
      <XhNumberFieldIncrementTrigger />
    </div>
  </XhNumberFieldRoot>
</template>
```

```html
<xh-number-field default-value="1" min="0" max="9">
  <div data-xh-part="root">
    <label data-xh-part="label">一体式（control）</label>
    <div data-xh-part="control">
      <button data-xh-part="decrement-trigger"></button>
      <input data-xh-part="input" />
      <button data-xh-part="increment-trigger"></button>
    </div>
  </div>
</xh-number-field>

<xh-number-field default-value="1" min="0" max="9">
  <div data-xh-part="root">
    <label data-xh-part="label">三件并排（不写 control）</label>
    <div style="display: flex; gap: 4px">
      <button data-xh-part="decrement-trigger"></button>
      <input data-xh-part="input" style="inline-size: 80px; text-align: center" />
      <button data-xh-part="increment-trigger"></button>
    </div>
  </div>
</xh-number-field>
```

### 校验态

invalid 由宿主自己判定，不必挂在表单上；标出来之后值照样能改、加减钮照样能按

```vue
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const stock = 5;
const qty = ref(8);

function onValueChange(details: { valueAsNumber: number }) {
  qty.value = details.valueAsNumber;
}
</script>

<template>
  <XhNumberFieldRoot
    default-value="8"
    :min="1"
    :max="99"
    :invalid="qty > stock"
    @value-change="onValueChange"
  >
    <XhNumberFieldLabel>购买数量</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldInput />
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
    <span>{{ qty > stock ? `库存只有 ${stock} 件` : "库存充足" }}</span>
  </XhNumberFieldRoot>
</template>
```

```html
<xh-number-field id="number-field-invalid" default-value="8" min="1" max="99" invalid>
  <div data-xh-part="root">
    <label data-xh-part="label">购买数量</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="decrement-trigger"></button>
      <button data-xh-part="increment-trigger"></button>
    </div>
    <span id="number-field-invalid-hint">库存只有 5 件</span>
  </div>
</xh-number-field>

<script type="module">
  // 超出库存就标成校验失败，判定与提示都在这里做
  const stock = 5;
  const field = document.getElementById("number-field-invalid");
  const hint = document.getElementById("number-field-invalid-hint");

  field.addEventListener("value-change", (event) => {
    const over = event.detail.valueAsNumber > stock;
    field.invalid = over;
    hint.textContent = over ? `库存只有 ${stock} 件` : "库存充足";
  });
</script>
```

### 框内单位与货币符号

前后缀图标/文字直接流式插进 control：减在左、加在右、输入框居中，前后缀排在输入框两侧

```vue
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhNumberFieldRoot default-value="99" :min="0" :max="9999">
    <XhNumberFieldLabel>单价</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldDecrementTrigger />
      <span style="color: var(--xh-fg-muted)">¥</span>
      <XhNumberFieldInput />
      <span style="color: var(--xh-fg-muted)">元</span>
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
  </XhNumberFieldRoot>

  <XhNumberFieldRoot default-value="500" :min="0" :max="5000" :step="50">
    <XhNumberFieldLabel>重量</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldInput />
      <span style="color: var(--xh-fg-muted)">g</span>
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
  </XhNumberFieldRoot>
</template>
```

```html
<xh-number-field default-value="99" min="0" max="9999">
  <div data-xh-part="root">
    <label data-xh-part="label">单价</label>
    <div data-xh-part="control">
      <button data-xh-part="decrement-trigger"></button>
      <span style="color: var(--xh-fg-muted)">¥</span>
      <input data-xh-part="input" />
      <span style="color: var(--xh-fg-muted)">元</span>
      <button data-xh-part="increment-trigger"></button>
    </div>
  </div>
</xh-number-field>

<xh-number-field default-value="500" min="0" max="5000" step="50">
  <div data-xh-part="root">
    <label data-xh-part="label">重量</label>
    <div data-xh-part="control">
      <button data-xh-part="decrement-trigger"></button>
      <input data-xh-part="input" />
      <span style="color: var(--xh-fg-muted)">g</span>
      <button data-xh-part="increment-trigger"></button>
    </div>
  </div>
</xh-number-field>
```

### 固定小数位

步进本身带定点规整，宿主在离开输入框与松开加减钮时把值补齐到两位小数

```vue
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const price = ref("12.50");

// 补齐两位小数；空值与非法值一律留空
function pad() {
  const n = Number(price.value);
  price.value = price.value === "" || !Number.isFinite(n) ? "" : n.toFixed(2);
}
</script>

<template>
  <XhNumberFieldRoot v-model:value="price" :min="0" :max="999" :step="0.1">
    <XhNumberFieldLabel>单价（每档 0.1）</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldInput @blur="pad" />
      <XhNumberFieldDecrementTrigger @pointerup="pad" />
      <XhNumberFieldIncrementTrigger @pointerup="pad" />
    </XhNumberFieldControl>
    <span>当前：{{ price || "（空）" }}</span>
  </XhNumberFieldRoot>
</template>
```

```html
<xh-number-field id="number-field-precision" value="12.50" min="0" max="999" step="0.1">
  <div data-xh-part="root">
    <label data-xh-part="label">单价（每档 0.1）</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="decrement-trigger"></button>
      <button data-xh-part="increment-trigger"></button>
    </div>
    <span>当前：<span id="number-field-precision-value">12.50</span></span>
  </div>
</xh-number-field>

<script type="module">
  // 值握在这里，组件报出变化后写回
  const field = document.getElementById("number-field-precision");
  const readout = document.getElementById("number-field-precision-value");

  function setValue(next) {
    field.value = next;
    readout.textContent = next || "（空）";
  }

  // 补齐两位小数；空值与非法值一律留空
  function pad() {
    const n = Number(field.value);
    setValue(field.value === "" || !Number.isFinite(n) ? "" : n.toFixed(2));
  }

  // 补齐排在本轮事件全部走完之后一拍，组件自己的失焦规范化先落地
  const padLater = () => setTimeout(pad);

  field.addEventListener("value-change", (event) => setValue(event.detail.value));
  field.querySelector('[data-xh-part="input"]').addEventListener("blur", padLater);

  for (const trigger of field.querySelectorAll('[data-xh-part$="-trigger"]')) {
    trigger.addEventListener("pointerup", padLater);
  }
</script>
```

### 提交时机

输入途中只动草稿，失焦或回车才把值交给业务模型；不合法就退回上一次提交的值

```vue
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 草稿绑在组件上，模型只在提交那一刻更新
const draft = ref("3");
const model = ref(3);

function commit() {
  const n = Number(draft.value);
  if (draft.value === "" || !Number.isFinite(n)) {
    draft.value = String(model.value);
    return;
  }
  model.value = n;
  draft.value = String(n);
}
</script>

<template>
  <XhNumberFieldRoot v-model:value="draft" :min="1" :max="99">
    <XhNumberFieldLabel>数量</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldInput @blur="commit" @keydown.enter="commit" />
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
    <span>草稿：{{ draft || "（空）" }} · 已提交：{{ model }}</span>
  </XhNumberFieldRoot>
</template>
```

```html
<xh-number-field id="number-field-change-timing" value="3" min="1" max="99">
  <div data-xh-part="root">
    <label data-xh-part="label">数量</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="decrement-trigger"></button>
      <button data-xh-part="increment-trigger"></button>
    </div>
    <span>
      草稿：<span id="number-field-change-timing-draft">3</span> ·
      已提交：<span id="number-field-change-timing-model">3</span>
    </span>
  </div>
</xh-number-field>

<script type="module">
  // 草稿绑在组件上，模型只在提交那一刻更新
  const field = document.getElementById("number-field-change-timing");
  const draftText = document.getElementById("number-field-change-timing-draft");
  const modelText = document.getElementById("number-field-change-timing-model");
  const input = field.querySelector('[data-xh-part="input"]');

  let model = 3;

  function setDraft(next) {
    field.value = next;
    draftText.textContent = next || "（空）";
  }

  function commit() {
    const n = Number(field.value);
    if (field.value === "" || !Number.isFinite(n)) {
      setDraft(String(model));
      return;
    }
    model = n;
    setDraft(String(n));
    modelText.textContent = String(model);
  }

  field.addEventListener("value-change", (event) => setDraft(event.detail.value));

  // 提交排在本轮事件全部走完之后一拍，组件自己的失焦规范化先落地
  input.addEventListener("blur", () => setTimeout(commit));

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") commit();
  });
</script>
```

### 自定义换算

parse 把显示串读成数、format 把数写回显示串；两个方向必须互逆，否则按一下加号值就会漂

```vue
<script setup lang="ts">
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const amount = ref("1,234");
// 千位分隔符：读的时候把逗号去掉，写的时候再加回来
const parseAmount = (text: string) => Number(text.replace(/,/g, ""));
const formatAmount = (value: number) => value.toLocaleString("en-US");

const weight = ref("60 kg");
// 单位后缀同理：认得出后缀就读得出数
const parseWeight = (text: string) => Number(text.replace(/\s*kg$/i, ""));
const formatWeight = (value: number) => `${value} kg`;
</script>

<template>
  <XhNumberFieldRoot
    v-model:value="amount"
    :min="0"
    :max="99999"
    :step="100"
    :parse="parseAmount"
    :format="formatAmount"
  >
    <XhNumberFieldLabel>金额（千位分隔）</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldInput style="inline-size: 96px" />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
  </XhNumberFieldRoot>

  <XhNumberFieldRoot
    v-model:value="weight"
    :min="0"
    :max="200"
    :step="5"
    :parse="parseWeight"
    :format="formatWeight"
  >
    <XhNumberFieldLabel>体重（带单位）</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldInput style="inline-size: 88px" />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
  </XhNumberFieldRoot>

  <!-- 输入途中一律不补格式，否则光标会被打断；手打 1500 要等失焦才变成 1,500 -->
  <span style="font-size: 13px">金额：{{ amount }} · 体重：{{ weight }}</span>
</template>
```

```html
<xh-number-field id="number-field-amount" value="1,234" min="0" max="99999" step="100">
  <div data-xh-part="root">
    <label data-xh-part="label">金额（千位分隔）</label>
    <div data-xh-part="control">
      <button data-xh-part="decrement-trigger"></button>
      <input data-xh-part="input" style="inline-size: 96px" />
      <button data-xh-part="increment-trigger"></button>
    </div>
  </div>
</xh-number-field>

<xh-number-field id="number-field-weight" value="60 kg" min="0" max="200" step="5">
  <div data-xh-part="root">
    <label data-xh-part="label">体重（带单位）</label>
    <div data-xh-part="control">
      <button data-xh-part="decrement-trigger"></button>
      <input data-xh-part="input" style="inline-size: 88px" />
      <button data-xh-part="increment-trigger"></button>
    </div>
  </div>
</xh-number-field>

<!-- 输入途中一律不补格式，否则光标会被打断；手打 1500 要等失焦才变成 1,500 -->
<span style="font-size: 13px">
  金额：<span id="number-field-amount-value">1,234</span> ·
  体重：<span id="number-field-weight-value">60 kg</span>
</span>

<script type="module">
  // 两个换算方向是函数，交不成属性，只走 property
  const amount = document.getElementById("number-field-amount");
  const amountText = document.getElementById("number-field-amount-value");
  const weight = document.getElementById("number-field-weight");
  const weightText = document.getElementById("number-field-weight-value");

  // 千位分隔符：读的时候把逗号去掉，写的时候再加回来
  amount.parse = (text) => Number(text.replace(/,/g, ""));
  amount.format = (value) => value.toLocaleString("en-US");

  // 单位后缀同理：认得出后缀就读得出数
  weight.parse = (text) => Number(text.replace(/\s*kg$/i, ""));
  weight.format = (value) => `${value} kg`;

  amount.addEventListener("value-change", (event) => {
    amount.value = event.detail.value;
    amountText.textContent = event.detail.value;
  });

  weight.addEventListener("value-change", (event) => {
    weight.value = event.detail.value;
    weightText.textContent = event.detail.value;
  });
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-number-field>` |
| Vue 组件 | `XhNumberFieldControl` `XhNumberFieldDecrementTrigger` `XhNumberFieldIncrementTrigger` `XhNumberFieldInput` `XhNumberFieldLabel` `XhNumberFieldPrefix` `XhNumberFieldRoot` `XhNumberFieldSuffix` |
| 组合式函数 | `useNumberField` |
| 状态机 | `numberFieldMachine` |
| 皮肤 | `@xihan-ui/styles/number-field.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="number-field"`：**`root`** · `label` · `control` · `prefix` · **`input`** · `suffix` · `increment-trigger` · `decrement-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  |  |
| `defaultValue` | `string` |  |  |
| `min` | `number` |  |  |
| `max` | `number` |  |  |
| `step` | `number` |  | 方向键与加减按钮的步长，默认 1。 |
| `largeStep` | `number` |  | PageUp / PageDown 的步长，默认 10 倍 step。 |
| `disabled` | `boolean` |  |  |
| `readOnly` | `boolean` |  |  |
| `required` | `boolean` |  |  |
| `invalid` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；给了才参与提交。 |
| `changeDelay` | `number` |  | 按住加减按钮多久开始连发，默认 300ms。 |
| `changeInterval` | `number` |  | 连发间隔，默认 50ms。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入框与加减钮的底与描边怎么画。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定输入框与加减钮的几何档位。 |
| `parse` | `(text: string) => number` |  | 显示串 → 数。默认按 `Number()` 读（'12abc' 判为非法），给了它就换成它—— 千位分隔符、单位后缀、百分号这类都靠这条读回来。读不出数返回 `NaN`。 与 `format` 必须互逆：`format` 出来的串要能被 `parse` 读回同一个数， 否则按一下加号值就会漂。 |
| `format` | `(value: number) => string` |  | 数 → 显示串。默认 `String(n)`。**只在组件自己改写显示时用**——步进、取端点、 失焦规范化这三处；用户正在打字时一律不碰，否则光标会被打断。 |
| `onValueChange` | `(details: NumberFieldValueChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `NumberFieldValueChangeDetails` | 值变化；detail 为 `{ value: string, valueAsNumber: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhNumberFieldRoot` | `default` | `NumberFieldRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `spinning`

**事件**：`VALUE.SET` · `VALUE.STEP` · `VALUE.TO_MIN` · `VALUE.TO_MAX` · `INPUT.BLUR` · `PRESS.START` · `PRESS.END` · `after.changeInterval` · `FORM.RESET`

**判据**：`canStep`

## connect API

`useNumberField` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` |  |
| `valueAsNumber` | `number` |  |
| `empty` | `boolean` | 值为空或非法。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `canIncrement` | `boolean` |  |
| `canDecrement` | `boolean` |  |
| `setValue` | `(next: string) => void` |  |
| `increment` | `() => void` |  |
| `decrement` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` | 输入框与加减钮的包裹层：皮肤把视觉盒画在它身上，减在左、加在右、输入框居中。 |
| `getPrefixProps` | `() => T['element']` | 输入框前的装饰段（货币符、单位、图标）；对读屏隐藏，不参与名字链。 |
| `getInputProps` | `() => T['input']` |  |
| `getSuffixProps` | `() => T['element']` | 输入框后的装饰段；对读屏隐藏，不参与名字链。 |
| `getIncrementTriggerProps` | `() => T['button']` |  |
| `getDecrementTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowUp` | focus in input, not disabled/readOnly | 按 step 递增，越界则停在 max |
| `ArrowDown` | focus in input, not disabled/readOnly | 按 step 递减，越界则停在 min |
| `PageUp` | focus in input, not disabled/readOnly | 按 largeStep 递增（默认 10 倍 step） |
| `PageDown` | focus in input, not disabled/readOnly | 按 largeStep 递减 |
| `Home` | focus in input, 指定了 min | 取 min；未指定 min 时不动 |
| `End` | focus in input, 指定了 max | 取 max；未指定 max 时不动 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `prefix` | `aria-hidden` | 'true' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `input` | `aria-valuemax` | props.max |
| `input` | `aria-valuemin` | props.min |
| `input` | `aria-valuenow` | undefined \| decodeNumber(value, { parse: prop('parse'), format: p… |
| `input` | `role` | 'spinbutton' |
| `suffix` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/number-field.css` 按部件选择：`[data-scope="number-field"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `prefix` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `suffix` | `data-disabled` | ''（条件成立时才出现） |
| `increment-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `decrement-trigger` | `data-disabled` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-number-field-affix-fg` · `--xh-number-field-affix-fg-disabled` · `--xh-number-field-affix-font-size` · `--xh-number-field-control-bg` · `--xh-number-field-control-bg-disabled` · `--xh-number-field-control-bg-hover` · `--xh-number-field-control-bg-readonly` · `--xh-number-field-control-border` · `--xh-number-field-control-border-focus` · `--xh-number-field-control-border-hover` · `--xh-number-field-control-border-invalid` · `--xh-number-field-control-gap` · `--xh-number-field-control-h` · `--xh-number-field-control-min-w` · `--xh-number-field-control-px` · `--xh-number-field-control-radius` · `--xh-number-field-control-shadow` · `--xh-number-field-gap` · `--xh-number-field-icon-size` · `--xh-number-field-input-align` · `--xh-number-field-input-autofill-bg` · `--xh-number-field-input-autofill-fg` · `--xh-number-field-input-bg` · `--xh-number-field-input-bg-disabled` · `--xh-number-field-input-bg-hover` · `--xh-number-field-input-bg-readonly` · `--xh-number-field-input-border` · `--xh-number-field-input-border-focus` · `--xh-number-field-input-border-hover` · `--xh-number-field-input-border-invalid` · `--xh-number-field-input-fg` · `--xh-number-field-input-font-size` · `--xh-number-field-input-h` · `--xh-number-field-input-px` · `--xh-number-field-input-radius` · `--xh-number-field-input-shadow` · `--xh-number-field-input-w` · `--xh-number-field-label-fg` · `--xh-number-field-label-fg-disabled` · `--xh-number-field-label-font-size` · `--xh-number-field-label-font-weight` · `--xh-number-field-placeholder-fg` · `--xh-number-field-trigger-bg` · `--xh-number-field-trigger-bg-active` · `--xh-number-field-trigger-bg-disabled` · `--xh-number-field-trigger-bg-hover` · `--xh-number-field-trigger-border` · `--xh-number-field-trigger-border-disabled` · `--xh-number-field-trigger-border-hover` · `--xh-number-field-trigger-fg` · `--xh-number-field-trigger-fg-hover` · `--xh-number-field-trigger-font-size` · `--xh-number-field-trigger-radius` · `--xh-number-field-trigger-size`

## 动效

`background` · `border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[表单字段](./field)；单位与货币符号放进框内前后缀。

## 最佳实践

- 给出 `min` / `max`，让键盘用户按住方向键时有个尽头。
- 显示格式与提交值分开：显示可以带千分位，提交的是纯数值。

## 反模式

- 加减钮做得太小：这是移动端最常见的误触来源。
- 用它输入年份、邮编、身份证号。
