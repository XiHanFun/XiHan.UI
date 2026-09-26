来源：https://ui.docs.xihanfun.com/components/select

# Select 选择器

从已知清单中选择一个或多个值，选项收在浮层内。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/select" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/select.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/select" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/select" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/select.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

单选

```vue
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "blueberry", label: "蓝莓" },
  { value: "cherry", label: "樱桃（缺货）", disabled: true },
  { value: "durian", label: "榴莲" },
];
</script>

<template>
  <XhSelectRoot :collection="fruits" :default-value="['banana']" label="水果" placeholder="请选择" />
</template>
```

```html
<xh-select default-value="banana" placeholder="请选择">
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
```

## 组件结构

加粗的是必需部件。

`data-scope="select"`：`root` · `label` · `control` · **`trigger`** · `value-text` · `indicator` · `clear-trigger` · `tag-list` · `positioner` · **`content`** · **`list`** · `footer` · `group` · `group-label` · `item` · `item-prefix` · `item-text` · `item-description` · `item-suffix` · `item-indicator` · `empty` · `loading` · `hidden-select`

## 示例

### 多选

选择多个值

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

由 value 和 value-change 控制

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

禁止展开和聚焦

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

### 变体

outline、subtle 和 ghost

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

### 颜色

六种语气

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

小、中、大三档

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

### 异步加载

展开时加载选项

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

分别设置控件和浮层宽度

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
      style="--xh-select-control-w: 20rem; --xh-select-content-min-w: 22rem"
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
      style="--xh-select-control-w: 20rem; --xh-select-content-min-w: 22rem"
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

### 自定义内容

自定义选项和当前值

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

### 操作入口

通过插槽状态控制开合和值

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

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];
</script>

<template>
  <XhSelectRoot
    v-slot="{ open, value, setOpen, setValue }"
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

<script type="module">
  const select = document.getElementById("select-actions");
  const toggle = document.getElementById("select-actions-toggle");
  const toggleLabel = toggle.querySelector('[data-xh-part="root"]');
  const clear = document.getElementById("select-actions-clear");

  let open = false;
  let value = [];

  function apply() {
    select.open = open;
    select.value = value;
    toggleLabel.textContent = open ? "收起" : "展开";
    clear.disabled = value.length === 0;
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

列表内部滚动并支持连打检索

```vue
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const options = Array.from(letters, letter => ({ value: letter, label: `${letter} 区` }));
</script>

<template>
  <XhSelectRoot
    :collection="options"
    label="仓位"
    placeholder="敲 M 试试"
  />
</template>
```

```html
<xh-select placeholder="敲 M 试试">
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
          <div data-xh-part="item" value="A">
            <span data-xh-part="item-text">A 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="B">
            <span data-xh-part="item-text">B 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="C">
            <span data-xh-part="item-text">C 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="D">
            <span data-xh-part="item-text">D 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="E">
            <span data-xh-part="item-text">E 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="F">
            <span data-xh-part="item-text">F 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="G">
            <span data-xh-part="item-text">G 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="H">
            <span data-xh-part="item-text">H 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="I">
            <span data-xh-part="item-text">I 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="J">
            <span data-xh-part="item-text">J 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="K">
            <span data-xh-part="item-text">K 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="L">
            <span data-xh-part="item-text">L 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="M">
            <span data-xh-part="item-text">M 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="N">
            <span data-xh-part="item-text">N 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="O">
            <span data-xh-part="item-text">O 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="P">
            <span data-xh-part="item-text">P 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="Q">
            <span data-xh-part="item-text">Q 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="R">
            <span data-xh-part="item-text">R 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="S">
            <span data-xh-part="item-text">S 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="T">
            <span data-xh-part="item-text">T 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="U">
            <span data-xh-part="item-text">U 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="V">
            <span data-xh-part="item-text">V 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="W">
            <span data-xh-part="item-text">W 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="X">
            <span data-xh-part="item-text">X 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="Y">
            <span data-xh-part="item-text">Y 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="Z">
            <span data-xh-part="item-text">Z 区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>
```

### 分组

跨分组保持键盘导航

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

超出数量合并为 +N

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
  <div data-xh-part="root">
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

### 校验

显示无效状态和错误说明

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

到达列表底部加载下一页

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

聚焦触发器

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

</script>
```

### 清空

有值时显示清空按钮

```vue
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";

const teams = [
  { value: "design", label: "设计组" },
  { value: "frontend", label: "前端组" },
  { value: "server", label: "服务端组" },
];
</script>

<template>
  <XhSelectRoot
    :collection="teams"
    :default-value="['frontend']"
    :translations="{ clearTrigger: '清空所选' }"
    clearable
    label="所属小组"
    placeholder="选一个组"
  />
</template>
```

```html
<xh-select default-value="design" placeholder="选一个组">
  <div data-xh-part="root">
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
```

### 底部操作区

固定在滚动列表下方

```vue
<script setup lang="ts">
import { PlusIcon } from "@xihan-ui/icons";
import {
  XhButton,
  XhIcon,
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
          <XhButton variant="ghost" size="sm" @click="addOne">
            <XhIcon :icon="PlusIcon" />
            新建
          </XhButton>
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
            <button data-xh-part="root" id="select-footer-add"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5V19"/><path d="M5 12H19"/></svg>新建</button>
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

### Popover + Listbox

不参与表单的选择

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

### 选项副文本

一行放不下的解释写在第 2 行

```vue
<script setup lang="ts">
import type { SelectNode } from "@xihan-ui/headless";
import { XhSelectRoot } from "@xihan-ui/vue";

const plans: SelectNode[] = [
  { value: "free", label: "免费版", description: "单人使用，保留 30 天历史" },
  { value: "team", label: "团队版", description: "最多 20 人，共享工作区与审计日志" },
  { value: "enterprise", label: "企业版", description: "单点登录、私有部署与专属支持" },
];
</script>

<template>
  <XhSelectRoot :collection="plans" :default-value="['team']" label="订阅方案" placeholder="请选择" />
</template>
```

```html
<xh-select default-value="team" placeholder="请选择">
  <div data-xh-part="root">
    <span data-xh-part="label">订阅方案</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="free">
            <span data-xh-part="item-text">免费版</span>
            <span data-xh-part="item-description">单人使用，保留 30 天历史</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="team">
            <span data-xh-part="item-text">团队版</span>
            <span data-xh-part="item-description">最多 20 人，共享工作区与审计日志</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="enterprise">
            <span data-xh-part="item-text">企业版</span>
            <span data-xh-part="item-description">单点登录、私有部署与专属支持</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>
```

### 行首与行尾

两格交给作者，文字与副文本仍由数据铺

```vue
<script setup lang="ts">
import type { SelectNode, SelectNodeMeta } from "@xihan-ui/headless";
import { XhSelectRoot } from "@xihan-ui/vue";

const states: SelectNode[] = [
  { value: "open", label: "进行中", description: "已排期，尚未合并" },
  { value: "merged", label: "已合并", description: "进入主干" },
  { value: "closed", label: "已关闭", description: "不再处理" },
];

const dot = { open: "var(--xh-fg-warning)", merged: "var(--xh-fg-success)", closed: "var(--xh-fg-muted)" };
const count = { open: 12, merged: 148, closed: 31 };
const key = (node: SelectNodeMeta): keyof typeof dot => node.value as keyof typeof dot;
</script>

<template>
  <XhSelectRoot :collection="states" :default-value="['open']" label="状态" placeholder="请选择">
    <template #item-prefix="node">
      <span :style="{ display: 'block', inlineSize: '8px', blockSize: '8px', borderRadius: 'var(--xh-shape-pill)', background: dot[key(node)] }" />
    </template>
    <template #item-suffix="node">
      <span style="color: var(--xh-fg-muted); font-size: var(--xh-control-caption-md)">{{ count[key(node)] }}</span>
    </template>
  </XhSelectRoot>
</template>
```

```html
<xh-select default-value="open" placeholder="请选择">
  <div data-xh-part="root">
    <span data-xh-part="label">状态</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="open">
            <span data-xh-part="item-prefix"><span style="display: block; inline-size: 8px; block-size: 8px; border-radius: var(--xh-shape-pill); background: var(--xh-fg-warning)"></span></span>
            <span data-xh-part="item-text">进行中</span>
            <span data-xh-part="item-description">已排期，尚未合并</span>
            <span data-xh-part="item-suffix" style="color: var(--xh-fg-muted); font-size: var(--xh-control-caption-md)">12</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="merged">
            <span data-xh-part="item-prefix"><span style="display: block; inline-size: 8px; block-size: 8px; border-radius: var(--xh-shape-pill); background: var(--xh-fg-success)"></span></span>
            <span data-xh-part="item-text">已合并</span>
            <span data-xh-part="item-description">进入主干</span>
            <span data-xh-part="item-suffix" style="color: var(--xh-fg-muted); font-size: var(--xh-control-caption-md)">148</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="closed">
            <span data-xh-part="item-prefix"><span style="display: block; inline-size: 8px; block-size: 8px; border-radius: var(--xh-shape-pill); background: var(--xh-fg-muted)"></span></span>
            <span data-xh-part="item-text">已关闭</span>
            <span data-xh-part="item-description">不再处理</span>
            <span data-xh-part="item-suffix" style="color: var(--xh-fg-muted); font-size: var(--xh-control-caption-md)">31</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>
```

## 设计指引

### 何时使用

- 从已知选项中选择一个或多个值。
- 需要分组、标签多选或异步加载。

### 何时不用

- 少量选项使用[单选组](./radio-group)。
- 可输入或可搜索场景使用[组合框](./combobox)。
- 层级选项使用[级联选择](./cascader)或[树选择](./tree-select)。
- 不参与表单的视图切换使用 [气泡卡片](./popover) 与 [列表框](./listbox)。

### 特性

- 通过 `hidden-select` 参与表单。
- 多选值可显示为标签，超出 `maxTagCount` 后合并为 `+N`。
- 支持分组、加载、空状态、底部操作区和滚动加载。
- 选项可逐条声明语气，失效或需要留意的那条自带该族字色与高亮底。
- 选项可写副文本，第 2 行放一句解释，与标题同列、走 muted 档。
- 行首与行尾两格各有逐条钩子：只想加个图标或计数，不必把整条重搭。
- 控件使用 Field Chrome，浮层使用 M2 磨砂表面。
- 选中项保留普通文字，通过末端对号表示状态。
- 关闭时立即退出交互，资源在退场动画结束后释放。

### 组合

- 与[表单字段](./field)组合。
- 不参与表单时使用 [气泡卡片](./popover) 与 [列表框](./listbox)。

### 最佳实践

- 固定触发器宽度，避免选中值改变布局。
- 选项较多或需要搜索时使用 Combobox。
- 自定义内容中的主要文字放在 `item-text` 中。

### 反模式

- 不要用 Select 承载“导出”“删除”等动作。
- 异步加载时不要省略加载和空状态。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-select>` |
| Vue 组件 | `XhSelectClearTrigger` `XhSelectContent` `XhSelectControl` `XhSelectEmpty` `XhSelectFooter` `XhSelectGroup` `XhSelectGroupLabel` `XhSelectIndicator` `XhSelectItem` `XhSelectItemDeleteTrigger` `XhSelectItemDescription` `XhSelectItemIndicator` `XhSelectItemPrefix` `XhSelectItemSuffix` `XhSelectItemText` `XhSelectLabel` `XhSelectList` `XhSelectLoading` `XhSelectOverflowTag` `XhSelectPositioner` `XhSelectRoot` `XhSelectTag` `XhSelectTagLabel` `XhSelectTagList` `XhSelectTrigger` `XhSelectValueText` |
| 组合式函数 | `useSelect` |
| 状态机 | `selectMachine` |
| 皮肤 | `@xihan-ui/styles/select.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `SelectNode[]` |  | 条目数据，显示文本与禁用的事实源。提供后条目部件只需声明 value， 显示文本也不再从 DOM 查询。未提供时回到文本写在条目中、从 DOM 查询的方式。 |
| `value` | `string \| string[] \| null` |  | 选中值。裸串是单选的简写，null 是受控且无选中，未提供（undefined）才是非受控；内部一律按数组处理。 受控时 cell 直读 prop，写入只发 onValueChange 不落内部值。 |
| `defaultValue` | `string \| string[] \| null` |  | 非受控初始选中值。与 value 同样接受裸串与 null。 |
| `multiple` | `boolean` |  | 允许选中多项。单选时选完即收起，多选时保持展开继续选。 |
| `open` | `boolean` |  | 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `disabled` | `boolean` |  | 整个控件禁用：trigger 使用原生 disabled，隐藏 select 不参与提交。 |
| `readOnly` | `boolean` |  | 只读：浮层照常展开与浏览，但选中值不可修改、也不可清空。 |
| `invalid` | `boolean` |  | 校验错误态：trigger 标红并输出 aria-invalid。 |
| `loading` | `boolean` |  | 条目加载中：列表报告 aria-busy，显示在途占位、隐藏空态占位。 |
| `translations` | `Partial<SelectTranslations>` |  | 读屏文案，默认英文。 |
| `maxTagCount` | `number` |  | 多选标签最多显示的数量，其余折叠进 overflowCount、合成 +N 标签；默认 3（SELECT_DEFAULT_MAX_TAG_COUNT）。 |
| `required` | `boolean` |  | 原生表单校验：无选中值时提交被拦截。 |
| `name` | `string` |  | 表单字段名。提供后隐藏 select 才带 name，选中值随表单一并提交。 |
| `placeholder` | `string` |  | 无选中时 value-text 显示的占位文字。 |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定触发器的描边与底色使用方式。默认 outline。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定触发器高度、内边距与字号档位。 |
| `onValueChange` | `(details: SelectValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |
| `onOpenChange` | `(details: SelectOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

### SelectNode

`collection` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 |  |
| `label` | `string` |  | 展示文本，也是连打检索的取字来源；默认回退为 value。 |
| `disabled` | `boolean` |  | 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 |
| `tone` | `Tone` |  | 该条选项自身的性质：危险选项写 danger、需要留意的写 warning。不写即与其余条目同档。 只换字色与悬停 / 按下的面，不表达选中与校验；选中的标记与禁用都压过它。 彩字不是唯一通道，要紧的差别仍要配图标或文案。整个选择器的 tone 不下发给条目。 |
| `description` | `string` |  | 副文本，写入 item-description 部件；未提供时本条不铺该部件。 它是第 2 行的说明，跟着条目走 muted 档，不跟语气；放不下一行的解释才用它， 一句话能说清的写进 label。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `SelectValueChangeDetails` | 选中值变化；detail 为 `{ value: string[] }` |
| `open-change` | `SelectOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSelectRoot` | `default` | `SelectRootSlotProps` |  |
| `XhSelectRoot` | `label` | — |  |
| `XhSelectRoot` | `item` | `SelectNodeMeta` | 只填条目的文字槽，副文本与首尾两格照旧各归各的 |
| `XhSelectRoot` | `item-prefix` | `SelectNodeMeta` | 只接管行首那一格，其余槽照旧由数据铺 |
| `XhSelectRoot` | `item-suffix` | `SelectNodeMeta` | 只接管行尾那一格（计数、徽标、次级图标），其余槽照旧由数据铺 |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhSelectGroup` | `value` | `string` | 是 |  |
| `XhSelectItem` | `value` | `string` | 是 |  |
| `XhSelectItem` | `disabled` | `boolean` |  | 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 |
| `XhSelectPositioner` | `container` | `() => Element \| null` |  | 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 |
| `XhSelectRoot` | `label` | `ReactNode` |  | 标题文字。提供后不必再写 label 部件。 |
| `XhSelectRoot` | `clearable` | `boolean` |  | 自动渲染树中是否带清空按钮；手写部件不使用它，写了节点即可清空。 |
| `XhSelectRoot` | `renderItem` | `(node: SelectNodeMeta) => ReactNode` |  | 每个条目的自定义内容；未提供时使用 collection 中的 label。 |
| `XhSelectRoot` | `renderItemPrefix` | `(node: SelectNodeMeta) => ReactNode` |  | 只接管条目行首那一格；其余槽仍由数据铺。 |
| `XhSelectRoot` | `renderItemSuffix` | `(node: SelectNodeMeta) => ReactNode` |  | 只接管条目行尾那一格；其余槽仍由数据铺。 |
| `XhSelectRoot` | `children` | `SlotChildren<SelectRootSlotProps>` |  |  |
| `XhSelectTag` | `value` | `string` | 是 | 它代表哪个选中值。 |

### 状态

公开状态写入 `data-state`。

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
| `item` | 'checked' \| 'unchecked' |
| `item-prefix` | 'checked' \| 'unchecked' |
| `item-text` | 'checked' \| 'unchecked' |
| `item-description` | 'checked' \| 'unchecked' |
| `item-suffix` | 'checked' \| 'unchecked' |
| `item-indicator` | 'checked' \| 'unchecked' |
| `empty` | 'open' \| 'closed' |
| `loading` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.HIGHLIGHT` · `HIGHLIGHT.CLEAR` · `ITEM.LOST` · `ITEM.SELECT` · `VALUE.SET` · `VALUE.CLEAR` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`isOpenControlled` · `isMultiple` · `isReadOnly` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly SelectNodeMeta[]` | 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `value` | `string[]` | 选中集合，按选中先后排列而非文档顺序。单选恒为长度 ≤ 1。 |
| `valueText` | `string[]` | 选中项的文本，与 value 逐项等长对应；某项在 DOM 中查询不到条目时该项回退为值本身。 |
| `displayText` | `string` | value-text 实际显示的文字：有选中时取其文本（多选按半角逗号加空格连接），否则取 placeholder。 |
| `multiple` | `boolean` | 是否允许多选。 |
| `invalid` | `boolean` | 校验错误态。 |
| `readOnly` | `boolean` | 只读态。 |
| `canClear` | `boolean` | 当前能否清空：有选中且既不禁用也不只读。 |
| `tags` | `SelectTagMeta[]` | 可见标签（受 maxTagCount 截断），与 value / valueText 同序。 |
| `overflowCount` | `number` | 被 maxTagCount 折叠的标签数。 |
| `overflowText` | `string` | +N 标签显示的文字（由 translations.overflowTag 计算）；没有折叠的标签时为空串。 |
| `highlightedValue` | `string \| null` | 高亮锚点；收起时为 null。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string \| string[]) => void` |  |
| `clear` | `() => void` | 清空全部选中。 |
| `deselect` | `(value: string) => void` | 移除一个选中值。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` | 触发器与清空按钮的收纳容器：两者在其中并排，有值时清空按钮替代展开指示符。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getValueTextProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getClearTriggerProps` | `() => T['button']` | 清空按钮：不占 Tab 位；无法清空时整体隐藏；点击清空全部选中、不展开浮层，焦点送回 trigger。 |
| `getTagListProps` | `() => T['element']` | 标签行：收纳可见标签与 +N 标签，放在触发器中；无选中时整体 hidden。 |
| `getTagProps` | `(props: SelectTagProps) => T['element']` | 标签：一个选中值一个，即库内 tag 的 root（data-scope="tag"）：语气、尺寸与禁用从本控件传下，形态按控件的面派生（outline / ghost / 默认使用淡底标签，subtle 使用描边标签），另带 data-value 记录代表的值。放在触发器中即纯展示（不渲染关闭按钮），放在外部配删除按钮可删除。 |
| `getTagLabelProps` | `() => T['element']` | 标签文字所在的块（tag 的 label）：截断落在这一层；标签与 +N 共用。 |
| `getOverflowTagProps` | `() => T['element']` | 被折叠的标签合成的一个：同样是 tag 的 root，显示 overflowText、带 data-count；没有折叠的标签时 hidden。 |
| `getItemDeleteTriggerProps` | `(props: SelectTagProps) => T['button']` | 标签删除按钮：即所在标签那份 tag 的 close-trigger（data-scope="tag"），可及名使用 translations.deleteItem，禁用时保留位置、原生 disabled；点击移除所在标签的选中值；须放在标签中。 |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` | 浮层外壳：描边、底色、阴影与键盘收口都在它身上。 |
| `getListProps` | `() => T['element']` | 列表框本体，滚动在这一层；role=listbox 与条目的拥有关系都归它。 |
| `getFooterProps` | `() => T['element']` | 浮层底部的操作区，是 list 的兄弟；不在列表框的拥有关系中，也不参与方向键与连打检索。 |
| `getEmptyProps` | `() => T['element']` | 空态占位：放在 content 中、list 的兄弟。 提供 collection 时由连接层按条数收放；条目手写时不写 hidden，是否显示由作者决定。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一位置，两者不同时显示：加载期间显示它，空态让位。 提供 collection 时由连接层按条数收放；条目手写时只按 loading 收放。 |
| `getGroupProps` | `(props: SelectGroupProps) => T['element']` | 分组容器：role=group，条目挂在其中；分组标题经 aria-labelledby 关联。 |
| `getGroupLabelProps` | `(props: SelectGroupProps) => T['element']` | 分组标题：不是选项、不进入导航，只作为本组的可及名。 |
| `getItemProps` | `(props: SelectItemProps) => T['element']` |  |
| `getItemPrefixProps` | `(props: SelectItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: SelectItemProps) => T['element']` |  |
| `getItemDescriptionProps` | `(props: SelectItemProps) => T['element']` |  |
| `getItemSuffixProps` | `(props: SelectItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: SelectItemProps) => T['element']` |  |
| `getHiddenSelectProps` | `() => T['select']` | 表单出口：一份视觉隐藏的原生 select，由根部件自行渲染（作者不必手写）。 选项由适配器按当前值补齐，原生提交与 required 校验据此获取值。 |

## 无障碍

### 键盘

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
| `Enter` / `Space` | held in item / clear-trigger, 未禁用、未只读 | 按住期间该部件投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，条目随浮层收起一并撤下；没有值可清时清空按钮不进 |
| `Enter` / `Space` | open, 多选, 高亮条目未禁用 | 切换高亮条目的选中态，列表不收起、焦点留在条目上 |
| `Escape` | open | 关闭列表并把焦点归还 trigger，选中值不变 |
| `Tab` / `Shift+Tab` | open | 关闭列表，焦点不归还 trigger，按 Tab 序列自然离开 |

### ARIA

以下属性由 `connect` 生成。

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
| `item-prefix` | `aria-hidden` | 'true' |
| `item-indicator` | `aria-hidden` | 'true' |
| `hidden-select` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/select.css` 使用 `[data-scope="select"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

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
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
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
| `clear-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'has-value' |
| `clear-trigger` | `data-xh-action-has-value` | ''（条件成立时才出现） |
| `clear-trigger` | `data-xh-action-profile` | 'field-inset' |
| `clear-trigger` | `data-xh-action-size` | props.size |
| `clear-trigger` | `data-xh-action-variant` | 'ghost' |
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
| `content` | `data-xh-material` | 'frosted' |
| `list` | `data-state` | 'open' \| 'closed' |
| `footer` | `data-state` | 'open' \| 'closed' |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-tone` | metaOf.get(item.value)?.tone |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-prefix` | `data-disabled` | ''（条件成立时才出现） |
| `item-prefix` | `data-state` | 'checked' \| 'unchecked' |
| `item-prefix` | `data-xh-collection-slot` | 'prefix' |
| `item-text` | `data-disabled` | ''（条件成立时才出现） |
| `item-text` | `data-state` | 'checked' \| 'unchecked' |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-description` | `data-disabled` | ''（条件成立时才出现） |
| `item-description` | `data-state` | 'checked' \| 'unchecked' |
| `item-description` | `data-xh-collection-slot` | 'description' |
| `item-suffix` | `data-disabled` | ''（条件成立时才出现） |
| `item-suffix` | `data-state` | 'checked' \| 'unchecked' |
| `item-suffix` | `data-xh-collection-slot` | 'suffix' |
| `item-indicator` | `data-disabled` | ''（条件成立时才出现） |
| `item-indicator` | `data-state` | 'checked' \| 'unchecked' |
| `item-indicator` | `data-xh-collection-slot` | 'indicator' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-state` | 'open' \| 'closed' |
| `overflow-tag` | `data-count` | String(overflowCount) |
| `tag` | `data-value` | v |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-select-action-bg` | `clear-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` | select 的 clear-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-select-action-bg-active` | `clear-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | select 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-select-action-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | select 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-select-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | select 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-select-action-fg-hover` | `clear-trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` | select 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-select-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | select 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-select-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-inset` | select 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-select-action-size` | `clear-trigger`<br>`indicator` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size`<br>`--xh-control-action-size` | select 的 clear-trigger、indicator 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-select-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `xh-material=frosted` | `--xh-_material-backdrop` | select 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-select-content-bg` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-bg` | select 的 content 部件 background 覆盖槽。 |
| `--xh-select-content-border` | `content` | `border` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-border` | select 的 content 部件 border 覆盖槽。 |
| `--xh-select-content-fg` | `content` | `color` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-fg` | select 的 content 部件 color 覆盖槽。 |
| `--xh-select-content-highlight` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-highlight` | select 的 content 部件 background 覆盖槽。 |
| `--xh-select-content-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-menu-max-h` | select 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-select-content-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` | select 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-select-content-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-menu-min-w` | select 的 content 部件 min-inline-size 覆盖槽。 |
| `--xh-select-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` | select 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-select-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` | select 的 content 部件 padding-block 覆盖槽。 |
| `--xh-select-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | select 的 content 部件 border-radius 覆盖槽。 |
| `--xh-select-content-shadow` | `content` | `box-shadow` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-shadow` | select 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-select-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` | select 的 control 部件 background-color 覆盖槽。 |
| `--xh-select-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` | select 的 control 部件 background-color 覆盖槽。 |
| `--xh-select-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` | select 的 control 部件 background-color 覆盖槽。 |
| `--xh-select-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` | select 的 control 部件 background-color 覆盖槽。 |
| `--xh-select-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` | select 的 control 部件 border 覆盖槽。 |
| `--xh-select-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` | select 的 control 部件 border-color 覆盖槽。 |
| `--xh-select-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` | select 的 control 部件 border-color 覆盖槽。 |
| `--xh-select-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` | select 的 control 部件 border-color 覆盖槽。 |
| `--xh-select-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` | select 的 control 部件 color 覆盖槽。 |
| `--xh-select-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_select-gap` | select 的 control 部件 gap 覆盖槽。 |
| `--xh-select-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_select-h` | select 的 control 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-select-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` | select 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-select-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_select-px` | select 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-select-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` | select 的 control 部件 border-radius 覆盖槽。 |
| `--xh-select-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` | select 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-select-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` | select 的 root 部件 inline-size、min-inline-size 覆盖槽。 |
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
| `--xh-select-icon-size` | `control`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | select 的 control、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-select-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-muted` | select 的 indicator 部件 color 覆盖槽。 |
| `--xh-select-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` | select 的 item 部件 background-color 覆盖槽。 |
| `--xh-select-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` | select 的 item 部件 background-color 覆盖槽。 |
| `--xh-select-item-check-fg` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=overlay`<br>`xh-collection-slot=indicator` | `--xh-_select-accent` | select 的 item 部件 color 覆盖槽。 |
| `--xh-select-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-material-frosted-fg` | select 的 item 部件 color 覆盖槽。 |
| `--xh-select-item-fg-selected` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-select-item-fg` | select 的 item 部件 color 覆盖槽。 |
| `--xh-select-item-font-size` | `item` | `font-size` | `default` | `--xh-_select-font-size` | select 的 item 部件 font-size 覆盖槽。 |
| `--xh-select-item-font-weight-selected` | `item` | `font-weight` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-font-weight-regular` | select 的 item 部件 font-weight 覆盖槽。 |
| `--xh-select-item-gap` | `item` | `margin-inline-end`<br>`margin-inline-start` | `xh-collection-slot=indicator`<br>`xh-collection-slot=prefix`<br>`xh-collection-slot=shortcut`<br>`xh-collection-slot=suffix` | `--xh-_select-gap` | select 的 item 部件 margin-inline-end、margin-inline-start 覆盖槽。 |
| `--xh-select-item-indicator-size` | `item-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | select 的 item-indicator 部件 --xh-icon-size、block-size、inline-size 覆盖槽。 |
| `--xh-select-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | select 的 item 部件 line-height 覆盖槽。 |
| `--xh-select-item-px` | `item` | `padding-inline` | `default` | `--xh-_select-item-px` | select 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-select-item-py` | `item` | `padding-block` | `default` | `--xh-_select-item-py` | select 的 item 部件 padding-block 覆盖槽。 |
| `--xh-select-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | select 的 item 部件 border-radius 覆盖槽。 |
| `--xh-select-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | select 的 label 部件 color 覆盖槽。 |
| `--xh-select-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | select 的 label 部件 color 覆盖槽。 |
| `--xh-select-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | select 的 label 部件 font-size 覆盖槽。 |
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

### 动效

动效角色：按压 · 状态 · 切换 · 出现（锚定列表）（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`rotate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
