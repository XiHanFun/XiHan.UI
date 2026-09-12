来源：https://ui.docs.xihanfun.com/components/select

# Select `选择器`

从一份已知清单里选一个或多个值，选项收在浮层里。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/select" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/select.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/select" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/select" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/select.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

选中值恒是数组，条目按 value 标识身份；禁用的条目方向键会跳过

```vue
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const fruit = ref<string[]>([]);
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "blueberry", label: "蓝莓" },
  { value: "cherry", label: "樱桃（缺货）", disabled: true },
  { value: "durian", label: "榴莲" },
];
</script>

<template>
  <XhSelectRoot v-model:value="fruit" :collection="fruits" label="水果" placeholder="请选择" />
  <p>当前值：{{ fruit.length ? fruit.join("、") : "（未选）" }}</p>
</template>
```

```html
<xh-select id="select-basic" placeholder="请选择">
  <div data-xh-part="root">
    <span data-xh-part="label">水果</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="apple">
            <span data-xh-part="item-text">苹果</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="banana">
            <span data-xh-part="item-text">香蕉</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="blueberry">
            <span data-xh-part="item-text">蓝莓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="cherry" aria-disabled="true">
            <span data-xh-part="item-text">樱桃（缺货）</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="durian">
            <span data-xh-part="item-text">榴莲</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>
<p>当前值：<span id="select-basic-value">（未选）</span></p>

<script type="module">
  // 选中值回显在下面那行文字里
  const select = document.getElementById("select-basic");
  const readout = document.getElementById("select-basic-value");
  select.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value.join("、") || "（未选）";
  });
</script>
```

## 示例

### 多选

multiple 下点中即在集合里增删该项、浮层不收起，触发器上的文本把选中项连起来

```vue
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const picked = ref<string[]>(["apple"]);
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "blueberry", label: "蓝莓" },
  { value: "durian", label: "榴莲" },
];
</script>

<template>
  <XhSelectRoot
    v-model:value="picked"
    :collection="fruits"
    multiple
    label="水果（多选）"
    placeholder="请选择"
  />
  <p>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-select
  id="select-multiple"
  multiple
  default-value="apple"
  placeholder="请选择"
>
  <div data-xh-part="root">
    <span data-xh-part="label">水果（多选）</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="apple">
            <span data-xh-part="item-text">苹果</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="banana">
            <span data-xh-part="item-text">香蕉</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="blueberry">
            <span data-xh-part="item-text">蓝莓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="durian">
            <span data-xh-part="item-text">榴莲</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>
<p>已选：<span id="select-multiple-value">apple</span></p>

<script type="module">
  // 选中集合回显在下面那行文字里
  const select = document.getElementById("select-multiple");
  const readout = document.getElementById("select-multiple-value");
  select.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 受控

传了 value 就由宿主说了算：组件只发 value-change，宿主写回它才变，这里把樱桃挡在门外

```vue
<script setup lang="ts">
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string[]>(["banana"]);
const rejected = ref(false);
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃（选不中）" },
];

// 只有通过校验的值才写回，未写回则界面停在原值
function onValueChange(details: { value: string[] }) {
  rejected.value = details.value.includes("cherry");
  if (!rejected.value)
    value.value = details.value;
}
</script>

<template>
  <XhSelectRoot :value="value" placeholder="请选择" @value-change="onValueChange">
    <XhSelectLabel>水果</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger>
        <XhSelectValueText />
        <XhSelectIndicator />
      </XhSelectTrigger>
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <XhSelectItem v-for="f in fruits" :key="f.value" :value="f.value">
            <XhSelectItemText>{{ f.label }}</XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
  <p>宿主持有的值：{{ value.join("、") }}{{ rejected ? " · 上一次选择被拒绝" : "" }}</p>
</template>
```

```html
<xh-select id="select-controlled" value="banana" placeholder="请选择">
  <div data-xh-part="root">
    <span data-xh-part="label">水果</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="apple">
            <span data-xh-part="item-text">苹果</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="banana">
            <span data-xh-part="item-text">香蕉</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="cherry">
            <span data-xh-part="item-text">樱桃（选不中）</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>
<p>宿主持有的值：<span id="select-controlled-value">banana</span></p>

<script type="module">
  // 只有通过校验的值才写回，未写回则界面停在原值
  const select = document.getElementById("select-controlled");
  const readout = document.getElementById("select-controlled-value");
  let value = ["banana"];

  select.addEventListener("value-change", (event) => {
    const rejected = event.detail.value.includes("cherry");
    if (!rejected) {
      value = event.detail.value;
      select.value = value;
    }
    readout.textContent = value.join("、") + (rejected ? " · 上一次选择被拒绝" : "");
  });
</script>
```

### 禁用

根部件的 disabled 把触发器转成原生 disabled，浮层展不开、也不占 Tab 位

```vue
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
];
</script>

<template>
  <XhSelectRoot
    :collection="fruits"
    :default-value="['apple']"
    disabled
    label="水果"
    placeholder="请选择"
  />
</template>
```

```html
<xh-select disabled default-value="apple" placeholder="请选择">
  <div data-xh-part="root">
    <span data-xh-part="label">水果</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="apple">
            <span data-xh-part="item-text">苹果</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="banana">
            <span data-xh-part="item-text">香蕉</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>
```

### 形态

variant 只改盒的颜色槽位，浮层与键盘行为三档一致

```vue
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhSelectRoot
      v-for="v in variants"
      :key="v"
      :variant="v"
      :collection="fruits"
      :default-value="['apple']"
      :label="v"
      placeholder="请选择"
    />
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-select variant="outline" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">outline</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="apple">
              <span data-xh-part="item-text">苹果</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="banana">
              <span data-xh-part="item-text">香蕉</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="cherry">
              <span data-xh-part="item-text">樱桃</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>

  <xh-select variant="subtle" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">subtle</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="apple">
              <span data-xh-part="item-text">苹果</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="banana">
              <span data-xh-part="item-text">香蕉</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="cherry">
              <span data-xh-part="item-text">樱桃</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>

  <xh-select variant="ghost" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">ghost</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="apple">
              <span data-xh-part="item-text">苹果</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="banana">
              <span data-xh-part="item-text">香蕉</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="cherry">
              <span data-xh-part="item-text">樱桃</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>
</div>
```

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 outline 只看语气的差别

```vue
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhSelectRoot
      v-for="t in tones"
      :key="t"
      variant="outline"
      :tone="t"
      :collection="fruits"
      :default-value="['apple']"
      :label="t"
      placeholder="请选择"
    />
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-select variant="outline" tone="brand" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">brand</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="apple">
              <span data-xh-part="item-text">苹果</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="banana">
              <span data-xh-part="item-text">香蕉</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="cherry">
              <span data-xh-part="item-text">樱桃</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>

  <xh-select variant="outline" tone="neutral" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">neutral</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="apple">
              <span data-xh-part="item-text">苹果</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="banana">
              <span data-xh-part="item-text">香蕉</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="cherry">
              <span data-xh-part="item-text">樱桃</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>

  <xh-select variant="outline" tone="success" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">success</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="apple">
              <span data-xh-part="item-text">苹果</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="banana">
              <span data-xh-part="item-text">香蕉</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="cherry">
              <span data-xh-part="item-text">樱桃</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>

  <xh-select variant="outline" tone="warning" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">warning</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="apple">
              <span data-xh-part="item-text">苹果</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="banana">
              <span data-xh-part="item-text">香蕉</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="cherry">
              <span data-xh-part="item-text">樱桃</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>

  <xh-select variant="outline" tone="danger" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">danger</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="apple">
              <span data-xh-part="item-text">苹果</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="banana">
              <span data-xh-part="item-text">香蕉</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="cherry">
              <span data-xh-part="item-text">樱桃</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>

  <xh-select variant="outline" tone="info" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">info</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="apple">
              <span data-xh-part="item-text">苹果</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="banana">
              <span data-xh-part="item-text">香蕉</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="cherry">
              <span data-xh-part="item-text">樱桃</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>
</div>
```

### 尺寸

盒与浮层条目一起换档，不传 size 即默认档

```vue
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px">
    <XhSelectRoot
      v-for="s in sizes"
      :key="s.label"
      :size="s.size"
      :collection="fruits"
      :default-value="['apple']"
      :label="s.label"
      placeholder="请选择"
    />
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px">
  <xh-select size="sm" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">小</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="apple">
              <span data-xh-part="item-text">苹果</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="banana">
              <span data-xh-part="item-text">香蕉</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="cherry">
              <span data-xh-part="item-text">樱桃</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>

  <xh-select default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">默认</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="apple">
              <span data-xh-part="item-text">苹果</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="banana">
              <span data-xh-part="item-text">香蕉</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="cherry">
              <span data-xh-part="item-text">樱桃</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>

  <xh-select size="lg" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">大</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="apple">
              <span data-xh-part="item-text">苹果</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="banana">
              <span data-xh-part="item-text">香蕉</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="cherry">
              <span data-xh-part="item-text">樱桃</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>
</div>
```

### 异步加载选项

首次展开才去取数据：open-change 报出展开意图，数据到达前使用正式加载状态

```vue
<script setup lang="ts">
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectLoading,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

interface Song {
  value: string;
  label: string;
}

const value = ref<string[]>([]);
const songs = ref<Song[]>([]);
const loading = ref(false);
let requested = false;

// 展开一次即发起请求，拿到数据后不再重复取
function onOpenChange(details: { open: boolean }): void {
  if (!details.open || requested)
    return;
  requested = true;
  loading.value = true;
  window.setTimeout(() => {
    songs.value = [
      { value: "song1", label: "起风了" },
      { value: "song2", label: "夜空中最亮的星" },
      { value: "song3", label: "海阔天空" },
      { value: "song4", label: "晴天" },
    ];
    loading.value = false;
  }, 800);
}
</script>

<template>
  <XhSelectRoot v-model:value="value" :loading="loading" placeholder="请选择" @open-change="onOpenChange">
    <XhSelectLabel>曲目</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger>
        <XhSelectValueText />
        <XhSelectIndicator />
      </XhSelectTrigger>
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <XhSelectItem v-for="s in songs" :key="s.value" :value="s.value">
            <XhSelectItemText>{{ s.label }}</XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
        <XhSelectLoading>加载中…</XhSelectLoading>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
  <p>当前值：{{ value[0] ?? "（未选）" }}</p>
</template>
```

```html
<xh-select id="select-async" placeholder="请选择">
  <div data-xh-part="root">
    <span data-xh-part="label">曲目</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list"></div>
        <div data-xh-part="loading">加载中…</div>
      </div>
    </div>
  </div>
</xh-select>
<p>当前值：<span id="select-async-value">（未选）</span></p>

<script type="module">
  const select = document.getElementById("select-async");
  const list = select.querySelector('[data-xh-part="list"]');
  const readout = document.getElementById("select-async-value");
  const songs = [
    ["song1", "起风了"],
    ["song2", "夜空中最亮的星"],
    ["song3", "海阔天空"],
    ["song4", "晴天"],
  ];
  let requested = false;

  // 展开一次即发起请求，拿到数据后不再重复取
  select.addEventListener("open-change", (event) => {
    if (!event.detail.open || requested) return;
    requested = true;
    select.loading = true;
    window.setTimeout(() => {
      list.replaceChildren(
        ...songs.map(([value, label]) => {
          const item = document.createElement("div");
          item.dataset.xhPart = "item";
          item.setAttribute("value", value);
          const text = document.createElement("span");
          text.dataset.xhPart = "item-text";
          text.textContent = label;
          const indicator = document.createElement("span");
          indicator.dataset.xhPart = "item-indicator";
          item.append(text, indicator);
          return item;
        }),
      );
      select.loading = false;
    }, 800);
  });

  select.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
</script>
```

### 宽度

盒与浮层各有自己的宽度槽位，写在根部件上即可；装不下的文本在行内以省略号收口

```vue
<script setup lang="ts">
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";

const plans = [
  { value: "basic", label: "基础版" },
  { value: "pro", label: "专业版" },
  { value: "long", label: "旗舰版 · 含无限席位与专属客户成功经理的年度合约" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhSelectRoot :default-value="['long']" placeholder="请选择">
      <XhSelectLabel>缺省宽度</XhSelectLabel>
      <XhSelectControl>
        <XhSelectTrigger>
          <XhSelectValueText />
          <XhSelectIndicator />
        </XhSelectTrigger>
      </XhSelectControl>
      <XhSelectPositioner>
        <XhSelectContent>
          <XhSelectList>
            <XhSelectItem v-for="p in plans" :key="p.value" :value="p.value">
              <XhSelectItemText>{{ p.label }}</XhSelectItemText>
              <XhSelectItemIndicator />
            </XhSelectItem>
          </XhSelectList>
        </XhSelectContent>
      </XhSelectPositioner>
    </XhSelectRoot>

    <XhSelectRoot
      :default-value="['long']"
      placeholder="请选择"
      style="--xh-select-control-min-w: 15rem; --xh-select-content-min-w: 22rem"
    >
      <XhSelectLabel>加宽</XhSelectLabel>
      <XhSelectControl>
        <XhSelectTrigger>
          <XhSelectValueText />
          <XhSelectIndicator />
        </XhSelectTrigger>
      </XhSelectControl>
      <XhSelectPositioner>
        <XhSelectContent>
          <XhSelectList>
            <XhSelectItem v-for="p in plans" :key="p.value" :value="p.value">
              <XhSelectItemText>{{ p.label }}</XhSelectItemText>
              <XhSelectItemIndicator />
            </XhSelectItem>
          </XhSelectList>
        </XhSelectContent>
      </XhSelectPositioner>
    </XhSelectRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-select default-value="long" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">缺省宽度</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="basic">
              <span data-xh-part="item-text">基础版</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="pro">
              <span data-xh-part="item-text">专业版</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="long">
              <span data-xh-part="item-text">
                旗舰版 · 含无限席位与专属客户成功经理的年度合约
              </span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>

  <xh-select default-value="long" placeholder="请选择">
    <div
      data-xh-part="root"
      style="--xh-select-control-min-w: 15rem; --xh-select-content-min-w: 22rem"
    >
      <span data-xh-part="label">加宽</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="basic">
              <span data-xh-part="item-text">基础版</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="pro">
              <span data-xh-part="item-text">专业版</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="long">
              <span data-xh-part="item-text">
                旗舰版 · 含无限席位与专属客户成功经理的年度合约
              </span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>
</div>
```

### 选项里的自定义内容

条目与触发器显示的内容都由你写：想写什么写什么，选中与键盘行为不变

```vue
<script setup lang="ts">
import {
  XhAvatarFallback,
  XhAvatarImage,
  XhAvatarRoot,
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const members = [
  { value: "liuyi", name: "刘一", initial: "刘", team: "设计组" },
  { value: "chener", name: "陈二", initial: "陈", team: "前端组" },
  { value: "zhangsan", name: "张三", initial: "张", team: "服务端组" },
];

const picked = ref<string[]>(["liuyi"]);
const current = computed(() => members.find(m => m.value === picked.value[0]) ?? null);
</script>

<template>
  <XhSelectRoot v-model:value="picked" placeholder="请选择成员">
    <XhSelectLabel>负责人</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger>
        <XhSelectValueText>
          <span v-if="current" style="display: inline-flex; align-items: center; gap: 8px">
            <XhAvatarRoot size="sm">
              <XhAvatarImage />
              <XhAvatarFallback>{{ current.initial }}</XhAvatarFallback>
            </XhAvatarRoot>
            {{ current.name }}
          </span>
          <span v-else>请选择成员</span>
        </XhSelectValueText>
        <XhSelectIndicator />
      </XhSelectTrigger>
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <XhSelectItem v-for="m in members" :key="m.value" :value="m.value">
            <XhSelectItemText>
              <span style="display: inline-flex; align-items: center; gap: 8px">
                <XhAvatarRoot size="sm">
                  <XhAvatarImage />
                  <XhAvatarFallback>{{ m.initial }}</XhAvatarFallback>
                </XhAvatarRoot>
                <span>
                  {{ m.name }}
                  <span style="color: var(--xh-fg-muted); font-size: 12px">{{ m.team }}</span>
                </span>
              </span>
            </XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
</template>
```

```html
<xh-select id="select-custom" default-value="liuyi" placeholder="请选择成员">
  <div data-xh-part="root">
    <span data-xh-part="label">负责人</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text">
          <span style="display: inline-flex; align-items: center; gap: 8px">
            <xh-avatar size="sm">
              <span data-xh-part="fallback" id="select-custom-initial">刘</span>
            </xh-avatar>
            <span id="select-custom-name">刘一</span>
          </span>
        </span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="liuyi">
            <span data-xh-part="item-text">
              <span style="display: inline-flex; align-items: center; gap: 8px">
                <xh-avatar size="sm">
                  <span data-xh-part="fallback">刘</span>
                </xh-avatar>
                <span>
                  刘一
                  <span style="color: var(--xh-fg-muted); font-size: 12px">设计组</span>
                </span>
              </span>
            </span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="chener">
            <span data-xh-part="item-text">
              <span style="display: inline-flex; align-items: center; gap: 8px">
                <xh-avatar size="sm">
                  <span data-xh-part="fallback">陈</span>
                </xh-avatar>
                <span>
                  陈二
                  <span style="color: var(--xh-fg-muted); font-size: 12px">前端组</span>
                </span>
              </span>
            </span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="zhangsan">
            <span data-xh-part="item-text">
              <span style="display: inline-flex; align-items: center; gap: 8px">
                <xh-avatar size="sm">
                  <span data-xh-part="fallback">张</span>
                </xh-avatar>
                <span>
                  张三
                  <span style="color: var(--xh-fg-muted); font-size: 12px">服务端组</span>
                </span>
              </span>
            </span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>

<script type="module">
  // 触发器里的头像与姓名跟着选中值走；value-text 里作者写了内容就归作者，元素不再改写
  const select = document.getElementById("select-custom");
  const initial = document.getElementById("select-custom-initial");
  const name = document.getElementById("select-custom-name");
  const members = {
    liuyi: ["刘", "刘一"],
    chener: ["陈", "陈二"],
    zhangsan: ["张", "张三"],
  };

  select.addEventListener("value-change", (event) => {
    const [mark, label] = members[event.detail.value[0]] ?? ["", "请选择成员"];
    initial.textContent = mark;
    name.textContent = label;
  });
</script>
```

### 插槽里的操作入口

根部件把 open、value 与 setOpen、setValue 交给插槽，浮层之外的按钮据此展开或清空

```vue
<script setup lang="ts">
import {
  XhButton,
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const picked = ref<string[]>([]);
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];
</script>

<template>
  <XhSelectRoot
    v-slot="{ open, value, setOpen, setValue }"
    v-model:value="picked"
    placeholder="请选择"
  >
    <XhSelectLabel>水果</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger>
        <XhSelectValueText />
        <XhSelectIndicator />
      </XhSelectTrigger>
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <XhSelectItem v-for="f in fruits" :key="f.value" :value="f.value">
            <XhSelectItemText>{{ f.label }}</XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
    <div style="display: flex; gap: 8px; margin-block-start: 8px">
      <XhButton variant="outline" size="sm" @click="setOpen(!open)">
        {{ open ? "收起" : "展开" }}
      </XhButton>
      <XhButton variant="ghost" size="sm" :disabled="value.length === 0" @click="setValue([])">
        清空
      </XhButton>
    </div>
  </XhSelectRoot>
  <p>当前值：{{ picked[0] ?? "（未选）" }}</p>
</template>
```

```html
<xh-select id="select-actions" open="false" placeholder="请选择">
  <div data-xh-part="root">
    <span data-xh-part="label">水果</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="apple">
            <span data-xh-part="item-text">苹果</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="banana">
            <span data-xh-part="item-text">香蕉</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="cherry">
            <span data-xh-part="item-text">樱桃</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
    <!-- 浮层之外的两颗按钮：读元素上的 open 与 value，写回去就是 setOpen / setValue -->
    <div style="display: flex; gap: 8px; margin-block-start: 8px">
      <xh-button variant="outline" size="sm" id="select-actions-toggle">
        <button data-xh-part="root">展开</button>
      </xh-button>
      <xh-button variant="ghost" size="sm" id="select-actions-clear" disabled>
        <button data-xh-part="root">清空</button>
      </xh-button>
    </div>
  </div>
</xh-select>
<p>当前值：<span id="select-actions-value">（未选）</span></p>

<script type="module">
  const select = document.getElementById("select-actions");
  const toggle = document.getElementById("select-actions-toggle");
  const toggleLabel = toggle.querySelector('[data-xh-part="root"]');
  const clear = document.getElementById("select-actions-clear");
  const readout = document.getElementById("select-actions-value");

  let open = false;
  let value = [];

  // 开合与选中都握在宿主这一侧，元素只发意图
  function apply() {
    select.open = open;
    select.value = value;
    toggleLabel.textContent = open ? "收起" : "展开";
    clear.disabled = value.length === 0;
    readout.textContent = value[0] ?? "（未选）";
  }

  select.addEventListener("open-change", (event) => {
    open = event.detail.open;
    apply();
  });
  select.addEventListener("value-change", (event) => {
    value = event.detail.value;
    apply();
  });

  toggle.addEventListener("click", () => {
    open = !open;
    apply();
  });
  clear.addEventListener("click", () => {
    value = [];
    apply();
  });

  apply();
</script>
```

### 大量选项

浮层高度封顶后自行滚动；敲首字母连打检索直接跳到该字母开头的条目，方向键照常可用

```vue
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// 26 个字母各四条，首字母连打即可在段间跳转
const options = Array.from({ length: 104 }, (_, i) => {
  const letter = letters[i % 26];
  const seq = Math.floor(i / 26) + 1;
  return { value: `${letter}${seq}`, label: `${letter} 区 ${seq} 号仓` };
});

const picked = ref<string[]>([]);
</script>

<template>
  <XhSelectRoot
    v-model:value="picked"
    :collection="options"
    label="仓位"
    placeholder="敲 M 试试"
  />
  <p>当前值：{{ picked[0] ?? "（未选）" }}</p>
</template>
```

```html
<xh-select id="select-many" placeholder="敲 M 试试">
  <div data-xh-part="root">
    <span data-xh-part="label">仓位</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="A1">
            <span data-xh-part="item-text">A 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="B1">
            <span data-xh-part="item-text">B 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="C1">
            <span data-xh-part="item-text">C 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="D1">
            <span data-xh-part="item-text">D 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="E1">
            <span data-xh-part="item-text">E 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="F1">
            <span data-xh-part="item-text">F 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="G1">
            <span data-xh-part="item-text">G 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="H1">
            <span data-xh-part="item-text">H 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="I1">
            <span data-xh-part="item-text">I 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="J1">
            <span data-xh-part="item-text">J 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="K1">
            <span data-xh-part="item-text">K 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="L1">
            <span data-xh-part="item-text">L 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="M1">
            <span data-xh-part="item-text">M 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="N1">
            <span data-xh-part="item-text">N 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="O1">
            <span data-xh-part="item-text">O 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="P1">
            <span data-xh-part="item-text">P 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="Q1">
            <span data-xh-part="item-text">Q 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="R1">
            <span data-xh-part="item-text">R 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="S1">
            <span data-xh-part="item-text">S 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="T1">
            <span data-xh-part="item-text">T 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="U1">
            <span data-xh-part="item-text">U 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="V1">
            <span data-xh-part="item-text">V 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="W1">
            <span data-xh-part="item-text">W 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="X1">
            <span data-xh-part="item-text">X 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="Y1">
            <span data-xh-part="item-text">Y 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="Z1">
            <span data-xh-part="item-text">Z 区 1 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="A2">
            <span data-xh-part="item-text">A 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="B2">
            <span data-xh-part="item-text">B 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="C2">
            <span data-xh-part="item-text">C 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="D2">
            <span data-xh-part="item-text">D 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="E2">
            <span data-xh-part="item-text">E 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="F2">
            <span data-xh-part="item-text">F 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="G2">
            <span data-xh-part="item-text">G 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="H2">
            <span data-xh-part="item-text">H 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="I2">
            <span data-xh-part="item-text">I 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="J2">
            <span data-xh-part="item-text">J 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="K2">
            <span data-xh-part="item-text">K 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="L2">
            <span data-xh-part="item-text">L 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="M2">
            <span data-xh-part="item-text">M 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="N2">
            <span data-xh-part="item-text">N 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="O2">
            <span data-xh-part="item-text">O 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="P2">
            <span data-xh-part="item-text">P 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="Q2">
            <span data-xh-part="item-text">Q 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="R2">
            <span data-xh-part="item-text">R 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="S2">
            <span data-xh-part="item-text">S 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="T2">
            <span data-xh-part="item-text">T 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="U2">
            <span data-xh-part="item-text">U 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="V2">
            <span data-xh-part="item-text">V 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="W2">
            <span data-xh-part="item-text">W 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="X2">
            <span data-xh-part="item-text">X 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="Y2">
            <span data-xh-part="item-text">Y 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="Z2">
            <span data-xh-part="item-text">Z 区 2 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="A3">
            <span data-xh-part="item-text">A 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="B3">
            <span data-xh-part="item-text">B 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="C3">
            <span data-xh-part="item-text">C 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="D3">
            <span data-xh-part="item-text">D 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="E3">
            <span data-xh-part="item-text">E 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="F3">
            <span data-xh-part="item-text">F 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="G3">
            <span data-xh-part="item-text">G 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="H3">
            <span data-xh-part="item-text">H 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="I3">
            <span data-xh-part="item-text">I 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="J3">
            <span data-xh-part="item-text">J 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="K3">
            <span data-xh-part="item-text">K 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="L3">
            <span data-xh-part="item-text">L 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="M3">
            <span data-xh-part="item-text">M 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="N3">
            <span data-xh-part="item-text">N 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="O3">
            <span data-xh-part="item-text">O 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="P3">
            <span data-xh-part="item-text">P 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="Q3">
            <span data-xh-part="item-text">Q 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="R3">
            <span data-xh-part="item-text">R 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="S3">
            <span data-xh-part="item-text">S 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="T3">
            <span data-xh-part="item-text">T 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="U3">
            <span data-xh-part="item-text">U 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="V3">
            <span data-xh-part="item-text">V 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="W3">
            <span data-xh-part="item-text">W 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="X3">
            <span data-xh-part="item-text">X 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="Y3">
            <span data-xh-part="item-text">Y 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="Z3">
            <span data-xh-part="item-text">Z 区 3 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="A4">
            <span data-xh-part="item-text">A 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="B4">
            <span data-xh-part="item-text">B 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="C4">
            <span data-xh-part="item-text">C 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="D4">
            <span data-xh-part="item-text">D 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="E4">
            <span data-xh-part="item-text">E 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="F4">
            <span data-xh-part="item-text">F 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="G4">
            <span data-xh-part="item-text">G 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="H4">
            <span data-xh-part="item-text">H 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="I4">
            <span data-xh-part="item-text">I 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="J4">
            <span data-xh-part="item-text">J 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="K4">
            <span data-xh-part="item-text">K 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="L4">
            <span data-xh-part="item-text">L 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="M4">
            <span data-xh-part="item-text">M 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="N4">
            <span data-xh-part="item-text">N 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="O4">
            <span data-xh-part="item-text">O 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="P4">
            <span data-xh-part="item-text">P 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="Q4">
            <span data-xh-part="item-text">Q 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="R4">
            <span data-xh-part="item-text">R 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="S4">
            <span data-xh-part="item-text">S 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="T4">
            <span data-xh-part="item-text">T 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="U4">
            <span data-xh-part="item-text">U 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="V4">
            <span data-xh-part="item-text">V 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="W4">
            <span data-xh-part="item-text">W 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="X4">
            <span data-xh-part="item-text">X 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="Y4">
            <span data-xh-part="item-text">Y 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="Z4">
            <span data-xh-part="item-text">Z 区 4 号仓</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>
<p>当前值：<span id="select-many-value">（未选）</span></p>

<script type="module">
  // 选中值回显在下面那行文字里
  const select = document.getElementById("select-many");
  const readout = document.getElementById("select-many-value");
  select.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
</script>
```

### 分组

条目分段展示：group 是 role=group 的段落壳，group-label 是它的可及名字；条目照旧归到同一份集合，方向键与连打检索跨段贯通

```vue
<script setup lang="ts">
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectGroup,
  XhSelectGroupLabel,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const groups = [
  {
    id: "fruit",
    label: "水果",
    items: [
      { value: "apple", label: "苹果" },
      { value: "banana", label: "香蕉" },
    ],
  },
  {
    id: "vegetable",
    label: "蔬菜",
    items: [
      { value: "carrot", label: "胡萝卜" },
      { value: "celery", label: "芹菜" },
    ],
  },
];

const picked = ref<string[]>([]);
</script>

<template>
  <XhSelectRoot v-model:value="picked" placeholder="请选择">
    <XhSelectLabel>食材</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger>
        <XhSelectValueText />
        <XhSelectIndicator />
      </XhSelectTrigger>
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <!-- 段标题不带条目标记，导航与检索都跳过它 -->
          <XhSelectGroup v-for="g in groups" :key="g.id" :value="g.id">
            <XhSelectGroupLabel>{{ g.label }}</XhSelectGroupLabel>
            <XhSelectItem v-for="o in g.items" :key="o.value" :value="o.value">
              <XhSelectItemText>{{ o.label }}</XhSelectItemText>
              <XhSelectItemIndicator />
            </XhSelectItem>
          </XhSelectGroup>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
  <p>当前值：{{ picked[0] ?? "（未选）" }}</p>
</template>
```

```html
<xh-select id="select-group" placeholder="请选择">
  <div data-xh-part="root">
    <span data-xh-part="label">食材</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <!-- 段标题不带条目标记，导航与检索都跳过它 -->
          <div data-xh-part="group" value="fruit">
            <span data-xh-part="group-label">水果</span>
            <div data-xh-part="item" value="apple">
              <span data-xh-part="item-text">苹果</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="banana">
              <span data-xh-part="item-text">香蕉</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
          <div data-xh-part="group" value="vegetable">
            <span data-xh-part="group-label">蔬菜</span>
            <div data-xh-part="item" value="carrot">
              <span data-xh-part="item-text">胡萝卜</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="celery">
              <span data-xh-part="item-text">芹菜</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>
<p>当前值：<span id="select-group-value">（未选）</span></p>

<script type="module">
  // 选中值回显在下面那行文字里
  const select = document.getElementById("select-group");
  const readout = document.getElementById("select-group-value");
  select.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
</script>
```

### 多选标签

内建标签形态：触发器里的标签行最多摆 maxTagCount 枚（缺省 3），其余合成一枚 +N；每枚标签与 +N 都是库里的 tag（语气与尺寸随控件，形态按控件的面派），触发器里纯展示，触发器外配删除钮即可删，那颗钮就是 tag 的 close-trigger

```vue
<script setup lang="ts">
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemDeleteTrigger,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectOverflowTag,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTag,
  XhSelectTagList,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const options = [
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
  { value: "lit", label: "Lit" },
  { value: "preact", label: "Preact" },
];

const picked = ref<string[]>(["vue", "svelte", "solid"]);
</script>

<template>
  <XhSelectRoot
    v-slot="{ tags }"
    v-model:value="picked"
    :collection="options"
    :max-tag-count="2"
    multiple
    placeholder="请选择"
    style="inline-size: 280px"
  >
    <XhSelectLabel>技术栈</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger>
        <!-- 占位文字与标签行同时写着：有选中时标签行露面、占位让位，无选中时反过来。行里每枚标签与 +N 都是 tag 的 root，样子归 tag.css -->
        <XhSelectValueText />
        <XhSelectTagList>
          <XhSelectTag v-for="t in tags" :key="t.value" :value="t.value">{{ t.label }}</XhSelectTag>
          <XhSelectOverflowTag />
        </XhSelectTagList>
        <XhSelectIndicator />
      </XhSelectTrigger>
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <XhSelectItem v-for="o in options" :key="o.value" :value="o.value">
            <XhSelectItemText>{{ o.label }}</XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
    <!-- 触发器外的可删标签行：按钮不能套按钮，删除钮只能放在这里 -->
    <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-block-start: 6px">
      <XhSelectTag v-for="v in picked" :key="v" :value="v">
        {{ options.find((o) => o.value === v)?.label ?? v }}
        <XhSelectItemDeleteTrigger />
      </XhSelectTag>
    </div>
  </XhSelectRoot>
</template>
```

```html
<xh-select id="select-tags" multiple max-tag-count="2" placeholder="请选择">
  <div data-xh-part="root" style="inline-size: 280px">
    <span data-xh-part="label">技术栈</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <!-- 占位文字与标签行同时写着：有选中时标签行露面、占位让位，无选中时反过来 -->
        <span data-xh-part="value-text"></span>
        <!-- 触发器里的标签只作展示：按钮不能套按钮，这里不放删除钮；tag / overflow-tag 接的都是 tag 的 root，只有文字的由元素包一层 label，+N 那一枚由元素填字 -->
        <span data-xh-part="tag-list">
          <span data-xh-part="overflow-tag"></span>
        </span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="vue">
            <span data-xh-part="item-text">Vue</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="svelte">
            <span data-xh-part="item-text">Svelte</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="solid">
            <span data-xh-part="item-text">Solid</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="lit">
            <span data-xh-part="item-text">Lit</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="preact">
            <span data-xh-part="item-text">Preact</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
    <!-- 触发器外的可删标签行：删除钮只能放在这里 -->
    <div
      id="select-tags-row"
      style="display: flex; flex-wrap: wrap; gap: 4px; margin-block-start: 6px"
    ></div>
  </div>
</xh-select>

<script type="module">
  const select = document.getElementById("select-tags");
  const overflow = select.querySelector('[data-xh-part="overflow-tag"]');
  const row = document.getElementById("select-tags-row");

  const options = [
    { value: "vue", label: "Vue" },
    { value: "svelte", label: "Svelte" },
    { value: "solid", label: "Solid" },
    { value: "lit", label: "Lit" },
    { value: "preact", label: "Preact" },
  ];
  select.collection = options;

  let picked = ["vue", "svelte", "solid"];

  // 一枚标签：带删除钮的那一份放在触发器外面
  function tagOf(value, label, deletable) {
    const tag = document.createElement("span");
    tag.setAttribute("data-xh-part", "tag");
    tag.setAttribute("value", value);
    tag.textContent = label;
    if (deletable) {
      const remove = document.createElement("button");
      remove.setAttribute("data-xh-part", "item-delete-trigger");
      tag.append(remove);
    }
    return tag;
  }

  function render() {
    select.value = picked;

    // 摆得下几枚由组件按 max-tag-count 算好；标签行里 +N 那一枚常挂，标签插在它前面
    for (const stale of select.querySelectorAll('[data-xh-part="tag-list"] [data-xh-part="tag"]'))
      stale.remove();
    overflow.before(...select.tags.map((tag) => tagOf(tag.value, tag.label, false)));

    // 外面这一行不截断，逐个都摆出来，标签文字回自己那份数据里查
    row.replaceChildren(
      ...picked.map((value) =>
        tagOf(
          value,
          options.find((option) => option.value === value)?.label ?? value,
          true,
        ),
      ),
    );
  }

  select.addEventListener("value-change", (event) => {
    picked = event.detail.value;
    render();
  });

  render();
</script>
```

### 校验状态

校验结论由宿主给出：invalid 让盒标红并输出 aria-invalid，错误文案用 aria-describedby 挂到触发器上

```vue
<script setup lang="ts">
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const departments = [
  { value: "design", label: "设计组" },
  { value: "frontend", label: "前端组" },
  { value: "server", label: "服务端组" },
];

const picked = ref<string[]>([]);
const invalid = computed(() => picked.value.length === 0);
</script>

<template>
  <XhSelectRoot v-model:value="picked" :invalid="invalid" placeholder="必须选一个">
    <XhSelectLabel>所属部门</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger :aria-describedby="invalid ? 'select-invalid-tip' : undefined">
        <XhSelectValueText />
        <XhSelectIndicator />
      </XhSelectTrigger>
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <XhSelectItem v-for="d in departments" :key="d.value" :value="d.value">
            <XhSelectItemText>{{ d.label }}</XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
  <p v-if="invalid" id="select-invalid-tip" style="color: var(--xh-fg-danger)">这一项必填</p>
</template>
```

```html
<xh-select id="select-invalid" invalid placeholder="必须选一个">
  <div data-xh-part="root">
    <span data-xh-part="label">所属部门</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger" aria-describedby="select-invalid-tip">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="design">
            <span data-xh-part="item-text">设计组</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="frontend">
            <span data-xh-part="item-text">前端组</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="server">
            <span data-xh-part="item-text">服务端组</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>
<p id="select-invalid-tip" style="color: var(--xh-fg-danger)">这一项必填</p>

<script type="module">
  // 没选中即判为不合格：校验结论、错误文案与它的 IDREF 都由宿主一起开合
  const select = document.getElementById("select-invalid");
  const trigger = select.querySelector('[data-xh-part="trigger"]');
  const tip = document.getElementById("select-invalid-tip");

  select.addEventListener("value-change", (event) => {
    const invalid = event.detail.value.length === 0;
    select.invalid = invalid;
    tip.hidden = !invalid;
    if (invalid) trigger.setAttribute("aria-describedby", "select-invalid-tip");
    else trigger.removeAttribute("aria-describedby");
  });
</script>
```

### 滚动加载

list 承担选项滚动：滚到底追加下一页，独立加载状态不会混入可选项

```vue
<script setup lang="ts">
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectLoading,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

interface Ticket {
  value: string;
  label: string;
}

const PAGE_SIZE = 20;
const TOTAL = 80;

function makePage(from: number): Ticket[] {
  return Array.from({ length: PAGE_SIZE }, (_, i) => ({
    value: `no-${from + i + 1}`,
    label: `第 ${from + i + 1} 号工单`,
  }));
}

const tickets = ref<Ticket[]>(makePage(0));
const loading = ref(false);
const picked = ref<string[]>([]);

// 距底不足 8px 视为触底，取下一页
function onScroll(event: Event): void {
  const el = event.currentTarget as HTMLElement;
  if (loading.value || tickets.value.length >= TOTAL)
    return;
  if (el.scrollTop + el.clientHeight < el.scrollHeight - 8)
    return;
  loading.value = true;
  window.setTimeout(() => {
    tickets.value = [...tickets.value, ...makePage(tickets.value.length)];
    loading.value = false;
  }, 500);
}
</script>

<template>
  <XhSelectRoot v-model:value="picked" :loading="loading" placeholder="请选择">
    <XhSelectLabel>工单</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger>
        <XhSelectValueText />
        <XhSelectIndicator />
      </XhSelectTrigger>
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList @scroll="onScroll">
          <XhSelectItem v-for="t in tickets" :key="t.value" :value="t.value">
            <XhSelectItemText>{{ t.label }}</XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
        <XhSelectLoading>加载中…</XhSelectLoading>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
  <p>已加载 {{ tickets.length }} / {{ TOTAL }} 条</p>
</template>
```

```html
<xh-select id="select-scroll" placeholder="请选择">
  <div data-xh-part="root">
    <span data-xh-part="label">工单</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="no-1">
            <span data-xh-part="item-text">第 1 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-2">
            <span data-xh-part="item-text">第 2 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-3">
            <span data-xh-part="item-text">第 3 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-4">
            <span data-xh-part="item-text">第 4 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-5">
            <span data-xh-part="item-text">第 5 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-6">
            <span data-xh-part="item-text">第 6 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-7">
            <span data-xh-part="item-text">第 7 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-8">
            <span data-xh-part="item-text">第 8 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-9">
            <span data-xh-part="item-text">第 9 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-10">
            <span data-xh-part="item-text">第 10 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-11">
            <span data-xh-part="item-text">第 11 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-12">
            <span data-xh-part="item-text">第 12 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-13">
            <span data-xh-part="item-text">第 13 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-14">
            <span data-xh-part="item-text">第 14 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-15">
            <span data-xh-part="item-text">第 15 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-16">
            <span data-xh-part="item-text">第 16 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-17">
            <span data-xh-part="item-text">第 17 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-18">
            <span data-xh-part="item-text">第 18 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-19">
            <span data-xh-part="item-text">第 19 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="no-20">
            <span data-xh-part="item-text">第 20 号工单</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
        <div data-xh-part="loading">加载中…</div>
      </div>
    </div>
  </div>
</xh-select>
<p>已加载 <span id="select-scroll-count">20</span> / 80 条</p>

<script type="module">
  const select = document.getElementById("select-scroll");
  const list = select.querySelector('[data-xh-part="list"]');
  const count = document.getElementById("select-scroll-count");
  const PAGE_SIZE = 20;
  const TOTAL = 80;
  let loaded = PAGE_SIZE;
  let loading = false;

  function makeItem(value, text) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", value);
    const label = document.createElement("span");
    label.dataset.xhPart = "item-text";
    label.textContent = text;
    item.append(label);
    const indicator = document.createElement("span");
    indicator.dataset.xhPart = "item-indicator";
    item.append(indicator);
    return item;
  }

  // 距底不足 8px 视为触底，取下一页
  list.addEventListener("scroll", () => {
    if (loading || loaded >= TOTAL) return;
    if (list.scrollTop + list.clientHeight < list.scrollHeight - 8) return;
    loading = true;
    select.loading = true;
    window.setTimeout(() => {
      for (let i = 0; i < PAGE_SIZE; i += 1)
        list.append(makeItem(`no-${loaded + i + 1}`, `第 ${loaded + i + 1} 号工单`));
      loaded += PAGE_SIZE;
      count.textContent = String(loaded);
      loading = false;
      select.loading = false;
    }, 500);
  });
</script>
```

### 命令式聚焦

触发器就是你写的那个按钮，focus 与 blur 直接调它

```vue
<script setup lang="ts">
import {
  XhButton,
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const levels = [
  { value: "p0", label: "紧急" },
  { value: "p1", label: "高" },
  { value: "p2", label: "普通" },
];

const picked = ref<string[]>([]);
const trigger = ref<InstanceType<typeof XhSelectTrigger> | null>(null);
const submitted = ref(false);

// 提交时没选值就把焦点送回触发器
function submit(): void {
  submitted.value = true;
  if (picked.value.length === 0)
    trigger.value?.$el.focus();
}

function blurTrigger(): void {
  trigger.value?.$el.blur();
}
</script>

<template>
  <XhSelectRoot v-model:value="picked" placeholder="请选择">
    <XhSelectLabel>优先级</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger ref="trigger">
        <XhSelectValueText />
        <XhSelectIndicator />
      </XhSelectTrigger>
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <XhSelectItem v-for="l in levels" :key="l.value" :value="l.value">
            <XhSelectItemText>{{ l.label }}</XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
  <div style="display: flex; gap: 8px; margin-block-start: 8px">
    <XhButton variant="outline" size="sm" @click="submit">提交</XhButton>
    <XhButton variant="ghost" size="sm" @click="blurTrigger">移开焦点</XhButton>
  </div>
  <p v-if="submitted && picked.length === 0" style="color: var(--xh-fg-danger)">
    还没选优先级，焦点已回到选择器
  </p>
</template>
```

```html
<xh-select id="select-focus" placeholder="请选择">
  <div data-xh-part="root">
    <span data-xh-part="label">优先级</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="p0">
            <span data-xh-part="item-text">紧急</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="p1">
            <span data-xh-part="item-text">高</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="p2">
            <span data-xh-part="item-text">普通</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>
<div style="display: flex; gap: 8px; margin-block-start: 8px">
  <xh-button variant="outline" size="sm">
    <button data-xh-part="root" id="select-focus-submit">提交</button>
  </xh-button>
  <xh-button variant="ghost" size="sm">
    <button data-xh-part="root" id="select-focus-blur">移开焦点</button>
  </xh-button>
</div>
<p id="select-focus-tip" style="color: var(--xh-fg-danger)" hidden>
  还没选优先级，焦点已回到选择器
</p>

<script type="module">
  const select = document.getElementById("select-focus");
  const trigger = select.querySelector('[data-xh-part="trigger"]');
  const tip = document.getElementById("select-focus-tip");
  let picked = [];

  select.addEventListener("value-change", (event) => {
    picked = event.detail.value;
    tip.hidden = true;
  });

  // 提交时没选值就把焦点送回触发器
  document.getElementById("select-focus-submit").addEventListener("click", () => {
    if (picked.length > 0) return;
    tip.hidden = false;
    trigger.focus();
  });

  document.getElementById("select-focus-blur").addEventListener("click", () => {
    trigger.blur();
  });
</script>
```

### 清空按钮

清空钮是触发器的兄弟节点，一起收在盒里并排（Vue 的 collection 自动渲染加 clearable 即带上它）；有选中才出现、出现即顶替下拉箭头，不占 Tab 位（键盘清空走 Delete / Backspace）；点按清空全部选中、不展开浮层，焦点回到触发器；可及名走 translations.clearTrigger

```vue
<script setup lang="ts">
import {
  XhSelectClearTrigger,
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const teams = [
  { value: "design", label: "设计组" },
  { value: "frontend", label: "前端组" },
  { value: "server", label: "服务端组" },
];

const picked = ref<string[]>(["design"]);
const auto = ref<string[]>(["frontend"]);
</script>

<template>
  <XhSelectRoot
    v-model:value="picked"
    :translations="{ clearTrigger: '清空所选' }"
    placeholder="选一个组"
    style="inline-size: 240px"
  >
    <XhSelectLabel>所属小组</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger>
        <XhSelectValueText />
        <XhSelectIndicator />
      </XhSelectTrigger>
      <XhSelectClearTrigger />
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <XhSelectItem v-for="t in teams" :key="t.value" :value="t.value">
            <XhSelectItemText>{{ t.label }}</XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
  <p style="margin: 8px 0 0; font-size: 13px">选中：{{ picked.length ? picked.join(", ") : "（空）" }}</p>
  <XhSelectRoot
    v-model:value="auto"
    :collection="teams"
    :translations="{ clearTrigger: '清空所选' }"
    clearable
    label="所属小组（自动渲染）"
    placeholder="选一个组"
    style="margin-top: 16px; inline-size: 240px"
  />
  <p style="margin: 8px 0 0; font-size: 13px">选中：{{ auto.length ? auto.join(", ") : "（空）" }}</p>
</template>
```

```html
<xh-select id="select-clear" default-value="design" placeholder="选一个组">
  <div data-xh-part="root" style="inline-size: 240px">
    <span data-xh-part="label">所属小组</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="design">
            <span data-xh-part="item-text">设计组</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="frontend">
            <span data-xh-part="item-text">前端组</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="server">
            <span data-xh-part="item-text">服务端组</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>
<p style="margin: 8px 0 0; font-size: 13px">
  选中：<span id="select-clear-value">design</span>
</p>

<script type="module">
  const select = document.getElementById("select-clear");
  const readout = document.getElementById("select-clear-value");

  // 读屏文案是对象，只能走 property
  select.translations = { clearTrigger: "清空所选" };

  select.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value.join(", ") || "（空）";
  });
</script>
```

### 浮层底部的操作区

footer 是 list 的兄弟：不随条目滚走，也不会被方向键与连打检索走到

```vue
<script setup lang="ts">
import {
  XhButton,
  XhSelectContent,
  XhSelectControl,
  XhSelectFooter,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const picked = ref<string[]>([]);
const fruits = ref([
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
]);

let seq = 0;
function addOne() {
  seq += 1;
  fruits.value.push({ value: `new-${seq}`, label: `新水果 ${seq}` });
}
</script>

<template>
  <XhSelectRoot v-model:value="picked" placeholder="请选择">
    <XhSelectLabel>水果</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger>
        <XhSelectValueText />
        <XhSelectIndicator />
      </XhSelectTrigger>
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <!-- 条目住在 list 里：role=listbox 只许拥有 option -->
        <XhSelectList>
          <XhSelectItem v-for="f in fruits" :key="f.value" :value="f.value">
            <XhSelectItemText>{{ f.label }}</XhSelectItemText>
            <XhSelectItemIndicator />
          </XhSelectItem>
        </XhSelectList>
        <!-- 按钮放这里才不违反 listbox 的子节点约束；条目多到要滚时它也贴在下沿不动 -->
        <XhSelectFooter>
          <XhButton variant="ghost" size="sm" @click="addOne">＋ 新建</XhButton>
        </XhSelectFooter>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>

  <p>当前值：{{ picked[0] ?? "（未选）" }}</p>
</template>
```

```html
<xh-select id="select-footer" placeholder="请选择">
  <div data-xh-part="root">
    <span data-xh-part="label">水果</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <!-- 条目住在 list 里：role=listbox 只许拥有 option -->
        <div data-xh-part="list">
          <div data-xh-part="item" value="apple">
            <span data-xh-part="item-text">苹果</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="banana">
            <span data-xh-part="item-text">香蕉</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="cherry">
            <span data-xh-part="item-text">樱桃</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
        <!-- 按钮放这里才不违反 listbox 的子节点约束 -->
        <div data-xh-part="footer">
          <xh-button variant="ghost" size="sm">
            <button data-xh-part="root" id="select-footer-add">＋ 新建</button>
          </xh-button>
        </div>
      </div>
    </div>
  </div>
</xh-select>

<p>当前值：<span id="select-footer-value">（未选）</span></p>

<script type="module">
  const select = document.getElementById("select-footer");
  const list = select.querySelector('[data-xh-part="list"]');
  const readout = document.getElementById("select-footer-value");
  let seq = 0;

  // 底部按钮往列表末尾添一条新条目
  document.getElementById("select-footer-add").addEventListener("click", () => {
    seq += 1;
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", `new-${seq}`);
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = `新水果 ${seq}`;
    const indicator = document.createElement("span");
    indicator.dataset.xhPart = "item-indicator";
    item.append(text, indicator);
    list.append(item);
  });

  select.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
</script>
```

### 官方组合：浮层 + 列表框

值不进表单、只是就地切一个视图参数时用这一套：popover 管开合与定位，listbox 管条目与键盘，没有 hidden-select，也不占 name

```vue
<script setup lang="ts">
import {
  XhListboxRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const orders = [
  { value: "latest", label: "最新发布" },
  { value: "hot", label: "最多讨论" },
  { value: "price", label: "价格从低到高" },
];

const order = ref<string[]>(["latest"]);
const open = ref(false);
const label = computed(() => orders.find(o => o.value === order.value[0])?.label ?? "排序");

// 单选：落值即收起浮层
function onValueChange(details: { value: string[] }): void {
  if (details.value.length > 0)
    open.value = false;
}
</script>

<template>
  <XhPopoverRoot v-model:open="open" placement="bottom-start">
    <XhPopoverTrigger>排序：{{ label }}</XhPopoverTrigger>
    <XhPopoverPositioner>
      <XhPopoverContent>
        <XhListboxRoot
          v-model:value="order"
          :collection="orders"
          style="min-inline-size: 180px"
          @value-change="onValueChange"
        />
      </XhPopoverContent>
    </XhPopoverPositioner>
  </XhPopoverRoot>
</template>
```

```html
<xh-popover id="select-combo" open="false" placement="bottom-start">
  <button data-xh-part="trigger">排序：最新发布</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <xh-listbox id="select-combo-list" value="latest">
        <div data-xh-part="root" style="min-inline-size: 180px">
          <div data-xh-part="content">
            <div data-xh-part="item" value="latest">
              <span data-xh-part="item-text">最新发布</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="hot">
              <span data-xh-part="item-text">最多讨论</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="price">
              <span data-xh-part="item-text">价格从低到高</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </xh-listbox>
    </div>
  </div>
</xh-popover>

<script type="module">
  const popover = document.getElementById("select-combo");
  const list = document.getElementById("select-combo-list");
  // 触发器的 id 归连接层写，作者按部件取节点
  const trigger = popover.querySelector('[data-xh-part="trigger"]');

  // 浮层受控：开合写回
  popover.addEventListener("open-change", (event) => {
    popover.open = event.detail.open;
  });

  // 单选：落值即收起浮层，触发器换成当前选中项
  list.addEventListener("value-change", (event) => {
    list.value = event.detail.value;
    const picked = list.querySelector(
      `[data-xh-part="item"][value="${event.detail.value[0]}"]`,
    );
    trigger.textContent = `排序：${picked ? picked.textContent.trim() : "未选"}`;
    if (event.detail.value.length > 0) popover.open = false;
  });
</script>
```

## 设计指引

### 何时使用

- 选项五个以上、且都能列举出来。
- 需要多选并把选中项显示成标签。

### 何时不用

- 选项二到五个且都值得同时可见：用[单选组](./radio-group)。
- 用户需要输入自由文本或搜索候选：用[组合框](./combobox)。
- 选项是层级的：用[级联选择](./cascader)或[树选择](./tree-select)。
- 值不随表单提交、只是就地切一个视图参数：把[列表框](./listbox)装进[浮层](./popover)，那一套组合更轻，也不占 `name`。

### 特性

- `hidden-select` 承担表单参与。
- 多选可以把选中项显示成标签行：最多摆 `maxTagCount` 枚（缺省 3），其余合成一枚 +N，触发器始终是一行。每枚标签都是库里的 tag；摆在触发器外时可以配删除钮，那颗钮就是 tag 的 `close-trigger`。
- 浮层里可以有分组、底部操作区与滚动加载。
- 三种非条目相位各有部件：空（`empty`）与在途（`loading`）。`loading` 为真时列表报 `aria-busy`，在途占位顶上来、空态让位。
- 大量选项时列表可以只渲可视区。
- 触发盒保持实体 Field Chrome，选项浮层使用 M2 磨砂表面；面板落位后按实际 placement 从锚点一侧
  淡入短移，退出沿原方向收回，不缩放整张列表。
- 逻辑关闭时列表立即 `inert` 并退出可访问树；Layer、DismissableLayer 与焦点域会保留到
  content 的全部有限退场动画完成。退场中重开复用原 Layer 并重新激活焦点域，卸载立即释放。
- 选项按作者给出的 DOM 顺序排布；正式 `item-text` 弹性占据剩余宽度并负责长文省略，
  `item-indicator` 固定在逻辑末端。单选、多选统一由对号表示选中，正文保持正常颜色和字重；
  悬停与键盘高亮使用中性底，键盘焦点另有独立焦点环。选中本身不铺品牌底。
- `item` 由 Headless 投影 Collection Item 的角色、尺寸、selected/checked/disabled 事实；`item-text`
  与 `item-indicator` 投影固定内容列。三端适配器只展开这些属性，不各自判断视觉状态。
- 相邻分组之间自动画材质分隔线，分组标题、空态、加载态与 footer 使用浮层的次要前景节奏。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-select>` |
| Vue 组件 | `XhSelectClearTrigger` `XhSelectContent` `XhSelectControl` `XhSelectEmpty` `XhSelectFooter` `XhSelectGroup` `XhSelectGroupLabel` `XhSelectIndicator` `XhSelectItem` `XhSelectItemDeleteTrigger` `XhSelectItemIndicator` `XhSelectItemText` `XhSelectLabel` `XhSelectList` `XhSelectLoading` `XhSelectOverflowTag` `XhSelectPositioner` `XhSelectRoot` `XhSelectTag` `XhSelectTagLabel` `XhSelectTagList` `XhSelectTrigger` `XhSelectValueText` |
| 组合式函数 | `useSelect` |
| 状态机 | `selectMachine` |
| 皮肤 | `@xihan-ui/styles/select.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="select"`：`root` · `label` · `control` · **`trigger`** · `value-text` · `indicator` · `clear-trigger` · `tag-list` · `positioner` · **`content`** · **`list`** · `footer` · `group` · `group-label` · `item` · `item-text` · `item-indicator` · `empty` · `loading` · `hidden-select`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `SelectNode[]` |  | 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value， 显示文本也不再从活 DOM 现查。缺省即回到「文本写在条目里、现查 DOM」的老路。 |
| `value` | `string \| string[] \| null` |  | 选中值。裸串是单选的简写，null 是「受控且无选中」，缺省（undefined）才是非受控；内部一律按数组处理。 受控时 cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string \| string[] \| null` |  | 非受控初始选中值。与 value 同样接受裸串与 null。 |
| `multiple` | `boolean` |  | 允许选中多项。单选时选完即收起，多选时保持展开继续选。 |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `disabled` | `boolean` |  | 整个控件禁用：trigger 用原生 disabled，隐藏 select 不参与提交。 |
| `readOnly` | `boolean` |  | 只读：浮层照常展开与浏览，但选中值改不动、也清不掉。 |
| `invalid` | `boolean` |  | 校验错误态：trigger 标红并输出 aria-invalid。 |
| `loading` | `boolean` |  | 条目还在取：列表报 aria-busy，在途占位顶上来、空态占位让位。 |
| `translations` | `Partial<SelectTranslations>` |  | 读屏用的文案，默认英文。 |
| `maxTagCount` | `number` |  | 多选标签最多摆几枚，其余折进 overflowCount、合成 +N 那一枚；缺省 3（SELECT_DEFAULT_MAX_TAG_COUNT）。 |
| `required` | `boolean` |  | 原生表单校验：无选中值时提交被拦下。 |
| `name` | `string` |  | 表单字段名。给定后隐藏 select 才带 name，选中值随表单一并提交。 |
| `placeholder` | `string` |  | 无选中时 value-text 显示的占位文字。 |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定触发器的描边与底色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定触发器高度、内边距与字号档位。 |
| `onValueChange` | `(details: SelectValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onOpenChange` | `(details: SelectOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `SelectValueChangeDetails` | 选中值变化；detail 为 `{ value: string[] }` |
| `open-change` | `SelectOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSelectRoot` | `default` | `SelectRootSlotProps` |  |
| `XhSelectRoot` | `label` | — |  |
| `XhSelectRoot` | `item` | `SelectNodeMeta` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `list` | 'open' \| 'closed' |
| `footer` | 'open' \| 'closed' |
| `empty` | 'open' \| 'closed' |
| `loading` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.HIGHLIGHT` · `HIGHLIGHT.CLEAR` · `ITEM.LOST` · `ITEM.SELECT` · `VALUE.SET` · `VALUE.CLEAR` · `FORM.RESET`

**判据**：`isOpenControlled` · `isMultiple` · `isReadOnly`

## connect API

`useSelect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly SelectNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `value` | `string[]` | 选中集合，按选中先后排列而非文档顺序。单选恒为长度 ≤ 1。 |
| `valueText` | `string[]` | 选中项的文本，与 value 逐项等长对应；某项在 DOM 里查不到条目时该项退回值本身。 |
| `displayText` | `string` | value-text 实际显示的文字：有选中取其文本（多选按半角逗号加空格连起来），否则取 placeholder。 |
| `multiple` | `boolean` | 是否允许多选。 |
| `invalid` | `boolean` | 校验错误态。 |
| `readOnly` | `boolean` | 只读态。 |
| `canClear` | `boolean` | 此刻能否清空：有选中且既不禁用也不只读。 |
| `tags` | `SelectTagMeta[]` | 可见标签（受 maxTagCount 截断），与 value/valueText 同序。 |
| `overflowCount` | `number` | 被 maxTagCount 折起来的标签数。 |
| `overflowText` | `string` | +N 那一枚显示的文字（translations.overflowTag 算出）；没有折起的标签时为空串。 |
| `highlightedValue` | `string \| null` | 高亮锚点；收起时为 null。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string \| string[]) => void` |  |
| `clear` | `() => void` | 清空全部选中。 |
| `deselect` | `(value: string) => void` | 摘掉一个选中值。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` | 触发器与清空按钮的收纳容器：两者在里面并排，有值时清空钮顶替展开指示符。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getValueTextProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getClearTriggerProps` | `() => T['button']` | 清空按钮：不占 Tab 位；清不了时整个藏掉；点按清空全部选中、不展开浮层，焦点送回 trigger。 |
| `getTagListProps` | `() => T['element']` | 标签行：收着可见标签与 +N 那一枚，放在触发器里；无选中时整个 hidden。 |
| `getTagProps` | `(props: SelectTagProps) => T['element']` | 标签：一个选中值一枚，就是库里 tag 的 root（data-scope="tag"）：语气、尺寸与禁用从本控件传下去，形态按控件的面派（outline / ghost / 缺省摆淡底标签，subtle 摆描边标签），另带 data-value 记它代表哪个值。放触发器里就是纯展示（不渲关闭钮），放外面配删除钮可删。 |
| `getTagLabelProps` | `() => T['element']` | 标签文字所在的块（tag 的 label）：截断落在这一层；标签与 +N 共用。 |
| `getOverflowTagProps` | `() => T['element']` | 被折起的标签合成的那一枚：同样是 tag 的 root，显示 overflowText、带 data-count；没有折起的标签时 hidden。 |
| `getItemDeleteTriggerProps` | `(props: SelectTagProps) => T['button']` | 标签删除按钮：就是所在标签那份 tag 的 close-trigger（data-scope="tag"），可及名走 translations.deleteItem，禁用时留位、原生 disabled；点按摘掉所在标签的选中值；须放在标签里。 |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` | 浮层外壳：描边、底色、阴影与键盘收口都在它身上。 |
| `getListProps` | `() => T['element']` | 列表框本体，滚动在这一层；role=listbox 与条目的拥有关系都归它。 |
| `getFooterProps` | `() => T['element']` | 浮层底部的操作区，是 list 的兄弟；不在列表框的拥有关系里，也不参与方向键与连打检索。 |
| `getEmptyProps` | `() => T['element']` | 空态占位：放在 content 里、list 的兄弟。 给了 collection 时由连接层按条数收放；条目手写时不写 hidden，露不露面归作者。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一个位置，两者不同屏——取数期间它顶上来，空态让位。 给了 collection 时由连接层按条数收放；条目手写时只按 loading 收放。 |
| `getGroupProps` | `(props: SelectGroupProps) => T['element']` | 分组容器：role=group，条目挂在它里面；分组标题经 aria-labelledby 关联。 |
| `getGroupLabelProps` | `(props: SelectGroupProps) => T['element']` | 分组标题：不是选项、不进导航，只作为本组的可及名字。 |
| `getItemProps` | `(props: SelectItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: SelectItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: SelectItemProps) => T['element']` |  |
| `getHiddenSelectProps` | `() => T['select']` | 表单出口：一份视觉隐藏的原生 select，由根部件自行渲染（作者不必手写）。 选项由适配器按当前值补齐，原生提交与 required 校验据此拿到值。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | closed, focus in trigger | 展开列表并把高亮落到当前选中项（无选中则落首个可用条目） |
| `ArrowDown` | closed, focus in trigger | 展开列表并把高亮落到选中项的下一个可用条目 |
| `ArrowUp` | closed, focus in trigger | 展开列表并把高亮落到选中项的上一个可用条目 |
| `单个可打印字符` | closed, focus in trigger | 连打检索命中的条目直接成为选中值（多选是加进集合，已在集合里则不动），列表不展开 |
| `Delete` | closed, focus in trigger, 有选中值且未禁用、未只读 | 清空全部选中，列表不展开 |
| `Backspace` | closed, focus in trigger, 有选中值且未禁用、未只读 | 单选清空；多选去掉最后一个选中值，列表不展开 |
| `ArrowDown` | open, focus in content | 高亮移到下一个条目（禁用项跳过、尽头按 loop 回绕） |
| `ArrowUp` | open, focus in content | 高亮移到上一个条目（禁用项跳过、尽头按 loop 回绕） |
| `Home` | open, focus in content | 高亮移到首个可用条目 |
| `End` | open, focus in content | 高亮移到末个可用条目 |
| `单个可打印字符` | open, focus in content | 连打检索移动高亮，不改选中值 |
| `Enter` / `Space` | open, 单选, 高亮条目未禁用 | 选中高亮条目并关闭列表，焦点归还 trigger |
| `Enter` / `Space` | open, 多选, 高亮条目未禁用 | 切换高亮条目的选中态，列表不收起、焦点留在条目上 |
| `Escape` | open | 关闭列表并把焦点归还 trigger，选中值不变 |
| `Tab` / `Shift+Tab` | open | 关闭列表，焦点不归还 trigger，按 Tab 序列自然离开 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'listbox' |
| `trigger` | `aria-invalid` | 'true' \| 'false' |
| `trigger` | `aria-labelledby` | `label` 部件的 id `value-text` 部件的 id |
| `trigger` | `aria-readonly` | 'true' \| 'false' |
| `trigger` | `role` | 'combobox' |
| `indicator` | `aria-hidden` | 'true' |
| `clear-trigger` | `aria-label` | props.translations.clearTrigger |
| `content` | `aria-hidden` | !open \|\| undefined |
| `list` | `aria-busy` | 'true' \| undefined |
| `list` | `aria-label` | props.translations.content |
| `list` | `aria-labelledby` | `label` 部件的 id `value-text` 部件的 id |
| `list` | `aria-multiselectable` | 'true' \| 'false' |
| `list` | `role` | 'listbox' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-indicator` | `aria-hidden` | 'true' |
| `hidden-select` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/select.css` 按部件选择：`[data-scope="select"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-invalid` | ''（条件成立时才出现） |
| `trigger` | `data-placeholder` | ''（条件成立时才出现） |
| `trigger` | `data-readonly` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `value-text` | `data-disabled` | ''（条件成立时才出现） |
| `value-text` | `data-placeholder` | ''（条件成立时才出现） |
| `indicator` | `data-clearable` | ''（条件成立时才出现） |
| `indicator` | `data-disabled` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `tag-list` | `data-disabled` | ''（条件成立时才出现） |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `list` | `data-state` | 'open' \| 'closed' |
| `footer` | `data-state` | 'open' \| 'closed' |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-indicator` | `data-xh-collection-slot` | 'indicator' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-state` | 'open' \| 'closed' |
| `overflow-tag` | `data-count` | String(overflowCount) |
| `tag` | `data-value` | v |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-select-action-bg` | `clear-trigger` | `background` | `default` | `transparent` | select 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-select-action-bg-active` | `clear-trigger` | `background` | `active` | `--xh-bg-subtle-active` | select 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-select-action-bg-hover` | `clear-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | select 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-select-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | select 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-select-action-fg-hover` | `clear-trigger` | `color` | `hover` | `--xh-fg-default` | select 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-select-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | select 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-select-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-control` | select 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-select-action-size` | `clear-trigger`<br>`indicator` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | select 的 clear-trigger、indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-select-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | select 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-select-content-bg` | `content` | `background` | `default` | `--xh-material-frosted-bg` | select 的 content 部件 background 覆盖槽。 |
| `--xh-select-content-border` | `content` | `border` | `default` | `--xh-material-frosted-border` | select 的 content 部件 border 覆盖槽。 |
| `--xh-select-content-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | select 的 content 部件 color 覆盖槽。 |
| `--xh-select-content-highlight` | `content` | `background` | `default` | `--xh-material-frosted-highlight` | select 的 content 部件 background 覆盖槽。 |
| `--xh-select-content-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-menu-max-h` | select 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-select-content-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` | select 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-select-content-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-menu-min-w` | select 的 content 部件 min-inline-size 覆盖槽。 |
| `--xh-select-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` | select 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-select-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` | select 的 content 部件 padding-block 覆盖槽。 |
| `--xh-select-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | select 的 content 部件 border-radius 覆盖槽。 |
| `--xh-select-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | select 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-select-control-bg` | `control` | `background` | `default` | `--xh-_select-control-bg` | select 的 control 部件 background 覆盖槽。 |
| `--xh-select-control-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` | select 的 control 部件 background 覆盖槽。 |
| `--xh-select-control-bg-hover` | `control` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly` | `--xh-_select-control-bg-hover` | select 的 control 部件 background 覆盖槽。 |
| `--xh-select-control-bg-readonly` | `control` | `background` | `readonly` | `--xh-bg-subtle` | select 的 control 部件 background 覆盖槽。 |
| `--xh-select-control-border` | `control` | `border` | `default` | `--xh-_select-control-border` | select 的 control 部件 border 覆盖槽。 |
| `--xh-select-control-border-focus` | `control` | `border-color` | `focus-within`<br>`invalid`<br>`not([data-invalid])` | `--xh-_tone` | select 的 control 部件 border-color 覆盖槽。 |
| `--xh-select-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid])` | `--xh-_select-control-border-hover` | select 的 control 部件 border-color 覆盖槽。 |
| `--xh-select-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` | select 的 control 部件 border-color 覆盖槽。 |
| `--xh-select-control-gap` | `control` | `gap` | `default` | `--xh-_select-gap` | select 的 control 部件 gap 覆盖槽。 |
| `--xh-select-control-h` | `control` | `block-size` | `default` | `--xh-_select-h` | select 的 control 部件 block-size 覆盖槽。 |
| `--xh-select-control-min-w` | `control`<br>`root` | `min-inline-size` | `default` | `--xh-control-min-w` | select 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-select-control-px` | `control` | `padding-inline` | `default` | `--xh-_select-px` | select 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-select-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | select 的 control 部件 border-radius 覆盖槽。 |
| `--xh-select-control-shadow` | `control` | `box-shadow` | `default` | `--xh-_select-control-shadow` | select 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-select-empty-fg` | `empty` | `color` | `default` | `--xh-material-frosted-fg-muted` | select 的 empty 部件 color 覆盖槽。 |
| `--xh-select-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_select-font-size` | select 的 empty 部件 font-size 覆盖槽。 |
| `--xh-select-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_select-item-px` | select 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-select-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` | select 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-select-footer-border` | `footer` | `border-block-start` | `default` | `--xh-material-frosted-separator` | select 的 footer 部件 border-block-start 覆盖槽。 |
| `--xh-select-footer-fg` | `footer` | `color` | `default` | `--xh-material-frosted-fg-muted` | select 的 footer 部件 color 覆盖槽。 |
| `--xh-select-footer-font-size` | `footer` | `font-size` | `default` | `--xh-text-secondary-size` | select 的 footer 部件 font-size 覆盖槽。 |
| `--xh-select-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` | select 的 footer 部件 gap 覆盖槽。 |
| `--xh-select-footer-px` | `footer` | `padding-inline` | `default` | `--xh-space-2` | select 的 footer 部件 padding-inline 覆盖槽。 |
| `--xh-select-footer-py` | `footer` | `padding-block` | `default` | `--xh-space-2` | select 的 footer 部件 padding-block 覆盖槽。 |
| `--xh-select-gap` | `root` | `gap` | `default` | `--xh-space-1` | select 的 root 部件 gap 覆盖槽。 |
| `--xh-select-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | select 的 group 部件 gap 覆盖槽。 |
| `--xh-select-group-label-fg` | `group-label` | `color` | `default` | `--xh-material-frosted-fg-muted` | select 的 group-label 部件 color 覆盖槽。 |
| `--xh-select-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | select 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-select-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | select 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-select-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_select-item-px` | select 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-select-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | select 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-select-group-separator-color` | `group` | `border-block-start` | `default` | `--xh-material-frosted-separator` | select 的 group 部件 border-block-start 覆盖槽。 |
| `--xh-select-group-spacing` | `group` | `padding-block-start` | `default` | `--xh-space-1_5` | select 的 group 部件 padding-block-start 覆盖槽。 |
| `--xh-select-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | select 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-select-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-muted` | select 的 indicator 部件 color 覆盖槽。 |
| `--xh-select-item-bg-hover` | `item` | `background-color` | `error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [aria-busy='true'], [data-error])` | `--xh-bg-subtle` | select 的 item 部件 background-color 覆盖槽。 |
| `--xh-select-item-bg-pressed` | `item` | `background` | `active`<br>`disabled`<br>`not([data-disabled])` | `--xh-bg-subtle-active` | select 的 item 部件 background 覆盖槽。 |
| `--xh-select-item-fg` | `item` | `color` | `default`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [aria-busy='true'], [data-error])` | `--xh-material-frosted-fg` | select 的 item 部件 color 覆盖槽。 |
| `--xh-select-item-fg-selected` | `item` | `color` | `default`<br>`highlighted`<br>`is(:focus-visible, [data-highlighted])` | `--xh-select-item-fg` | select 的 item 部件 color 覆盖槽。 |
| `--xh-select-item-font-size` | `item` | `font-size` | `default` | `--xh-_select-font-size` | select 的 item 部件 font-size 覆盖槽。 |
| `--xh-select-item-font-weight-selected` | `item` | `font-weight` | `default`<br>`highlighted`<br>`is(:focus-visible, [data-highlighted])` | `--xh-font-weight-regular` | select 的 item 部件 font-weight 覆盖槽。 |
| `--xh-select-item-gap` | `item` | `margin-inline-end`<br>`margin-inline-start` | `xh-collection-slot=indicator`<br>`xh-collection-slot=prefix`<br>`xh-collection-slot=shortcut`<br>`xh-collection-slot=suffix` | `--xh-_select-gap` | select 的 item 部件 margin-inline-end、margin-inline-start 覆盖槽。 |
| `--xh-select-item-indicator-fg` | `item` | `color` | `state=checked`<br>`xh-collection-slot=indicator` | `--xh-_select-accent` | select 的 item 部件 color 覆盖槽。 |
| `--xh-select-item-indicator-size` | `item-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | select 的 item-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-select-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | select 的 item 部件 line-height 覆盖槽。 |
| `--xh-select-item-px` | `item` | `padding-inline` | `default` | `--xh-_select-item-px` | select 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-select-item-py` | `item` | `padding-block` | `default` | `--xh-_select-item-py` | select 的 item 部件 padding-block 覆盖槽。 |
| `--xh-select-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | select 的 item 部件 border-radius 覆盖槽。 |
| `--xh-select-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | select 的 label 部件 color 覆盖槽。 |
| `--xh-select-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | select 的 label 部件 color 覆盖槽。 |
| `--xh-select-label-font-size` | `label` | `font-size` | `default` | `--xh-_select-label-font-size` | select 的 label 部件 font-size 覆盖槽。 |
| `--xh-select-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | select 的 label 部件 font-weight 覆盖槽。 |
| `--xh-select-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | select 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-select-list-gap` | `list` | `gap` | `default` | `--xh-list-option-gap` | select 的 list 部件 gap 覆盖槽。 |
| `--xh-select-loading-fg` | `loading` | `color` | `default` | `--xh-material-frosted-fg-muted` | select 的 loading 部件 color 覆盖槽。 |
| `--xh-select-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_select-font-size` | select 的 loading 部件 font-size 覆盖槽。 |
| `--xh-select-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_select-item-px` | select 的 loading 部件 padding-inline 覆盖槽。 |
| `--xh-select-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` | select 的 loading 部件 padding-block 覆盖槽。 |
| `--xh-select-placeholder-fg` | `value-text` | `color` | `placeholder` | `--xh-fg-subtle` | select 的 value-text 部件 color 覆盖槽。 |
| `--xh-select-tag-list-gap` | `tag-list` | `gap` | `default` | `--xh-space-1` | select 的 tag-list 部件 gap 覆盖槽。 |
| `--xh-select-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | select 的 trigger 部件 color 覆盖槽。 |
| `--xh-select-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_select-font-size` | select 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-select-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_select-gap` | select 的 trigger 部件 gap 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `color` · `rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[表单字段](./field)；选项文字过长时里面用[文本截断](./truncate)。
- **浮层 + 列表框**：值不进表单、只是就地切一个视图参数（排序方式、显示密度）时，用[浮层](./popover)装[列表框](./listbox)——浮层管开合与定位，列表框管条目与键盘，两边各自完整，不必另立组件。这是本库「浮层壳 + 条目层」的官方组合写法，示例见本页「官方组合：浮层 + 列表框」与[列表框](./listbox)页的同一例；要随表单提交、要 `name` 与 `hidden-select` 时才用本组件。

## 最佳实践

- 触发器的宽度固定，别随选中项的长度变——整行布局会跟着抖。
- 选项超过约二十条就该加搜索，也就是换成[组合框](./combobox)。
- 多选标签直接复用 Tag 的 M1 表面；调整标签外观应使用 `--xh-tag-*` 覆盖槽，不要在 Select 里重画。
- 自定义选项里的图标、头像、正文和尾部提示按作者 DOM 顺序写；需要截断的正文放进 `item-text`，
  不要靠皮肤猜测任意 span 的职责。

### 当前边界

- 当前 anatomy 尚无独立 `separator`、`viewport`、`scroll-up-button` 或 `scroll-down-button`。本次只在
  相邻 `group` 之间提供自动分隔，`list` 继续同时承担滚动视口；这些新部件需要独立行为与三端 API。

## 反模式

- 用它承载动作（"导出"、"删除"）：那是[菜单](./menu)。
- 异步加载选项时浮层里什么都不显示：给一个加载态或空态。
