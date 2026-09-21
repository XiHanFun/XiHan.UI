来源：https://ui.docs.xihanfun.com/components/combobox

# Combobox 组合框 `alpha`

将输入框与候选列表结合，用于搜索并选择选项。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/combobox" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/combobox.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/combobox" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/combobox" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/combobox.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

搜索并选择城市

```vue
<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "bern", label: "Bern 伯尔尼" },
  { value: "busan", label: "Busan 釜山（禁用）", disabled: true },
  { value: "london", label: "London 伦敦" },
];

const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? cities : cities.filter(c => c.label.toLowerCase().includes(q));
});
</script>

<template>
  <XhComboboxRoot
    v-model:input-value="query"
    :collection="filtered"
    clearable
    label="城市"
    empty="无匹配城市"
    open-on-click
    placeholder="搜索城市"
  />
</template>
```

```html
<xh-combobox id="combobox-basic" open-on-click placeholder="搜索城市">
  <div data-xh-part="root">
    <label data-xh-part="label">城市</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="trigger"></button>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="beijing">
          <span data-xh-part="item-text">Beijing 北京</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="berlin">
          <span data-xh-part="item-text">Berlin 柏林</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="bern">
          <span data-xh-part="item-text">Bern 伯尔尼</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="busan" aria-disabled="true">
          <span data-xh-part="item-text">Busan 釜山（禁用）</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="london">
          <span data-xh-part="item-text">London 伦敦</span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
      <div data-xh-part="empty">无匹配城市</div>
    </div>
  </div>
</xh-combobox>

<script type="module">
  const combobox = document.getElementById("combobox-basic");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const all = [...content.children];
  const labelOf = (item) => item.querySelector('[data-xh-part="item-text"]').textContent.toLowerCase();

  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren(...all.filter((item) => labelOf(item).includes(q)));
  });

</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="combobox"`：`root` · `label` · **`control`** · **`input`** · `trigger` · `clear-trigger` · `positioner` · **`content`** · `item` · `item-text` · `item-indicator` · `group` · `group-label` · `empty` · `loading` · `hidden-input`

## 示例

### 多选

选择多个城市

```vue
<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "chengdu", label: "Chengdu 成都" },
  { value: "london", label: "London 伦敦" },
];

const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? cities : cities.filter(c => c.label.toLowerCase().includes(q));
});
</script>

<template>
  <XhComboboxRoot
    v-model:input-value="query"
    :collection="filtered"
    clearable
    label="常去城市"
    empty="无匹配城市"
    multiple
    placeholder="搜索城市"
  />
</template>
```

```html
<xh-combobox id="combobox-multiple" multiple placeholder="搜索城市">
  <div data-xh-part="root">
    <label data-xh-part="label">常去城市</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="trigger"></button>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="beijing">
          <span data-xh-part="item-text">Beijing 北京</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="berlin">
          <span data-xh-part="item-text">Berlin 柏林</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="chengdu">
          <span data-xh-part="item-text">Chengdu 成都</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="london">
          <span data-xh-part="item-text">London 伦敦</span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
      <div data-xh-part="empty">无匹配城市</div>
    </div>
  </div>
</xh-combobox>

<script type="module">
  const combobox = document.getElementById("combobox-multiple");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const all = [...content.children];
  const labelOf = (item) => item.querySelector('[data-xh-part="item-text"]').textContent.toLowerCase();

  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren(...all.filter((item) => labelOf(item).includes(q)));
  });

</script>
```

### 自定义值

选择候选项或输入新值

```vue
<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const frameworks = [
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
];

const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? frameworks : frameworks.filter(f => f.label.toLowerCase().includes(q));
});
</script>

<template>
  <XhComboboxRoot
    v-model:input-value="query"
    :collection="filtered"
    clearable
    label="技术栈"
    empty="按 Enter 使用当前输入"
    allow-custom-value
    placeholder="选择或输入技术栈"
  />
</template>
```

```html
<xh-combobox id="combobox-custom-value" allow-custom-value placeholder="选择或输入技术栈">
  <div data-xh-part="root">
    <label data-xh-part="label">技术栈</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="trigger"></button>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="vue">
          <span data-xh-part="item-text">Vue</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="react">
          <span data-xh-part="item-text">React</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="svelte">
          <span data-xh-part="item-text">Svelte</span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
      <div data-xh-part="empty">按 Enter 使用当前输入</div>
    </div>
  </div>
</xh-combobox>

<script type="module">
  const combobox = document.getElementById("combobox-custom-value");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const all = [...content.children];
  const labelOf = (item) => item.querySelector('[data-xh-part="item-text"]').textContent.toLowerCase();

  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren(...all.filter((item) => labelOf(item).includes(q)));
  });

</script>
```

### 分组

按分类组织候选项

```vue
<script setup lang="ts">
import {
  XhComboboxClearTrigger,
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxEmpty,
  XhComboboxGroup,
  XhComboboxGroupLabel,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxLabel,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhComboboxTrigger,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const groups = [
  {
    value: "asia",
    label: "亚洲",
    items: [
      { value: "beijing", label: "Beijing 北京" },
      { value: "chengdu", label: "Chengdu 成都" },
    ],
  },
  {
    value: "europe",
    label: "欧洲",
    items: [
      { value: "berlin", label: "Berlin 柏林" },
      { value: "london", label: "London 伦敦" },
    ],
  },
];

const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (q === "")
    return groups;
  return groups
    .map(g => ({ ...g, items: g.items.filter(c => c.label.toLowerCase().includes(q)) }))
    .filter(g => g.items.length > 0);
});
</script>

<template>
  <XhComboboxRoot
    v-model:input-value="query"
    open-on-click
    placeholder="搜索城市"
  >
    <XhComboboxLabel>城市</XhComboboxLabel>
    <XhComboboxControl>
      <XhComboboxInput />
      <XhComboboxTrigger />
      <XhComboboxClearTrigger />
    </XhComboboxControl>
    <XhComboboxPositioner>
      <XhComboboxContent>
        <XhComboboxGroup v-for="g in filtered" :key="g.value" :value="g.value">
          <XhComboboxGroupLabel>{{ g.label }}</XhComboboxGroupLabel>
          <XhComboboxItem v-for="c in g.items" :key="c.value" :value="c.value">
            <XhComboboxItemText>{{ c.label }}</XhComboboxItemText>
            <XhComboboxItemIndicator />
          </XhComboboxItem>
        </XhComboboxGroup>
      </XhComboboxContent>
      <XhComboboxEmpty>无匹配城市</XhComboboxEmpty>
    </XhComboboxPositioner>
  </XhComboboxRoot>
</template>
```

```html
<xh-combobox id="combobox-group" open-on-click placeholder="搜索城市">
  <div data-xh-part="root">
    <label data-xh-part="label">城市</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="trigger"></button>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="group" value="asia">
          <span data-xh-part="group-label">亚洲</span>
          <div data-xh-part="item" value="beijing">
            <span data-xh-part="item-text">Beijing 北京</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="chengdu">
            <span data-xh-part="item-text">Chengdu 成都</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
        <div data-xh-part="group" value="europe">
          <span data-xh-part="group-label">欧洲</span>
          <div data-xh-part="item" value="berlin">
            <span data-xh-part="item-text">Berlin 柏林</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="london">
            <span data-xh-part="item-text">London 伦敦</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
      <div data-xh-part="empty">无匹配城市</div>
    </div>
  </div>
</xh-combobox>

<script type="module">
  const combobox = document.getElementById("combobox-group");
  const content = combobox.querySelector('[data-xh-part="content"]');
  // 分段与段内候选整份留在手上，输入串一变就按它重铺
  const labelOf = (item) => item.querySelector('[data-xh-part="item-text"]').textContent.toLowerCase();
  const groups = [...content.children].map((node) => ({
    node,
    label: node.querySelector('[data-xh-part="group-label"]'),
    items: [...node.querySelectorAll('[data-xh-part="item"]')],
  }));

  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    const shown = [];
    for (const group of groups) {
      const matched = group.items.filter((item) => labelOf(item).includes(q));
      if (matched.length === 0)
        continue;
      group.node.replaceChildren(group.label, ...matched);
      shown.push(group.node);
    }
    content.replaceChildren(...shown);
  });

</script>
```

### 变体

设置输入框外观

```vue
<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];
</script>

<template>
  <div style="display: grid; gap: 16px; justify-items: start">
    <XhComboboxRoot
      v-for="v in variants"
      :key="v"
      :variant="v"
      :collection="fruits"
      clearable
      :label="v"
      open-on-click
      placeholder="选择水果"
      style="width: 240px"
    />
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px; justify-items: start">
  <xh-combobox variant="outline" open-on-click placeholder="选择水果">
    <div data-xh-part="root" style="width: 240px">
      <label data-xh-part="label">outline</label>
      <div data-xh-part="control">
        <input data-xh-part="input" />
        <button data-xh-part="trigger"></button>
        <button data-xh-part="clear-trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
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
  </xh-combobox>

  <xh-combobox variant="subtle" open-on-click placeholder="选择水果">
    <div data-xh-part="root" style="width: 240px">
      <label data-xh-part="label">subtle</label>
      <div data-xh-part="control">
        <input data-xh-part="input" />
        <button data-xh-part="trigger"></button>
        <button data-xh-part="clear-trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
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
  </xh-combobox>

  <xh-combobox variant="ghost" open-on-click placeholder="选择水果">
    <div data-xh-part="root" style="width: 240px">
      <label data-xh-part="label">ghost</label>
      <div data-xh-part="control">
        <input data-xh-part="input" />
        <button data-xh-part="trigger"></button>
        <button data-xh-part="clear-trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
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
  </xh-combobox>
</div>
```

### 校验状态

标记无效输入

```vue
<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "chengdu", label: "Chengdu 成都" },
];
</script>

<template>
  <XhComboboxRoot
    :collection="cities"
    invalid
    label="常驻城市"
    open-on-click
    placeholder="请选择城市"
  />
</template>
```

```html
<xh-combobox invalid open-on-click placeholder="请选择城市">
  <div data-xh-part="root">
    <label data-xh-part="label">常驻城市</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="beijing"><span data-xh-part="item-text">Beijing 北京</span><span data-xh-part="item-indicator"></span></div>
        <div data-xh-part="item" value="berlin"><span data-xh-part="item-text">Berlin 柏林</span><span data-xh-part="item-indicator"></span></div>
        <div data-xh-part="item" value="chengdu"><span data-xh-part="item-text">Chengdu 成都</span><span data-xh-part="item-indicator"></span></div>
      </div>
    </div>
  </div>
</xh-combobox>
```

### 异步候选

查询远程数据

```vue
<script setup lang="ts">
import {
  XhComboboxClearTrigger,
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxEmpty,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxLabel,
  XhComboboxLoading,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhComboboxTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

interface City {
  value: string;
  label: string;
}

const pool: City[] = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "bern", label: "Bern 伯尔尼" },
  { value: "chengdu", label: "Chengdu 成都" },
  { value: "london", label: "London 伦敦" },
];

const options = ref<City[]>([]);
const loading = ref(false);
let timer = 0;

function onSearch(details: { inputValue: string }): void {
  window.clearTimeout(timer);
  const q = details.inputValue.trim().toLowerCase();
  options.value = [];
  if (q === "") {
    loading.value = false;
    return;
  }
  loading.value = true;
  timer = window.setTimeout(() => {
    options.value = pool.filter(c => c.label.toLowerCase().includes(q));
    loading.value = false;
  }, 600);
}
</script>

<template>
  <XhComboboxRoot
    :collection="options"
    :loading="loading"
    @input-value-change="onSearch"
  >
    <XhComboboxLabel>城市</XhComboboxLabel>
    <XhComboboxControl>
      <XhComboboxInput placeholder="搜索城市" />
      <XhComboboxClearTrigger />
      <XhComboboxTrigger />
    </XhComboboxControl>
    <XhComboboxPositioner>
      <XhComboboxContent>
        <XhComboboxItem v-for="city in options" :key="city.value" :value="city.value">
          <XhComboboxItemText>{{ city.label }}</XhComboboxItemText>
          <XhComboboxItemIndicator />
        </XhComboboxItem>
      </XhComboboxContent>
      <XhComboboxLoading>查询中…</XhComboboxLoading>
      <XhComboboxEmpty>无匹配城市</XhComboboxEmpty>
    </XhComboboxPositioner>
  </XhComboboxRoot>
</template>
```

```html
<xh-combobox id="combobox-async" placeholder="搜索城市">
  <div data-xh-part="root">
    <label data-xh-part="label">城市</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="trigger"></button>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content"></div>
      <div data-xh-part="loading">查询中…</div>
      <div data-xh-part="empty">无匹配城市</div>
    </div>
  </div>
</xh-combobox>

<script type="module">
  const combobox = document.getElementById("combobox-async");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const pool = [
    { value: "beijing", label: "Beijing 北京" },
    { value: "berlin", label: "Berlin 柏林" },
    { value: "bern", label: "Bern 伯尔尼" },
    { value: "chengdu", label: "Chengdu 成都" },
    { value: "london", label: "London 伦敦" },
  ];
  let timer = 0;

  function makeItem(city) {
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    item.setAttribute("value", city.value);
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = city.label;
    const indicator = document.createElement("span");
    indicator.dataset.xhPart = "item-indicator";
    item.append(text, indicator);
    return item;
  }

  combobox.addEventListener("input-value-change", (event) => {
    window.clearTimeout(timer);
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren();
    if (q === "") {
      combobox.loading = false;
      return;
    }
    combobox.loading = true;
    timer = window.setTimeout(() => {
      content.replaceChildren(
        ...pool.filter((c) => c.label.toLowerCase().includes(q)).map(makeItem),
      );
      combobox.loading = false;
    }, 600);
  });
</script>
```

### 自定义内容

在候选项中显示辅助信息

```vue
<script setup lang="ts">
import {
  XhComboboxClearTrigger,
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxEmpty,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxLabel,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhComboboxTrigger,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const mailboxes = [
  { value: "gmail", label: "name@gmail.com", note: "Google 邮箱" },
  { value: "qq", label: "name@qq.com", note: "QQ 邮箱" },
  { value: "163", label: "name@163.com", note: "网易邮箱" },
];

const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? mailboxes : mailboxes.filter(m => m.label.toLowerCase().includes(q));
});
</script>

<template>
  <XhComboboxRoot
    v-model:input-value="query"
    open-on-click
    placeholder="搜索邮箱"
  >
    <XhComboboxLabel>邮箱</XhComboboxLabel>
    <XhComboboxControl>
      <XhComboboxInput />
      <XhComboboxTrigger />
      <XhComboboxClearTrigger />
    </XhComboboxControl>
    <XhComboboxPositioner>
      <XhComboboxContent>
        <XhComboboxItem v-for="m in filtered" :key="m.value" :value="m.value">
          <XhComboboxItemText>
            <span style="display: flex; flex-direction: column; gap: 2px">
              <span>{{ m.label }}</span>
              <small style="color: var(--xh-fg-muted)">{{ m.note }}</small>
            </span>
          </XhComboboxItemText>
          <XhComboboxItemIndicator />
        </XhComboboxItem>
      </XhComboboxContent>
      <XhComboboxEmpty>没有匹配的邮箱</XhComboboxEmpty>
    </XhComboboxPositioner>
  </XhComboboxRoot>
</template>
```

```html
<xh-combobox id="combobox-custom-content" open-on-click placeholder="搜索邮箱">
  <div data-xh-part="root">
    <label data-xh-part="label">邮箱</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="trigger"></button>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="gmail" data-label="name@gmail.com">
          <span data-xh-part="item-text">
            <span style="display: flex; flex-direction: column; gap: 2px">
              <span>name@gmail.com</span>
              <small style="color: var(--xh-fg-muted)">Google 邮箱</small>
            </span>
          </span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="qq" data-label="name@qq.com">
          <span data-xh-part="item-text">
            <span style="display: flex; flex-direction: column; gap: 2px">
              <span>name@qq.com</span>
              <small style="color: var(--xh-fg-muted)">QQ 邮箱</small>
            </span>
          </span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="163" data-label="name@163.com">
          <span data-xh-part="item-text">
            <span style="display: flex; flex-direction: column; gap: 2px">
              <span>name@163.com</span>
              <small style="color: var(--xh-fg-muted)">网易邮箱</small>
            </span>
          </span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
      <div data-xh-part="empty">没有匹配的邮箱</div>
    </div>
  </div>
</xh-combobox>

<script type="module">
  const combobox = document.getElementById("combobox-custom-content");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const all = [...content.children];

  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren(
      ...all.filter((item) => item.dataset.label.toLowerCase().includes(q)),
    );
  });

</script>
```

## 设计指引

### 何时使用

- 选项较多，需要通过输入快速筛选。
- 候选来自远程数据或允许输入自定义值。

### 何时不用

- 选项固定且不多时，使用[选择器](./select)。
- 在正文中插入引用时，使用[提及](./mention)。
- 输入一组自由标签时，使用[标签输入](./tags-input)。

### 特性

- 支持单选、多选、分组和自定义值。
- 输入值、选中值与展开状态均可独立受控。
- `loading` 与 `empty` 分别表示加载和空结果。
- 支持自定义过滤、异步候选和自定义条目内容。
- 通过隐藏输入参与原生表单提交。

### 组合

- 放进[表单字段](./field)获得标签、说明与错误信息，字段状态会接到输入框上。
- 候选列表是常驻的[列表框](./listbox)收进浮层的形态；选项固定且不需要输入时换成[选择器](./select)。
- 多选时的已选项可用[标签组](./tag-group)排在输入框前。

### 最佳实践

- 为异步查询提供加载和空结果反馈。
- 远程过滤应使用防抖，并取消过期请求。
- 允许自定义值时，明确提示 Enter 会采用当前输入。
- 使用标签说明字段含义，使用占位文本提示搜索方式。

### 反模式

- 未经说明就接受候选列表之外的值。
- 每次按键都立即发起远程请求。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-combobox>` |
| Vue 组件 | `XhComboboxClearTrigger` `XhComboboxContent` `XhComboboxControl` `XhComboboxEmpty` `XhComboboxGroup` `XhComboboxGroupLabel` `XhComboboxHiddenInput` `XhComboboxInput` `XhComboboxItem` `XhComboboxItemIndicator` `XhComboboxItemText` `XhComboboxLabel` `XhComboboxLoading` `XhComboboxPositioner` `XhComboboxRoot` `XhComboboxTrigger` |
| 组合式函数 | `useCombobox` |
| 状态机 | `comboboxMachine` |
| 皮肤 | `@xihan-ui/styles/combobox.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ComboboxNode[]` |  | 候选数据，显示文本与禁用的事实源。过滤仍由调用方完成：传入的即当前应显示的候选。 提供后条目部件只需声明 value，显示文本也不再从 DOM 查询。 未提供时回到文本写在条目中、从 DOM 查询的方式。 |
| `value` | `string \| string[]` |  | 选中值。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 单选写为裸串是简写，内部一律归一为数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `inputValue` | `string` |  | 输入框中的字符串。提供即受控，与选中值各自独立。 过滤不由组件完成：调用方用该串筛选条目，把筛选结果重新渲染进来。 |
| `defaultInputValue` | `string` |  |  |
| `open` | `boolean` |  | 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；hidden-input 按选中值逐个生成同名字段，不使用分隔符编码。 |
| `form` | `string` |  | 原生表单 ID；显式关联外部表单，提交与 reset 使用同一所有者。 |
| `multiple` | `boolean` |  |  |
| `disabled` | `boolean` |  | 整个控件禁用：输入框与两个按钮都使用原生 disabled。 |
| `readOnly` | `boolean` |  | 只读：文字可选可复制，但展开、选中、清空一概不发生。 |
| `invalid` | `boolean` |  | 校验失败：输入框报告 aria-invalid，各角色节点带 data-invalid。 |
| `loading` | `boolean` |  | 候选加载中：列表报告 aria-busy，显示在途占位、隐藏空态占位。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `placeholder` | `string` |  | 输入框占位文字。 |
| `translations` | `Partial<ComboboxTranslations>` |  | 读屏文案；未提供的键使用英文默认值。 |
| `allowCustomValue` | `boolean` |  | 允许提交候选列表中没有的值（回车与失焦时把输入串本身收为选中值）。 |
| `openOnClick` | `boolean` |  | 点击输入框即展开，默认 false（只有触发按钮与方向键展开）。 |
| `inputBehavior` | `ComboboxInputBehavior` |  | 输入行为，默认 none。 |
| `placement` | `Placement` |  |  |
| `dir` | `Direction` |  | 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入行的描边与底色使用方式。默认 outline。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定输入行高度、内边距与字号档位。 |
| `onValueChange` | `(details: ComboboxValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |
| `onInputValueChange` | `(details: ComboboxInputValueChangeDetails) => void` |  | 输入串变化回调：调用方据此重新过滤候选。 |
| `onOpenChange` | `(details: ComboboxOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ComboboxValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `input-value-change` | `ComboboxInputValueChangeDetails` | 输入串变化；detail 为 `{ inputValue: string }`，作者据此过滤候选 |
| `open-change` | `ComboboxOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhComboboxRoot` | `default` | `ComboboxRootSlotProps` |  |
| `XhComboboxRoot` | `label` | — |  |
| `XhComboboxRoot` | `empty` | — |  |
| `XhComboboxRoot` | `item` | `ComboboxNodeMeta` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `input` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `item` | 'checked' \| 'unchecked' |
| `item-text` | 'checked' \| 'unchecked' |
| `item-indicator` | 'checked' \| 'unchecked' |
| `empty` | 'open' \| 'closed' |
| `loading` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ESCAPE` · `INPUT.CHANGE` · `INPUT.SET` · `INPUT.BLUR` · `ITEM.HIGHLIGHT` · `HIGHLIGHT.CLEAR` · `ITEM.SELECT` · `VALUE.COMMIT` · `VALUE.SET` · `VALUE.CLEAR` · `ITEMS.SYNC` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`isOpenControlled` · `isMultiple` · `hasHighlight` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly ComboboxNodeMeta[]` | 由 collection 推导的候选元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `value` | `string[]` | 选中集合；单选模式下长度 ≤ 1，形状不随模式变化。 |
| `inputValue` | `string` | 输入框中的字符串。 |
| `valueText` | `string \| null` | 单选选中项的显示文本；无选中或多选时为 null。 |
| `highlightedValue` | `string \| null` | 高亮候选；收起时为 null。焦点不在它身上，只经 aria-activedescendant 上报。 |
| `multiple` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `empty` | `boolean` | 候选为空（已结算且条数为 0）且当前展开：empty 角色节点据此显示。 |
| `canClear` | `boolean` | 清空按钮当前是否可按。 |
| `isSelected` | `(value: string) => boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[]) => void` |  |
| `setInputValue` | `(next: string) => void` |  |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getInputProps` | `(props?: ComboboxInputProps) => T['input']` | 不传参即单行 input，产出与增加此参数前逐字相同。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getGroupProps` | `(props: ComboboxGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: ComboboxGroupProps) => T['element']` |  |
| `getItemProps` | `(props: ComboboxItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: ComboboxItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: ComboboxItemProps) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` |  |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一位置，两者不同时显示：加载期间显示它，空态让位。 与 content 是兄弟，同样不进入 role=listbox。 |
| `getHiddenInputProps` | `(props: { value: string }) => T['input']` | 单值表单出口；按 api.value 逐个调用并生成同名 input，零选中不生成提交项。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowDown` | closed, focus in input | 展开候选列表并把高亮落到首个可选候选 |
| `ArrowUp` | closed, focus in input | 展开候选列表并把高亮落到末个可选候选 |
| `Alt+ArrowDown` | closed, focus in input | 展开候选列表但不预选任何候选 |
| `ArrowDown` | open | 高亮移到下一个候选（禁用项跳过、尽头按 loop 回绕），焦点不动 |
| `ArrowUp` | open | 高亮移到上一个候选（禁用项跳过、尽头按 loop 回绕），焦点不动 |
| `Home` | open | 高亮移到首个可选候选；收起态不接管，光标照常跳到行首 |
| `End` | open | 高亮移到末个可选候选；收起态不接管，光标照常跳到行尾 |
| `Enter` | open, 有高亮且未禁用 | 选中高亮候选：单选把输入串换成它的文本并收起，多选把它并入集合、清空输入串且不收起 |
| `Enter` | open, 有高亮且未禁用、未只读、未加载，按住 | 按住期间高亮候选投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，候选随浮层收起一并撤下。展开钮与清空钮在焦点落到自己身上时由 Enter / Space 按住投影，没有东西可清时清空钮不进 |
| `Enter` | open, 无高亮且 allowCustomValue | 把输入串本身收成选中值 |
| `Escape` | open | 先清除高亮；高亮已空时才收起列表，选中值不变 |
| `Alt+ArrowUp` | open | 收起列表，选中值不变 |
| `Tab` / `Shift+Tab` | open | 收起列表且不拦按键，焦点按 Tab 序列自然离开 |
| `Backspace` | multiple, 输入串为空且已有选中 | 删掉最后一个已选项 |
| `可打印字符` | focus in input | 改写输入串并展开列表；过滤由调用方按 onInputValueChange 自己做 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-activedescendant` | `item` 部件的 id \| undefined |
| `input` | `aria-autocomplete` | 'both' \| 'list' |
| `input` | `aria-controls` | `content` 部件的 id |
| `input` | `aria-expanded` | undefined \| 'true' \| 'false' |
| `input` | `aria-haspopup` | 'listbox' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `input` | `role` | undefined \| 'combobox' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-label` | props.translations.trigger |
| `clear-trigger` | `aria-label` | props.translations.clearTrigger |
| `content` | `aria-busy` | 'true' \| undefined |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-labelledby` | `label` 部件的 id |
| `content` | `aria-multiselectable` | 'true' \| 'false' |
| `content` | `role` | 'listbox' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-indicator` | `aria-hidden` | 'true' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `empty` | `role` | 'status' |
| `loading` | `role` | 'status' |

## 样式参考

### 皮肤

`@xihan-ui/styles/combobox.css` 使用 `[data-scope="combobox"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

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
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-readonly` | ''（条件成立时才出现） |
| `input` | `data-state` | 'open' \| 'closed' |
| `input` | `data-xh-field-input` | '' |
| `input` | `data-xh-field-layout` | 'textarea' \| 'single-line' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-pressed` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'field-inset' |
| `trigger` | `data-xh-action-size` | props.size |
| `trigger` | `data-xh-action-variant` | 'ghost' |
| `clear-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'has-value' |
| `clear-trigger` | `data-xh-action-has-value` | ''（条件成立时才出现） |
| `clear-trigger` | `data-xh-action-profile` | 'field-inset' |
| `clear-trigger` | `data-xh-action-size` | props.size |
| `clear-trigger` | `data-xh-action-variant` | 'ghost' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-text` | `data-disabled` | ''（条件成立时才出现） |
| `item-text` | `data-highlighted` | ''（条件成立时才出现） |
| `item-text` | `data-state` | 'checked' \| 'unchecked' |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-indicator` | `data-disabled` | ''（条件成立时才出现） |
| `item-indicator` | `data-highlighted` | ''（条件成立时才出现） |
| `item-indicator` | `data-state` | 'checked' \| 'unchecked' |
| `item-indicator` | `data-xh-collection-slot` | 'indicator' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-combobox-action-bg` | `clear-trigger`<br>`trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | combobox 的 clear-trigger、trigger 部件 background-color 覆盖槽。 |
| `--xh-combobox-action-bg-active` | `clear-trigger`<br>`trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | combobox 的 clear-trigger、trigger 部件 background-color 覆盖槽。 |
| `--xh-combobox-action-bg-hover` | `clear-trigger`<br>`trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | combobox 的 clear-trigger、trigger 部件 background-color 覆盖槽。 |
| `--xh-combobox-action-fg` | `clear-trigger`<br>`trigger` | `color` | `default` | `--xh-fg-muted` | combobox 的 clear-trigger、trigger 部件 color 覆盖槽。 |
| `--xh-combobox-action-fg-hover` | `clear-trigger`<br>`trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` | combobox 的 clear-trigger、trigger 部件 color 覆盖槽。 |
| `--xh-combobox-action-font-size` | `clear-trigger`<br>`trigger` | `font-size` | `default` | `--xh-text-secondary-size` | combobox 的 clear-trigger、trigger 部件 font-size 覆盖槽。 |
| `--xh-combobox-action-radius` | `clear-trigger`<br>`trigger` | `border-radius` | `default` | `--xh-shape-inset` | combobox 的 clear-trigger、trigger 部件 border-radius 覆盖槽。 |
| `--xh-combobox-action-size` | `clear-trigger`<br>`trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` | combobox 的 clear-trigger、trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-combobox-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | combobox 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-combobox-content-bg` | `content` | `background` | `default` | `--xh-material-frosted-bg` | combobox 的 content 部件 background 覆盖槽。 |
| `--xh-combobox-content-border` | `content` | `border` | `default` | `--xh-material-frosted-border` | combobox 的 content 部件 border 覆盖槽。 |
| `--xh-combobox-content-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | combobox 的 content 部件 color 覆盖槽。 |
| `--xh-combobox-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` | combobox 的 content 部件 gap 覆盖槽。 |
| `--xh-combobox-content-highlight` | `content` | `background` | `default` | `--xh-material-frosted-highlight` | combobox 的 content 部件 background 覆盖槽。 |
| `--xh-combobox-content-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` | combobox 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-combobox-content-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` | combobox 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-combobox-content-min-h` | `content` | `min-block-size` | `default` | `--xh-_combobox-h` | combobox 的 content 部件 min-block-size 覆盖槽。 |
| `--xh-combobox-content-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-min-w` | combobox 的 content 部件 min-inline-size 覆盖槽。 |
| `--xh-combobox-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` | combobox 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-combobox-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` | combobox 的 content 部件 padding-block 覆盖槽。 |
| `--xh-combobox-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | combobox 的 content 部件 border-radius 覆盖槽。 |
| `--xh-combobox-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | combobox 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-combobox-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` | combobox 的 control 部件 background-color 覆盖槽。 |
| `--xh-combobox-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` | combobox 的 control 部件 background-color 覆盖槽。 |
| `--xh-combobox-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` | combobox 的 control 部件 background-color 覆盖槽。 |
| `--xh-combobox-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` | combobox 的 control 部件 background-color 覆盖槽。 |
| `--xh-combobox-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` | combobox 的 control 部件 border 覆盖槽。 |
| `--xh-combobox-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` | combobox 的 control 部件 border-color 覆盖槽。 |
| `--xh-combobox-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` | combobox 的 control 部件 border-color 覆盖槽。 |
| `--xh-combobox-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` | combobox 的 control 部件 border-color 覆盖槽。 |
| `--xh-combobox-control-fg` | `control`<br>`input` | `color` | `xh-field-chrome`<br>`xh-field-input` | `--xh-fg-default` | combobox 的 control、input 部件 color 覆盖槽。 |
| `--xh-combobox-control-gap` | `control` | `gap` | `xh-field-chrome` | `--xh-_combobox-gap` | combobox 的 control 部件 gap 覆盖槽。 |
| `--xh-combobox-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_combobox-h` | combobox 的 control 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-combobox-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` | combobox 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-combobox-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_combobox-px` | combobox 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-combobox-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` | combobox 的 control 部件 border-radius 覆盖槽。 |
| `--xh-combobox-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` | combobox 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-combobox-empty-fg` | `empty` | `color` | `default` | `--xh-material-frosted-fg-muted` | combobox 的 empty 部件 color 覆盖槽。 |
| `--xh-combobox-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_combobox-font-size` | combobox 的 empty 部件 font-size 覆盖槽。 |
| `--xh-combobox-empty-px` | `empty` | `padding-inline` | `default` | `--xh-control-px-md` | combobox 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-combobox-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` | combobox 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-combobox-gap` | `root` | `gap` | `default` | `--xh-space-1` | combobox 的 root 部件 gap 覆盖槽。 |
| `--xh-combobox-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | combobox 的 group 部件 gap 覆盖槽。 |
| `--xh-combobox-group-label-fg` | `group-label` | `color` | `default` | `--xh-material-frosted-fg-muted` | combobox 的 group-label 部件 color 覆盖槽。 |
| `--xh-combobox-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | combobox 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-combobox-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | combobox 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-combobox-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-control-px-md` | combobox 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-combobox-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | combobox 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-combobox-group-spacing` | `group` | `margin-block-start` | `default` | `--xh-space-1_5` | combobox 的 group 部件 margin-block-start 覆盖槽。 |
| `--xh-combobox-icon-size` | `control`<br>`positioner`<br>`root` | `--xh-icon-size` | `is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | combobox 的 control、positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-combobox-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-bg-canvas` | combobox 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-combobox-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill`<br>`xh-field-input` | `--xh-fg-default` | combobox 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-combobox-input-fg` | `input` | `color` | `xh-field-input` | `--xh-combobox-control-fg` | combobox 的 input 部件 color 覆盖槽。 |
| `--xh-combobox-input-font-size` | `input` | `font-size` | `xh-field-input` | `--xh-_combobox-font-size` | combobox 的 input 部件 font-size 覆盖槽。 |
| `--xh-combobox-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` | combobox 的 item 部件 background-color 覆盖槽。 |
| `--xh-combobox-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` | combobox 的 item 部件 background-color 覆盖槽。 |
| `--xh-combobox-item-check-fg` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=overlay`<br>`xh-collection-slot=indicator` | `--xh-combobox-item-indicator-fg` | combobox 的 item 部件 color 覆盖槽。 |
| `--xh-combobox-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-material-frosted-fg` | combobox 的 item 部件 color 覆盖槽。 |
| `--xh-combobox-item-fg-selected` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-combobox-item-fg` | combobox 的 item 部件 color 覆盖槽。 |
| `--xh-combobox-item-font-size` | `item` | `font-size` | `default` | `--xh-_combobox-font-size` | combobox 的 item 部件 font-size 覆盖槽。 |
| `--xh-combobox-item-font-weight-selected` | `item` | `font-weight` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-font-weight-regular` | combobox 的 item 部件 font-weight 覆盖槽。 |
| `--xh-combobox-item-gap` | `item` | `margin-inline-end`<br>`margin-inline-start` | `xh-collection-slot=indicator`<br>`xh-collection-slot=prefix`<br>`xh-collection-slot=shortcut`<br>`xh-collection-slot=suffix` | `--xh-_combobox-gap` | combobox 的 item 部件 margin-inline-end、margin-inline-start 覆盖槽。 |
| `--xh-combobox-item-indicator-fg` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=overlay`<br>`xh-collection-slot=indicator` | `--xh-_combobox-accent` | combobox 的 item 部件 color 覆盖槽。 |
| `--xh-combobox-item-indicator-size` | `item-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | combobox 的 item-indicator 部件 --xh-icon-size、block-size、inline-size 覆盖槽。 |
| `--xh-combobox-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | combobox 的 item 部件 line-height 覆盖槽。 |
| `--xh-combobox-item-px` | `item` | `padding-inline` | `default` | `--xh-_combobox-item-px` | combobox 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-combobox-item-py` | `item` | `padding-block` | `default` | `--xh-_combobox-item-py` | combobox 的 item 部件 padding-block 覆盖槽。 |
| `--xh-combobox-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | combobox 的 item 部件 border-radius 覆盖槽。 |
| `--xh-combobox-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | combobox 的 label 部件 color 覆盖槽。 |
| `--xh-combobox-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | combobox 的 label 部件 color 覆盖槽。 |
| `--xh-combobox-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | combobox 的 label 部件 font-size 覆盖槽。 |
| `--xh-combobox-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | combobox 的 label 部件 font-weight 覆盖槽。 |
| `--xh-combobox-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | combobox 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-combobox-loading-fg` | `loading` | `color` | `default` | `--xh-material-frosted-fg-muted` | combobox 的 loading 部件 color 覆盖槽。 |
| `--xh-combobox-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_combobox-font-size` | combobox 的 loading 部件 font-size 覆盖槽。 |
| `--xh-combobox-loading-px` | `loading` | `padding-inline` | `default` | `--xh-control-px-md` | combobox 的 loading 部件 padding-inline 覆盖槽。 |
| `--xh-combobox-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` | combobox 的 loading 部件 padding-block 覆盖槽。 |
| `--xh-combobox-placeholder-fg` | `input` | `color` | `placeholder`<br>`xh-field-input` | `--xh-fg-subtle` | combobox 的 input 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

共享关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`rotate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
