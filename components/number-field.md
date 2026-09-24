来源：https://ui.docs.xihanfun.com/components/number-field

# NumberField 数字字段

带加减与区间约束的数值输入。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/number-field" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/number-field.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/number-field" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/number-field" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/number-field.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

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
  <XhNumberFieldRoot default-value="1024" :min="0" name="width">
    <XhNumberFieldLabel>宽度</XhNumberFieldLabel>
    <XhNumberFieldControl>
      <XhNumberFieldDecrementTrigger />
      <XhNumberFieldInput />
      <XhNumberFieldIncrementTrigger />
    </XhNumberFieldControl>
  </XhNumberFieldRoot>
</template>
```

```html
<xh-number-field default-value="1024" min="0" name="width">
  <div data-xh-part="root">
    <label data-xh-part="label">宽度</label>
    <div data-xh-part="control">
      <button data-xh-part="decrement-trigger"></button>
      <input data-xh-part="input" />
      <button data-xh-part="increment-trigger"></button>
    </div>
  </div>
</xh-number-field>
```

## 组件结构

加粗的是必需部件。

`data-scope="number-field"`：**`root`** · `label` · **`control`** · `prefix` · **`input`** · `suffix` · `increment-trigger` · `decrement-trigger`

## 示例

### 区间与步长

方向键按 step，PageUp 与 PageDown 按 largeStep，Home 与 End 取端点；到达边界时对应按钮转灰

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

传入 value 后由宿主决定；value-change 除原始串外还带一份 valueAsNumber

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

两者都不可修改值，禁用还会把加减按钮一并关闭、值也不再随表单提交

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

### 变体

variant 只改变皮肤使用颜色的方式，加减与键盘行为三档完全一致

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

### 颜色

tone 决定使用哪族颜色，与 variant 正交；这里固定 outline 只查看语气的差别

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

control 仍是必需的输入外壳；加减按钮可以省略，键盘仍按 step 与 largeStep 修改值

```vue
<script setup lang="ts">
import { XhNumberFieldControl, XhNumberFieldInput, XhNumberFieldLabel, XhNumberFieldRoot } from "@xihan-ui/vue";
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
    <XhNumberFieldControl>
      <XhNumberFieldInput style="inline-size: 96px; text-align: center" />
    </XhNumberFieldControl>
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
    <div data-xh-part="control">
      <input data-xh-part="input" style="inline-size: 96px; text-align: center" />
    </div>
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

### 校验态

invalid 由宿主自行判定，不必挂在表单上；标注之后值照常可以修改、加减按钮照常可以按下

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

前后缀图标/文字直接以流式插入 control，减、加按钮统一收在右侧

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

### 自定义换算

parse 把显示串读为数值、format 把数值写回显示串；两个方向必须互逆，否则按一下加号值就会漂移

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

## 设计指引

### 何时使用

- 数量、价格、百分比等需要精确到某一位的数值。
- 需要步进（键盘上下键、加减按钮）。

### 何时不用

- 用户更关心相对位置而非精确值时，使用[滑块](./slider)。
- 值实际是编号或电话（不参与运算）时，使用[文本字段](./text-field)，数字字段的千分位与步进会造成干扰。

### 特性

- `step` 与 `largeStep` 分别对应方向键和 PageUp / PageDown。
- 长按加减按钮连续步进，首次延时与间隔都可调。
- `parse` / `format` 成对，用于接入固定小数位、千分位、货币符号或自定义换算。
- 越界的值在失焦规范化时被夹回区间。
- `prefix` / `suffix` 在框内放置货币符、单位或图标，两段对读屏隐藏。
- `control` 是必需部件，也是输入、前后缀与两个动作共用的唯一视觉盒，投影 Field Chrome 家族（`data-xh-field-chrome`、`data-xh-field-size`、`data-variant`），输入与前后缀分别投影 `data-xh-field-input` 与 `data-xh-field-affix`；默认即 `outline`：`--xh-bg-canvas` 底、`--xh-border-control` 描边、control 圆角、无阴影，不写 `variant` 时 root 与 control 都落 `data-variant="outline"`，悬停与聚焦由整体盒统一反馈，聚焦描边一律 `--xh-border-control-focus`。减、加两颗动作依次收在右侧，走 Action Control 的 `field-inset` ghost 档：正方视觉盒、inset 圆角、在控件里垂直居中，悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）中性底并带 0.97 按压缩放，粗指针命中区由家族伪元素外扩到 44px。
- `subtle` 为中性填充、`ghost` 为透明底，两者在悬停与聚焦时浮出描边；三档都由统一输入壳承担交互反馈。
- comfortable 下 `sm` / `md` / `lg` 控件高为 32 / 36 / 40px；compact 下分别为 28 / 32 / 36px。
  右侧动作区宽度跟随密度档，数字使用等宽字形，前缀、数值和后缀共用中线。
- 粗指针环境不放大视觉盒：控件高与两颗钮的正方盒保持原档，命中区由家族 `::after` 伪元素以钮盒中心外扩到至少 44px，`control` 保持 `overflow: visible` 不裁掉它。热区比钮盒大，相邻两颗钮的热区会彼此重叠并伸进输入区边缘；指针落在重叠处时由排在后面的增钮接收，落在输入区边缘的外扩带时由相邻的那颗钮接收。
- Tab 只停在 `spinbutton` 输入框，聚焦环由整个 `control` 统一绘制；加减按钮退出 Tab 序列，但仍可由指针和公开 API 操作。到达 `min` / `max` 时只禁用对应方向，`disabled` / `readOnly` 才同时锁住两侧。
- 输入与右侧动作组之间使用一条半高、垂直居中的柔和分隔线，画在减钮的背景层上；RTL 下换到另一边。

### 组合

- 外层放[表单字段](./field)；单位与货币符号放进框内前后缀。

### 最佳实践

- 提供 `min` / `max`，让键盘用户按住方向键时有边界。
- 显示格式与提交值分开：显示可以带千分位，提交的是纯数值。
- 自定义加减按钮尺寸时同步检查窄容器与粗指针；两颗钮的视觉盒不能覆盖输入区，也不能彼此相交，粗指针热区的外扩与重叠由家族承担，不必也不应自己再放大钮盒。

### 当前边界

- 默认解析使用严格的 `Number()` 语义，不识别本地化小数分隔符；需要千分位、逗号小数或单位时，显式提供互逆的 `parse` / `format`。组件不推测 locale。
- 空串与非法文本以原串保留，失焦不会改写为另一个数；此时调用步进会从 `min`（有值时）或 `0` 开始。业务校验和错误文案由表单层提供。
- 长按按固定节奏重复：默认先等待 300ms，再每 50ms 步进一次；尚未提供加速曲线。
- 输入使用 `type="text"` 与 `inputmode="decimal"`，组件不接管滚轮，避免页面滚动时意外改值。
- 当前结构是 `control` 内水平排列的可选减号、必需输入与可选加号；不支持脱离 `control` 的三件并排，也不提供上下堆叠动作。

### 反模式

- 加减按钮过小，这是移动端最常见的误触来源。
- 用它输入年份、邮编、身份证号。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-number-field>` |
| Vue 组件 | `XhNumberFieldControl` `XhNumberFieldDecrementTrigger` `XhNumberFieldIncrementTrigger` `XhNumberFieldInput` `XhNumberFieldLabel` `XhNumberFieldPrefix` `XhNumberFieldRoot` `XhNumberFieldSuffix` |
| 组合式函数 | `useNumberField` |
| 状态机 | `numberFieldMachine` |
| 皮肤 | `@xihan-ui/styles/number-field.css` |

### Props

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
| `name` | `string` |  | 表单字段名；提供后才参与提交。 |
| `changeDelay` | `number` |  | 按住加减按钮多久开始连发，默认 300ms。 |
| `changeInterval` | `number` |  | 连发间隔，默认 50ms。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定底色与描边的绘制方式。默认 outline。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦强调使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定输入框与加减按钮的几何档位。 |
| `parse` | `(text: string) => number` |  | 显示串 → 数。默认按 `Number()` 读取（'12abc' 判为非法），提供后替换为它： 千位分隔符、单位后缀、百分号等都依靠它读回。无法读出数时返回 `NaN`。 与 `format` 必须互逆：`format` 输出的串要能被 `parse` 读回同一个数， 否则按一次加号值会漂移。 |
| `format` | `(value: number) => string` |  | 数 → 显示串。默认 `String(n)`。只在组件自行改写显示时使用：步进、取端点、 失焦规范化三处；用户正在输入时一律不触碰，否则光标会被打断。 |
| `onValueChange` | `(details: NumberFieldValueChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `NumberFieldValueChangeDetails` | 值变化；detail 为 `{ value: string, valueAsNumber: number }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhNumberFieldRoot` | `default` | `NumberFieldRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhNumberFieldRoot` | `children` | `SlotChildren<NumberFieldRootSlotProps>` |  |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle` · `spinning`

**事件**：`VALUE.SET` · `VALUE.STEP` · `VALUE.TO_MIN` · `VALUE.TO_MAX` · `INPUT.BLUR` · `PRESS.START` · `PRESS.END` · `after.changeInterval` · `FORM.RESET` · `TRIGGER.PRESS.START` · `TRIGGER.PRESS.END`

**判据**：`canStep` · `canPressTrigger`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

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
| `getControlProps` | `() => T['element']` | 必需的唯一输入壳：皮肤把视觉盒绘制在它身上，输入在左，减、加动作依次收在右侧。 |
| `getPrefixProps` | `() => T['element']` | 输入框前的装饰段（货币符、单位、图标）；对读屏隐藏，不参与名字链。 |
| `getInputProps` | `() => T['input']` |  |
| `getSuffixProps` | `() => T['element']` | 输入框后的装饰段；对读屏隐藏，不参与名字链。 |
| `getIncrementTriggerProps` | `() => T['button']` |  |
| `getDecrementTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowUp` | focus in input, not disabled/readOnly | 按 step 递增，越界则停在 max |
| `ArrowDown` | focus in input, not disabled/readOnly | 按 step 递减，越界则停在 min |
| `PageUp` | focus in input, not disabled/readOnly | 按 largeStep 递增（默认 10 倍 step） |
| `PageDown` | focus in input, not disabled/readOnly | 按 largeStep 递减 |
| `Home` | focus in input, 指定了 min | 取 min；未指定 min 时不动 |
| `End` | focus in input, 指定了 max | 取 max；未指定 max 时不动 |
| `Enter` / `Space` | held in increment-trigger / decrement-trigger, not disabled/readOnly, 该侧未贴住端点 | 按住期间这颗钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，值贴到端点后按钮转 disabled 一并撤下。步进仍由激活时的 click 走一步，按住不连发。两颗钮不占 Tab 位，键盘这一路只在焦点落到它身上时有面 |

### ARIA

以下属性由 `connect` 生成。

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
| `increment-trigger` | `aria-hidden` | 'true' |
| `decrement-trigger` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/number-field.css` 使用 `[data-scope="number-field"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

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
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `prefix` | `data-disabled` | ''（条件成立时才出现） |
| `prefix` | `data-xh-field-affix` | 'prefix' |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-readonly` | ''（条件成立时才出现） |
| `input` | `data-xh-field-input` | '' |
| `input` | `data-xh-field-layout` | 'single-line' |
| `suffix` | `data-disabled` | ''（条件成立时才出现） |
| `suffix` | `data-xh-field-affix` | 'suffix' |
| `increment-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `increment-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `increment-trigger` | `data-xh-action-control` | '' |
| `increment-trigger` | `data-xh-action-display` | 'always' |
| `increment-trigger` | `data-xh-action-profile` | 'field-inset' |
| `increment-trigger` | `data-xh-action-size` | props.size |
| `increment-trigger` | `data-xh-action-variant` | 'ghost' |
| `decrement-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `decrement-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `decrement-trigger` | `data-xh-action-control` | '' |
| `decrement-trigger` | `data-xh-action-display` | 'always' |
| `decrement-trigger` | `data-xh-action-profile` | 'field-inset' |
| `decrement-trigger` | `data-xh-action-size` | props.size |
| `decrement-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-number-field-affix-fg` | `prefix`<br>`suffix` | `color` | `xh-field-affix` | `--xh-fg-muted` | number-field 的 prefix、suffix 部件 color 覆盖槽。 |
| `--xh-number-field-affix-fg-disabled` | `prefix`<br>`suffix` | `color` | `disabled`<br>`xh-field-affix` | `--xh-fg-disabled` | number-field 的 prefix、suffix 部件 color 覆盖槽。 |
| `--xh-number-field-affix-font-size` | `prefix`<br>`suffix` | `font-size` | `xh-field-affix` | `--xh-_number-field-font-size` | number-field 的 prefix、suffix 部件 font-size 覆盖槽。 |
| `--xh-number-field-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` | number-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-number-field-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` | number-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-number-field-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` | number-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-number-field-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` | number-field 的 control 部件 background-color 覆盖槽。 |
| `--xh-number-field-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` | number-field 的 control 部件 border 覆盖槽。 |
| `--xh-number-field-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` | number-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-number-field-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` | number-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-number-field-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` | number-field 的 control 部件 border-color 覆盖槽。 |
| `--xh-number-field-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` | number-field 的 control 部件 color 覆盖槽。 |
| `--xh-number-field-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_number-field-gap` | number-field 的 control 部件 gap 覆盖槽。 |
| `--xh-number-field-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_number-field-h` | number-field 的 control 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-number-field-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` | number-field 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-number-field-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `0` | number-field 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-number-field-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` | number-field 的 control 部件 border-radius 覆盖槽。 |
| `--xh-number-field-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` | number-field 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-number-field-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` | number-field 的 root 部件 inline-size、min-inline-size 覆盖槽。 |
| `--xh-number-field-gap` | `root` | `gap` | `default` | `--xh-space-1` | number-field 的 root 部件 gap 覆盖槽。 |
| `--xh-number-field-icon-size` | `control`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | number-field 的 control、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-number-field-input-align` | `control`<br>`input` | `text-align` | `default` | `center` | number-field 的 control、input 部件 text-align 覆盖槽。 |
| `--xh-number-field-input-autofill-bg` | `control`<br>`input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-bg-canvas` | number-field 的 control、input 部件 box-shadow 覆盖槽。 |
| `--xh-number-field-input-autofill-fg` | `control`<br>`input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-fg-default` | number-field 的 control、input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-number-field-input-fg` | `control`<br>`input` | `color` | `xh-field-input` | `--xh-fg-default` | number-field 的 control、input 部件 color 覆盖槽。 |
| `--xh-number-field-input-font-size` | `control`<br>`input` | `font-size` | `xh-field-input` | `--xh-_number-field-font-size` | number-field 的 control、input 部件 font-size 覆盖槽。 |
| `--xh-number-field-input-px` | `control`<br>`input` | `padding-inline` | `default` | `--xh-_number-field-px` | number-field 的 control、input 部件 padding-inline 覆盖槽。 |
| `--xh-number-field-input-w` | `control`<br>`input` | `inline-size` | `default` | `5em` | number-field 的 control、input 部件 inline-size 覆盖槽。 |
| `--xh-number-field-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | number-field 的 label 部件 color 覆盖槽。 |
| `--xh-number-field-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | number-field 的 label 部件 color 覆盖槽。 |
| `--xh-number-field-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | number-field 的 label 部件 font-size 覆盖槽。 |
| `--xh-number-field-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | number-field 的 label 部件 font-weight 覆盖槽。 |
| `--xh-number-field-placeholder-fg` | `control`<br>`input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` | number-field 的 control、input 部件 color 覆盖槽。 |
| `--xh-number-field-trigger-bg-active` | `control`<br>`decrement-trigger`<br>`increment-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | number-field 的 control、decrement-trigger、increment-trigger 部件 background-color 覆盖槽。 |
| `--xh-number-field-trigger-divider` | `control`<br>`decrement-trigger` | `background-image` | `has([data-part='input'])` | `--xh-material-soft-separator` | number-field 的 control、decrement-trigger 部件 background-image 覆盖槽。 |
| `--xh-number-field-trigger-divider-h` | `control`<br>`decrement-trigger` | `background-size` | `has([data-part='input'])` | `--xh-_number-field-divider-h` | number-field 的 control、decrement-trigger 部件 background-size 覆盖槽。 |
| `--xh-number-field-trigger-fg` | `control`<br>`decrement-trigger`<br>`increment-trigger` | `color` | `default` | `--xh-fg-default` | number-field 的 control、decrement-trigger、increment-trigger 部件 color 覆盖槽。 |
| `--xh-number-field-trigger-fg-hover` | `control`<br>`decrement-trigger`<br>`increment-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` | number-field 的 control、decrement-trigger、increment-trigger 部件 color 覆盖槽。 |
| `--xh-number-field-trigger-font-size` | `control`<br>`decrement-trigger`<br>`increment-trigger` | `font-size` | `default` | `--xh-_number-field-trigger-font-size` | number-field 的 control、decrement-trigger、increment-trigger 部件 font-size 覆盖槽。 |
| `--xh-number-field-trigger-radius` | `control`<br>`decrement-trigger`<br>`increment-trigger` | `border-radius` | `default` | `--xh-shape-inset` | number-field 的 control、decrement-trigger、increment-trigger 部件 border-radius 覆盖槽。 |
| `--xh-number-field-trigger-size` | `control`<br>`decrement-trigger`<br>`increment-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` | number-field 的 control、decrement-trigger、increment-trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
