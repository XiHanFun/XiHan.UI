来源：https://ui.docs.xihanfun.com/components/combobox

# Combobox `组合框`

能打字过滤的选择器：输入框加候选浮层，可以只从候选里选，也可以允许自由文本。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/combobox" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/combobox.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/combobox" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/combobox" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/combobox.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

过滤由宿主自己算：组件把输入串交出来，此刻显示哪几条候选由调用方定

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

const value = ref<string[]>([]);
const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? cities : cities.filter(c => c.label.toLowerCase().includes(q));
});
</script>

<template>
  <XhComboboxRoot
    v-model:value="value"
    v-model:input-value="query"
    :collection="filtered"
    clearable
    label="城市"
    empty="无匹配城市"
    open-on-click
    placeholder="输入城市名筛选"
  />
  <p>当前值：{{ value[0] ?? "（未选）" }}</p>
</template>
```

```html
<xh-combobox id="combobox-basic" open-on-click placeholder="输入城市名筛选">
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
<p>当前值：<span id="combobox-basic-value">（未选）</span></p>

<script type="module">
  const combobox = document.getElementById("combobox-basic");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const readout = document.getElementById("combobox-basic-value");
  // 候选整份留在手上，输入串一变就按它重铺
  const all = [...content.children];
  const labelOf = (item) => item.querySelector('[data-xh-part="item-text"]').textContent.toLowerCase();

  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren(...all.filter((item) => labelOf(item).includes(q)));
  });

  combobox.addEventListener("value-change", (event) => {
    combobox.value = event.detail.value;
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
</script>
```

## 示例

### 多选

选完不收起、输入串自动清空，候选立刻回到全集；框里空着时退格删掉最后一个已选项

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

const value = ref<string[]>([]);
const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? cities : cities.filter(c => c.label.toLowerCase().includes(q));
});
</script>

<template>
  <XhComboboxRoot
    v-model:value="value"
    v-model:input-value="query"
    :collection="filtered"
    clearable
    label="常去城市"
    empty="无匹配城市"
    multiple
    placeholder="挑几个城市"
  />
  <p>已选：{{ value.length ? value.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-combobox id="combobox-multiple" multiple placeholder="挑几个城市">
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
<p>已选：<span id="combobox-multiple-value">（无）</span></p>

<script type="module">
  const combobox = document.getElementById("combobox-multiple");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const readout = document.getElementById("combobox-multiple-value");
  // 候选整份留在手上，输入串一变就按它重铺
  const all = [...content.children];
  const labelOf = (item) => item.querySelector('[data-xh-part="item-text"]').textContent.toLowerCase();

  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren(...all.filter((item) => labelOf(item).includes(q)));
  });

  combobox.addEventListener("value-change", (event) => {
    combobox.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 允许自由文本

allow-custom-value 让没匹配上候选的输入也能落值，适合标签、邮箱这类开放集合

```vue
<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const frameworks = [
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
];

const value = ref<string[]>([]);
const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? frameworks : frameworks.filter(f => f.label.toLowerCase().includes(q));
});
</script>

<template>
  <XhComboboxRoot
    v-model:value="value"
    v-model:input-value="query"
    :collection="filtered"
    clearable
    label="技术栈"
    empty="没有候选，按 Enter 直接用这串文本"
    allow-custom-value
    placeholder="选一个或直接打字"
  />
  <p>当前值：{{ value[0] ?? "（未选）" }}</p>
</template>
```

```html
<xh-combobox id="combobox-custom-value" allow-custom-value placeholder="选一个或直接打字">
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
      <div data-xh-part="empty">没有候选，按 Enter 直接用这串文本</div>
    </div>
  </div>
</xh-combobox>
<p>当前值：<span id="combobox-custom-value-readout">（未选）</span></p>

<script type="module">
  const combobox = document.getElementById("combobox-custom-value");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const readout = document.getElementById("combobox-custom-value-readout");
  // 候选整份留在手上，输入串一变就按它重铺
  const all = [...content.children];
  const labelOf = (item) => item.querySelector('[data-xh-part="item-text"]').textContent.toLowerCase();

  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren(...all.filter((item) => labelOf(item).includes(q)));
  });

  combobox.addEventListener("value-change", (event) => {
    combobox.value = event.detail.value;
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
</script>
```

### 分组

候选分段展示；整段被筛空时连同段标题一起不渲染，列表里不留空壳

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

const value = ref<string[]>([]);
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
    v-model:value="value"
    v-model:input-value="query"
    open-on-click
    placeholder="按大洲分组"
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
  <p>当前值：{{ value[0] ?? "（未选）" }}</p>
</template>
```

```html
<xh-combobox id="combobox-group" open-on-click placeholder="按大洲分组">
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
<p>当前值：<span id="combobox-group-value">（未选）</span></p>

<script type="module">
  const combobox = document.getElementById("combobox-group");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const readout = document.getElementById("combobox-group-value");
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

  combobox.addEventListener("value-change", (event) => {
    combobox.value = event.detail.value;
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
</script>
```

### 形态

variant 只改输入行的底色与描边用法，取值、过滤与键盘行为都不变

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

### 语气

tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，只看语气这一轴

```vue
<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhComboboxRoot
      v-for="t in tones"
      :key="t"
      variant="subtle"
      :tone="t"
      :collection="fruits"
      clearable
      :label="t"
      open-on-click
      placeholder="选择水果"
      style="width: 200px"
    />
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-combobox variant="subtle" tone="brand" open-on-click placeholder="选择水果">
    <div data-xh-part="root" style="width: 200px">
      <label data-xh-part="label">brand</label>
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

  <xh-combobox variant="subtle" tone="neutral" open-on-click placeholder="选择水果">
    <div data-xh-part="root" style="width: 200px">
      <label data-xh-part="label">neutral</label>
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

  <xh-combobox variant="subtle" tone="success" open-on-click placeholder="选择水果">
    <div data-xh-part="root" style="width: 200px">
      <label data-xh-part="label">success</label>
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

  <xh-combobox variant="subtle" tone="warning" open-on-click placeholder="选择水果">
    <div data-xh-part="root" style="width: 200px">
      <label data-xh-part="label">warning</label>
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

  <xh-combobox variant="subtle" tone="danger" open-on-click placeholder="选择水果">
    <div data-xh-part="root" style="width: 200px">
      <label data-xh-part="label">danger</label>
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

  <xh-combobox variant="subtle" tone="info" open-on-click placeholder="选择水果">
    <div data-xh-part="root" style="width: 200px">
      <label data-xh-part="label">info</label>
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

### 尺寸

不传 size 即默认档；行高、内边距与字号一起换档，浮层里的候选也跟着变

```vue
<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";

const sizes = [
  { size: "sm", label: "sm" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "lg" },
];

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px">
    <XhComboboxRoot
      v-for="s in sizes"
      :key="s.label"
      :size="s.size"
      :collection="fruits"
      clearable
      :label="s.label"
      open-on-click
      placeholder="选择水果"
      style="width: 200px"
    />
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px">
  <xh-combobox size="sm" open-on-click placeholder="选择水果">
    <div data-xh-part="root" style="width: 200px">
      <label data-xh-part="label">sm</label>
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

  <xh-combobox open-on-click placeholder="选择水果">
    <div data-xh-part="root" style="width: 200px">
      <label data-xh-part="label">默认</label>
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

  <xh-combobox size="lg" open-on-click placeholder="选择水果">
    <div data-xh-part="root" style="width: 200px">
      <label data-xh-part="label">lg</label>
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

### 受控展开

传了 open 就由宿主说了算：组件只报展开意图，这里满两个字符才真的把浮层放出来

```vue
<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "bern", label: "Bern 伯尔尼" },
  { value: "london", label: "London 伦敦" },
];

const value = ref<string[]>([]);
const query = ref("");
const wantOpen = ref(false);
// 组件的展开意图与输入长度两个条件都满足才展开
const open = computed(() => wantOpen.value && query.value.trim().length >= 2);
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? cities : cities.filter(c => c.label.toLowerCase().includes(q));
});

function onOpenChange(details: { open: boolean }): void {
  wantOpen.value = details.open;
}
</script>

<template>
  <XhComboboxRoot
    v-model:value="value"
    v-model:input-value="query"
    :collection="filtered"
    clearable
    :open="open"
    label="城市"
    empty="无匹配城市"
    placeholder="至少输入两个字符"
    @open-change="onOpenChange"
  />
  <p>浮层：{{ open ? "展开" : "收起" }} · 当前值：{{ value[0] ?? "（未选）" }}</p>
</template>
```

```html
<xh-combobox id="combobox-controlled-open" placeholder="至少输入两个字符">
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
        <div data-xh-part="item" value="london">
          <span data-xh-part="item-text">London 伦敦</span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
      <div data-xh-part="empty">无匹配城市</div>
    </div>
  </div>
</xh-combobox>
<p>
  浮层：<span id="combobox-controlled-open-state">收起</span> · 当前值：<span
    id="combobox-controlled-open-value"
    >（未选）</span
  >
</p>

<script type="module">
  const combobox = document.getElementById("combobox-controlled-open");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const state = document.getElementById("combobox-controlled-open-state");
  const readout = document.getElementById("combobox-controlled-open-value");
  const all = [...content.children];
  const labelOf = (item) => item.querySelector('[data-xh-part="item-text"]').textContent.toLowerCase();
  let wantOpen = false;
  let query = "";

  // 写上 open 即转受控，从此展开与否只看这里的结论
  combobox.open = false;

  // 组件的展开意图与输入长度两个条件都满足才展开
  function sync() {
    const open = wantOpen && query.trim().length >= 2;
    combobox.open = open;
    state.textContent = open ? "展开" : "收起";
  }

  combobox.addEventListener("open-change", (event) => {
    wantOpen = event.detail.open;
    sync();
  });

  combobox.addEventListener("input-value-change", (event) => {
    query = event.detail.inputValue;
    const q = query.trim().toLowerCase();
    content.replaceChildren(...all.filter((item) => labelOf(item).includes(q)));
    sync();
  });

  combobox.addEventListener("value-change", (event) => {
    combobox.value = event.detail.value;
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
</script>
```

### 选中后清空输入

选中值一变就把输入串清掉，候选立刻回到全集，接着挑下一个不用先删字

```vue
<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";
import { computed, ref, watch } from "vue";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "chengdu", label: "Chengdu 成都" },
  { value: "london", label: "London 伦敦" },
];

const value = ref<string[]>([]);
const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? cities : cities.filter(c => c.label.toLowerCase().includes(q));
});
const picked = computed(() => cities.find(c => c.value === value.value[0]) ?? null);

// 输入串受控，选中值一落地就把它清成空串
watch(value, () => {
  query.value = "";
});
</script>

<template>
  <XhComboboxRoot
    v-model:value="value"
    v-model:input-value="query"
    :collection="filtered"
    clearable
    label="城市"
    empty="无匹配城市"
    open-on-click
    placeholder="选完接着挑下一个"
  />
  <p>当前值：{{ picked?.label ?? "（未选）" }}</p>
</template>
```

```html
<xh-combobox id="combobox-clear-after-select" open-on-click placeholder="选完接着挑下一个">
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
<p>当前值：<span id="combobox-clear-after-select-value">（未选）</span></p>

<script type="module">
  const combobox = document.getElementById("combobox-clear-after-select");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const readout = document.getElementById("combobox-clear-after-select-value");
  const all = [...content.children];
  const labelOf = (item) => item.querySelector('[data-xh-part="item-text"]').textContent.toLowerCase();

  // 写上 input-value 即转受控，输入串此后只认这里写进去的那一份
  combobox.inputValue = "";

  function filter(text) {
    const q = text.trim().toLowerCase();
    content.replaceChildren(...all.filter((item) => labelOf(item).includes(q)));
  }

  combobox.addEventListener("input-value-change", (event) => {
    combobox.inputValue = event.detail.inputValue;
    filter(event.detail.inputValue);
  });

  combobox.addEventListener("value-change", (event) => {
    combobox.value = event.detail.value;
    const picked = all.find((item) => item.getAttribute("value") === event.detail.value[0]);
    readout.textContent = picked
      ? picked.querySelector('[data-xh-part="item-text"]').textContent
      : "（未选）";
    // 选中值一落地就把输入串清成空串，候选回到全集
    queueMicrotask(() => {
      combobox.inputValue = "";
      filter("");
    });
  });
</script>
```

### 校验状态

invalid 让输入行报 aria-invalid、描边转告警色；选出值后判定自己撤掉

```vue
<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";
import { computed, ref } from "vue";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "chengdu", label: "Chengdu 成都" },
];

const value = ref<string[]>([]);
const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? cities : cities.filter(c => c.label.toLowerCase().includes(q));
});
// 校验归宿主，组件只负责把这个结论铺成属性
const invalid = computed(() => value.value.length === 0);
</script>

<template>
  <XhComboboxRoot
    v-model:value="value"
    v-model:input-value="query"
    :collection="filtered"
    clearable
    :invalid="invalid"
    label="常驻城市"
    empty="无匹配城市"
    open-on-click
    placeholder="必须选一个城市"
  />
  <p v-if="invalid" style="color: var(--xh-fg-danger)">这一项必填</p>
</template>
```

```html
<xh-combobox id="combobox-invalid" invalid open-on-click placeholder="必须选一个城市">
  <div data-xh-part="root">
    <label data-xh-part="label">常驻城市</label>
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
      </div>
      <div data-xh-part="empty">无匹配城市</div>
    </div>
  </div>
</xh-combobox>
<p id="combobox-invalid-hint" style="color: var(--xh-fg-danger)">这一项必填</p>

<script type="module">
  const combobox = document.getElementById("combobox-invalid");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const hint = document.getElementById("combobox-invalid-hint");
  const all = [...content.children];
  const labelOf = (item) => item.querySelector('[data-xh-part="item-text"]').textContent.toLowerCase();

  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren(...all.filter((item) => labelOf(item).includes(q)));
  });

  // 校验归宿主，组件只负责把这个结论铺成属性
  combobox.addEventListener("value-change", (event) => {
    combobox.value = event.detail.value;
    const invalid = event.detail.value.length === 0;
    combobox.invalid = invalid;
    hint.hidden = !invalid;
  });
</script>
```

### 异步候选

输入串每变一次就重新去远端查一遍，等结果的这段时间候选为空、由空态节点顶上

```vue
<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";
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

const value = ref<string[]>([]);
const options = ref<City[]>([]);
const loading = ref(false);
let timer = 0;

// 每次输入都重开一轮查询，上一轮未落地的先撤掉
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
    v-model:value="value"
    :collection="options"
    clearable
    label="城市"
    :empty="loading ? '查询中…' : '无匹配城市'"
    placeholder="输入城市名查询"
    @input-value-change="onSearch"
  />
  <p>当前值：{{ value[0] ?? "（未选）" }}</p>
</template>
```

```html
<xh-combobox id="combobox-async" placeholder="输入城市名查询">
  <div data-xh-part="root">
    <label data-xh-part="label">城市</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="trigger"></button>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content"></div>
      <div data-xh-part="empty" id="combobox-async-empty">无匹配城市</div>
    </div>
  </div>
</xh-combobox>
<p>当前值：<span id="combobox-async-value">（未选）</span></p>

<script type="module">
  const combobox = document.getElementById("combobox-async");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const empty = document.getElementById("combobox-async-empty");
  const readout = document.getElementById("combobox-async-value");
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

  // 每次输入都重开一轮查询，上一轮未落地的先撤掉
  combobox.addEventListener("input-value-change", (event) => {
    window.clearTimeout(timer);
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren();
    if (q === "") {
      empty.textContent = "无匹配城市";
      return;
    }
    empty.textContent = "查询中…";
    timer = window.setTimeout(() => {
      content.replaceChildren(
        ...pool.filter((c) => c.label.toLowerCase().includes(q)).map(makeItem),
      );
      empty.textContent = "无匹配城市";
    }, 600);
  });

  combobox.addEventListener("value-change", (event) => {
    combobox.value = event.detail.value;
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
</script>
```

### 候选里的自定义内容

条目内容由你写：主文本之外还能带副标题与标记，过滤与键盘行为一点不变

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
  XhTagLabel,
  XhTagRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const mailboxes = [
  { value: "gmail", label: "name@gmail.com", note: "国际", tone: "info" },
  { value: "qq", label: "name@qq.com", note: "国内", tone: "success" },
  { value: "163", label: "name@163.com", note: "国内", tone: "success" },
];

const value = ref<string[]>([]);
const query = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? mailboxes : mailboxes.filter(m => m.label.toLowerCase().includes(q));
});
</script>

<template>
  <XhComboboxRoot
    v-model:value="value"
    v-model:input-value="query"
    open-on-click
    placeholder="输入邮箱前缀"
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
            <span style="display: inline-flex; align-items: center; gap: 8px">
              {{ m.label }}
              <XhTagRoot variant="subtle" :tone="m.tone" size="sm">
                <XhTagLabel>{{ m.note }}</XhTagLabel>
              </XhTagRoot>
            </span>
          </XhComboboxItemText>
          <XhComboboxItemIndicator />
        </XhComboboxItem>
      </XhComboboxContent>
      <XhComboboxEmpty>没有匹配的邮箱</XhComboboxEmpty>
    </XhComboboxPositioner>
  </XhComboboxRoot>
  <p>当前值：{{ value[0] ?? "（未选）" }}</p>
</template>
```

```html
<xh-combobox id="combobox-custom-content" open-on-click placeholder="输入邮箱前缀">
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
            <span style="display: inline-flex; align-items: center; gap: 8px">
              name@gmail.com
              <xh-tag variant="subtle" tone="info" size="sm">
                <span data-xh-part="root"><span data-xh-part="label">国际</span></span>
              </xh-tag>
            </span>
          </span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="qq" data-label="name@qq.com">
          <span data-xh-part="item-text">
            <span style="display: inline-flex; align-items: center; gap: 8px">
              name@qq.com
              <xh-tag variant="subtle" tone="success" size="sm">
                <span data-xh-part="root"><span data-xh-part="label">国内</span></span>
              </xh-tag>
            </span>
          </span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="163" data-label="name@163.com">
          <span data-xh-part="item-text">
            <span style="display: inline-flex; align-items: center; gap: 8px">
              name@163.com
              <xh-tag variant="subtle" tone="success" size="sm">
                <span data-xh-part="root"><span data-xh-part="label">国内</span></span>
              </xh-tag>
            </span>
          </span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
      <div data-xh-part="empty">没有匹配的邮箱</div>
    </div>
  </div>
</xh-combobox>
<p>当前值：<span id="combobox-custom-content-value">（未选）</span></p>

<script type="module">
  const combobox = document.getElementById("combobox-custom-content");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const readout = document.getElementById("combobox-custom-content-value");
  const all = [...content.children];

  // 条目里还带着标记文字，过滤只认 data-label 上那份主文本
  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren(
      ...all.filter((item) => item.dataset.label.toLowerCase().includes(q)),
    );
  });

  combobox.addEventListener("value-change", (event) => {
    combobox.value = event.detail.value;
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
</script>
```

### 随表单提交

在根里补一个隐藏输入承接选中值，值随原生表单一并提交；浮层收起时回车留给表单

```vue
<script setup lang="ts">
import {
  XhButton,
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

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "chengdu", label: "Chengdu 成都" },
  { value: "hangzhou", label: "Hangzhou 杭州" },
];

const value = ref<string[]>([]);
const query = ref("");
const submitted = ref("");
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q === "" ? cities : cities.filter(c => c.label.toLowerCase().includes(q));
});

function onSubmit(event: Event): void {
  const data = new FormData(event.target as HTMLFormElement);
  submitted.value = String(data.get("city") ?? "");
}
</script>

<template>
  <form
    style="display: flex; flex-direction: column; gap: 12px; max-inline-size: 420px"
    @submit.prevent="onSubmit"
  >
    <XhComboboxRoot
      v-slot="{ value: picked }"
      v-model:value="value"
      v-model:input-value="query"
      open-on-click
      placeholder="输入城市名"
    >
      <XhComboboxLabel>常驻城市</XhComboboxLabel>
      <XhComboboxControl>
        <XhComboboxInput />
        <XhComboboxTrigger />
        <XhComboboxClearTrigger />
      </XhComboboxControl>
      <XhComboboxPositioner>
        <XhComboboxContent>
          <XhComboboxItem v-for="c in filtered" :key="c.value" :value="c.value">
            <XhComboboxItemText>{{ c.label }}</XhComboboxItemText>
            <XhComboboxItemIndicator />
          </XhComboboxItem>
        </XhComboboxContent>
        <XhComboboxEmpty>无匹配城市</XhComboboxEmpty>
      </XhComboboxPositioner>
      <!-- 进表单的出口由作者补：多选时按自己的约定拼串 -->
      <input type="hidden" name="city" :value="picked.join(',')">
    </XhComboboxRoot>
    <XhButton type="submit" variant="outline" style="align-self: start">提交</XhButton>
    <span>表单收到：{{ submitted || "（还没提交）" }}</span>
  </form>
</template>
```

```html
<form
  id="combobox-form"
  style="display: flex; flex-direction: column; gap: 12px; max-inline-size: 420px"
>
  <xh-combobox id="combobox-form-city" name="city" open-on-click placeholder="输入城市名">
    <div data-xh-part="root">
      <label data-xh-part="label">常驻城市</label>
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
          <div data-xh-part="item" value="chengdu">
            <span data-xh-part="item-text">Chengdu 成都</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="hangzhou">
            <span data-xh-part="item-text">Hangzhou 杭州</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
        <div data-xh-part="empty">无匹配城市</div>
      </div>
      <!-- 进表单的出口：多选时按逗号拼成一串 -->
      <input data-xh-part="hidden-input" />
    </div>
  </xh-combobox>

  <xh-button type="submit" variant="outline" style="align-self: start">
    <button data-xh-part="root">提交</button>
  </xh-button>
  <span>表单收到：<span id="combobox-form-result">（还没提交）</span></span>
</form>

<script type="module">
  const form = document.getElementById("combobox-form");
  const combobox = document.getElementById("combobox-form-city");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const result = document.getElementById("combobox-form-result");
  const all = [...content.children];
  const labelOf = (item) => item.querySelector('[data-xh-part="item-text"]').textContent.toLowerCase();

  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren(...all.filter((item) => labelOf(item).includes(q)));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    result.textContent = String(new FormData(form).get("city") ?? "");
  });
</script>
```

### 多行输入宿主

输入部件写成 textarea 即多行宿主；此时不写 role 与 aria-expanded，textarea 保留它自带的 textbox 角色

```vue
<script setup lang="ts">
import {
  XhComboboxContent,
  XhComboboxControl,
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

const replies = [
  { value: "received", label: "已收到，稍后处理" },
  { value: "shipping", label: "商品已发出，请注意查收" },
  { value: "refund", label: "退款已提交，三个工作日内到账" },
];

const value = ref<string[]>([]);
const draft = ref("");
const filtered = computed(() => {
  const q = draft.value.trim().toLowerCase();
  return q === "" ? replies : replies.filter(r => r.label.toLowerCase().includes(q));
});
</script>

<template>
  <XhComboboxRoot v-model:value="value" v-model:input-value="draft" allow-custom-value>
    <XhComboboxLabel>回复内容</XhComboboxLabel>
    <XhComboboxControl>
      <!-- 换标签只此一处；键盘、高亮与选中回填的行为一律不变 -->
      <XhComboboxInput as="textarea" rows="3" placeholder="挑一条常用语，或自己写" />
      <XhComboboxTrigger />
    </XhComboboxControl>
    <XhComboboxPositioner>
      <XhComboboxContent>
        <XhComboboxItem v-for="r in filtered" :key="r.value" :value="r.value">
          <XhComboboxItemText>{{ r.label }}</XhComboboxItemText>
          <XhComboboxItemIndicator />
        </XhComboboxItem>
      </XhComboboxContent>
    </XhComboboxPositioner>
  </XhComboboxRoot>
  <p>草稿：{{ draft || "（空）" }}</p>
</template>
```

```html
<xh-combobox id="combobox-textarea" allow-custom-value>
  <div data-xh-part="root">
    <label data-xh-part="label">回复内容</label>
    <div data-xh-part="control">
      <!-- 换标签只此一处；键盘、高亮与选中回填的行为一律不变 -->
      <textarea data-xh-part="input" rows="3" placeholder="挑一条常用语，或自己写"></textarea>
      <button data-xh-part="trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="received">
          <span data-xh-part="item-text">已收到，稍后处理</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="shipping">
          <span data-xh-part="item-text">商品已发出，请注意查收</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="refund">
          <span data-xh-part="item-text">退款已提交，三个工作日内到账</span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
    </div>
  </div>
</xh-combobox>
<p>草稿：<span id="combobox-textarea-draft">（空）</span></p>

<script type="module">
  const combobox = document.getElementById("combobox-textarea");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const draft = document.getElementById("combobox-textarea-draft");
  const all = [...content.children];
  const labelOf = (item) => item.querySelector('[data-xh-part="item-text"]').textContent.toLowerCase();

  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren(...all.filter((item) => labelOf(item).includes(q)));
    draft.textContent = event.detail.inputValue || "（空）";
  });

  combobox.addEventListener("value-change", (event) => {
    combobox.value = event.detail.value;
  });
</script>
```

## 设计指引

### 何时使用

- 选项多到需要检索（城市、用户、商品）。
- 候选来自远端，随输入变化。
- 允许用户输入清单之外的值（`allowCustomValue`）。

### 何时不用

- 选项固定且不多：用[选择器](./select)。
- 只是在正文里插入引用：用[提及](./mention)。
- 输入的是标签集合：用[标签输入](./tags-input)。

### 特性

- `inputBehavior` 决定输入时是否自动高亮或自动补全首项。
- 多选、分组、异步候选、选中后清空输入都是内置行为。
- `openOnClick` 决定点击输入框是否直接展开候选。
- 清空钮有值才出现，出现即顶替展开钮那一格，盒的宽度不随有没有值跳动；展开的入口始终是输入框（打字、方向键、`openOnClick`）。
- 输入宿主可以换成多行。
- 原生表单按每个选中值生成一个同名隐藏字段；`['a,b', 'c']` 用 `FormData.getAll(name)` 读取为两个原值，不使用逗号拼接。零选中没有提交项，禁用不提交，只读仍提交。
- 声明 `HiddenInput` 部件才参与原生表单。`form` 可指定外部表单 ID，提交与重置使用同一所有者；显式 ID 不存在时不回退祖先表单。非受控 reset 恢复 `defaultValue`，受控值由业务响应重置请求。
- 三种非条目相位各有部件：空（`empty`）与在途（`loading`）。取数期间在途占位顶上来，空态让位，两者不同屏。
- `content` 始终是候选与状态共用的唯一浮层表面；`empty`/`loading` 保持为 `role=listbox` 外的同级 `role=status`，只在零候选时把状态文字覆盖到该表面，不再各画一张卡。已有候选进入 loading 时列表原样保留，只由 `aria-busy` 报后台刷新，不产生不可见却仍能提交的活动项。
- 自动结构没有收到 `empty` 文案时不绘制无文字的空面；需要展开后解释空结果时必须显式提供文案，不由组件猜一条通用提示。
- 单选、多选统一由候选末端的对号表示选中；正文保持正常颜色和字重，选中本身不铺品牌底。
- 指针与键盘导航通过同一 `data-highlighted` 中性底表达，输入框继续持有焦点；选中与高亮叠加时，对号和中性底同时保留。
- 候选内容按作者给出的 DOM 顺序排布；正式 `item-text` 占据剩余宽度并负责长文省略，`item-indicator` 固定在逻辑末端。
- 候选浮层统一使用 M2 磨砂表面、细顶光和边界阴影，输入框保持原有实体表面；空态和在途文字共用材质前景，不新增第二层背景或滤镜。
- 进退场按实际落位方向淡入淡出并短距离移动，不缩放列表和文字；嵌套层独立决定方向。局部主题随 Portal 传递，增强对比度和减少透明度由材质令牌切为实体表面，减弱动效归零位移。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-combobox>` |
| Vue 组件 | `XhComboboxClearTrigger` `XhComboboxContent` `XhComboboxControl` `XhComboboxEmpty` `XhComboboxGroup` `XhComboboxGroupLabel` `XhComboboxHiddenInput` `XhComboboxInput` `XhComboboxItem` `XhComboboxItemIndicator` `XhComboboxItemText` `XhComboboxLabel` `XhComboboxLoading` `XhComboboxPositioner` `XhComboboxRoot` `XhComboboxTrigger` |
| 组合式函数 | `useCombobox` |
| 状态机 | `comboboxMachine` |
| 皮肤 | `@xihan-ui/styles/combobox.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="combobox"`：`root` · `label` · **`control`** · **`input`** · `trigger` · `clear-trigger` · `positioner` · **`content`** · `item` · `item-text` · `item-indicator` · `group` · `group-label` · `empty` · `loading` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ComboboxNode[]` |  | 候选数据，显示文本与禁用的事实源。过滤仍归调用方：交进来的就是此刻该显示的那几条。 给了它，条目部件只需报 value，显示文本也不再从活 DOM 现查。 缺省即回到「文本写在条目里、现查 DOM」的老路。 |
| `value` | `string \| string[]` |  | 选中值。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 单选写成裸串是简写，内部一律归一成数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `inputValue` | `string` |  | 输入框里的字符串。给定即受控，与选中值各自独立。 过滤不由组件做：调用方拿这个串去筛条目，把筛完的结果重新渲染进来。 |
| `defaultInputValue` | `string` |  |  |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；hidden-input 按选中值逐个生成同名字段，不使用分隔符编码。 |
| `form` | `string` |  | 原生表单 ID；显式关联外部表单，提交与 reset 使用同一所有者。 |
| `multiple` | `boolean` |  |  |
| `disabled` | `boolean` |  | 整个控件禁用：输入框与两个按钮都用原生 disabled。 |
| `readOnly` | `boolean` |  | 只读：文字可选可复制，但展开、选中、清空一概不发生。 |
| `invalid` | `boolean` |  | 校验失败：输入框报 aria-invalid，各角色节点带 data-invalid。 |
| `loading` | `boolean` |  | 候选还在取：列表报 aria-busy，在途占位顶上来、空态占位让位。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `placeholder` | `string` |  | 输入框占位文字。 |
| `translations` | `Partial<ComboboxTranslations>` |  | 读屏文案；不给的键走英文缺省。 |
| `allowCustomValue` | `boolean` |  | 允许提交候选列表里没有的值（回车与失焦时把输入串本身收成选中值）。 |
| `openOnClick` | `boolean` |  | 点输入框即展开，默认 false（只有触发按钮与方向键展开）。 |
| `inputBehavior` | `ComboboxInputBehavior` |  | 输入行为，默认 none。 |
| `placement` | `Placement` |  |  |
| `dir` | `Direction` |  | 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入行的描边与底色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定输入行高度、内边距与字号档位。 |
| `onValueChange` | `(details: ComboboxValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onInputValueChange` | `(details: ComboboxInputValueChangeDetails) => void` |  | 输入串变化回调：调用方据此重新过滤候选。 |
| `onOpenChange` | `(details: ComboboxOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ComboboxValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `input-value-change` | `ComboboxInputValueChangeDetails` | 输入串变化；detail 为 `{ inputValue: string }`，作者据此过滤候选 |
| `open-change` | `ComboboxOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhComboboxRoot` | `default` | `ComboboxRootSlotProps` |  |
| `XhComboboxRoot` | `label` | — |  |
| `XhComboboxRoot` | `empty` | — |  |
| `XhComboboxRoot` | `item` | `ComboboxNodeMeta` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `input` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `empty` | 'open' \| 'closed' |
| `loading` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ESCAPE` · `INPUT.CHANGE` · `INPUT.SET` · `INPUT.BLUR` · `ITEM.HIGHLIGHT` · `HIGHLIGHT.CLEAR` · `ITEM.SELECT` · `VALUE.COMMIT` · `VALUE.SET` · `VALUE.CLEAR` · `ITEMS.SYNC` · `FORM.RESET`

**判据**：`isOpenControlled` · `isMultiple` · `hasHighlight`

## connect API

`useCombobox` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly ComboboxNodeMeta[]` | collection 推出的候选元信息，按数据顺序排列；没给 collection 即空数组。 |
| `value` | `string[]` | 选中集合；单选模式下长度 ≤ 1，形状不随模式变。 |
| `inputValue` | `string` | 输入框里的字符串。 |
| `valueText` | `string \| null` | 单选选中项的显示文本；无选中或多选时为 null。 |
| `highlightedValue` | `string \| null` | 高亮候选；收起时为 null。焦点不在它身上，只经 aria-activedescendant 上报。 |
| `multiple` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `empty` | `boolean` | 候选为空（已结算且条数为 0）且当前展开：empty 角色节点据此显形。 |
| `canClear` | `boolean` | 清空按钮此刻可不可按。 |
| `isSelected` | `(value: string) => boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[]) => void` |  |
| `setInputValue` | `(next: string) => void` |  |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getInputProps` | `(props?: ComboboxInputProps) => T['input']` | 不传参即单行 input，产出与加此参数前逐字相同。 |
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
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一个位置，两者不同屏——取数期间它顶上来，空态让位。 与 content 是兄弟，同样不进 role=listbox。 |
| `getHiddenInputProps` | `(props: { value: string }) => T['input']` | 单值表单出口；按 api.value 逐个调用并生成同名 input，零选中不生成提交项。 |

## 键盘

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
| `Enter` | open, 无高亮且 allowCustomValue | 把输入串本身收成选中值 |
| `Escape` | open | 先摘掉高亮；高亮已空时才收起列表，选中值不变 |
| `Alt+ArrowUp` | open | 收起列表，选中值不变 |
| `Tab` / `Shift+Tab` | open | 收起列表且不拦按键，焦点按 Tab 序列自然离开 |
| `Backspace` | multiple, 输入串为空且已有选中 | 删掉最后一个已选项 |
| `可打印字符` | focus in input | 改写输入串并展开列表；过滤由调用方按 onInputValueChange 自己做 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

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

## 样式

默认皮肤 `@xihan-ui/styles/combobox.css` 按部件选择：`[data-scope="combobox"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

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
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-multiline` | ''（条件成立时才出现） |
| `input` | `data-readonly` | ''（条件成立时才出现） |
| `input` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-combobox-action-bg` | `clear-trigger`<br>`trigger` | `background` | `default`<br>`disabled` | `transparent` | combobox 的 clear-trigger、trigger 部件 background 覆盖槽。 |
| `--xh-combobox-action-bg-active` | `clear-trigger`<br>`trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | combobox 的 clear-trigger、trigger 部件 background 覆盖槽。 |
| `--xh-combobox-action-bg-hover` | `clear-trigger`<br>`trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | combobox 的 clear-trigger、trigger 部件 background 覆盖槽。 |
| `--xh-combobox-action-fg` | `clear-trigger`<br>`trigger` | `color` | `default` | `--xh-fg-muted` | combobox 的 clear-trigger、trigger 部件 color 覆盖槽。 |
| `--xh-combobox-action-fg-hover` | `clear-trigger`<br>`trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-default` | combobox 的 clear-trigger、trigger 部件 color 覆盖槽。 |
| `--xh-combobox-action-font-size` | `clear-trigger`<br>`trigger` | `font-size` | `default` | `--xh-text-secondary-size` | combobox 的 clear-trigger、trigger 部件 font-size 覆盖槽。 |
| `--xh-combobox-action-radius` | `clear-trigger`<br>`trigger` | `border-radius` | `default` | `--xh-shape-control` | combobox 的 clear-trigger、trigger 部件 border-radius 覆盖槽。 |
| `--xh-combobox-action-size` | `clear-trigger`<br>`trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | combobox 的 clear-trigger、trigger 部件 block-size、inline-size 覆盖槽。 |
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
| `--xh-combobox-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | combobox 的 content 部件 border-radius 覆盖槽。 |
| `--xh-combobox-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | combobox 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-combobox-control-bg` | `control` | `background` | `default` | `--xh-_combobox-control-bg` | combobox 的 control 部件 background 覆盖槽。 |
| `--xh-combobox-control-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` | combobox 的 control 部件 background 覆盖槽。 |
| `--xh-combobox-control-bg-hover` | `control` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly` | `--xh-_combobox-control-bg-hover` | combobox 的 control 部件 background 覆盖槽。 |
| `--xh-combobox-control-bg-readonly` | `control` | `background` | `readonly` | `--xh-bg-subtle` | combobox 的 control 部件 background 覆盖槽。 |
| `--xh-combobox-control-border` | `control` | `border` | `default` | `--xh-_combobox-control-border` | combobox 的 control 部件 border 覆盖槽。 |
| `--xh-combobox-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])` | `--xh-_tone` | combobox 的 control 部件 border-color 覆盖槽。 |
| `--xh-combobox-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid])` | `--xh-_combobox-control-border-hover` | combobox 的 control 部件 border-color 覆盖槽。 |
| `--xh-combobox-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` | combobox 的 control 部件 border-color 覆盖槽。 |
| `--xh-combobox-control-fg` | `control` | `color` | `default` | `--xh-fg-default` | combobox 的 control 部件 color 覆盖槽。 |
| `--xh-combobox-control-gap` | `control` | `gap` | `default` | `--xh-_combobox-gap` | combobox 的 control 部件 gap 覆盖槽。 |
| `--xh-combobox-control-h` | `control` | `block-size` | `default` | `--xh-_combobox-h` | combobox 的 control 部件 block-size 覆盖槽。 |
| `--xh-combobox-control-min-w` | `control`<br>`root` | `min-inline-size` | `default` | `--xh-control-min-w` | combobox 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-combobox-control-px` | `control` | `padding-inline` | `default` | `--xh-_combobox-px` | combobox 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-combobox-control-py` | `control`<br>`input` | `padding-block` | `has([data-part='input'][data-multiline])`<br>`multiline` | `--xh-field-py` | combobox 的 control、input 部件 padding-block 覆盖槽。 |
| `--xh-combobox-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | combobox 的 control 部件 border-radius 覆盖槽。 |
| `--xh-combobox-control-shadow` | `control` | `box-shadow` | `default` | `--xh-_combobox-control-shadow` | combobox 的 control 部件 box-shadow 覆盖槽。 |
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
| `--xh-combobox-icon-size` | `positioner`<br>`root` | `--xh-icon-size` | `is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | combobox 的 positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-combobox-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-canvas` | combobox 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-combobox-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` | combobox 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-combobox-input-font-size` | `input` | `font-size` | `default` | `--xh-_combobox-font-size` | combobox 的 input 部件 font-size 覆盖槽。 |
| `--xh-combobox-item-bg-hover` | `item` | `background` | `disabled`<br>`highlighted`<br>`not([data-disabled])` | `--xh-bg-subtle` | combobox 的 item 部件 background 覆盖槽。 |
| `--xh-combobox-item-fg` | `item` | `color` | `default`<br>`state=checked` | `--xh-material-frosted-fg` | combobox 的 item 部件 color 覆盖槽。 |
| `--xh-combobox-item-fg-selected` | `item` | `color` | `state=checked` | `--xh-combobox-item-fg` | combobox 的 item 部件 color 覆盖槽。 |
| `--xh-combobox-item-font-size` | `item` | `font-size` | `default` | `--xh-_combobox-font-size` | combobox 的 item 部件 font-size 覆盖槽。 |
| `--xh-combobox-item-font-weight-selected` | `item` | `font-weight` | `state=checked` | `--xh-font-weight-regular` | combobox 的 item 部件 font-weight 覆盖槽。 |
| `--xh-combobox-item-gap` | `item` | `gap` | `default` | `--xh-_combobox-gap` | combobox 的 item 部件 gap 覆盖槽。 |
| `--xh-combobox-item-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_combobox-accent` | combobox 的 item-indicator 部件 color 覆盖槽。 |
| `--xh-combobox-item-indicator-size` | `item-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | combobox 的 item-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-combobox-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | combobox 的 item 部件 line-height 覆盖槽。 |
| `--xh-combobox-item-px` | `item` | `padding-inline` | `default` | `--xh-_combobox-item-px` | combobox 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-combobox-item-py` | `item` | `padding-block` | `default` | `--xh-_combobox-item-py` | combobox 的 item 部件 padding-block 覆盖槽。 |
| `--xh-combobox-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | combobox 的 item 部件 border-radius 覆盖槽。 |
| `--xh-combobox-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | combobox 的 label 部件 color 覆盖槽。 |
| `--xh-combobox-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | combobox 的 label 部件 color 覆盖槽。 |
| `--xh-combobox-label-font-size` | `label` | `font-size` | `default` | `--xh-_combobox-label-font-size` | combobox 的 label 部件 font-size 覆盖槽。 |
| `--xh-combobox-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | combobox 的 label 部件 font-weight 覆盖槽。 |
| `--xh-combobox-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | combobox 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-combobox-loading-fg` | `loading` | `color` | `default` | `--xh-material-frosted-fg-muted` | combobox 的 loading 部件 color 覆盖槽。 |
| `--xh-combobox-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_combobox-font-size` | combobox 的 loading 部件 font-size 覆盖槽。 |
| `--xh-combobox-loading-px` | `loading` | `padding-inline` | `default` | `--xh-control-px-md` | combobox 的 loading 部件 padding-inline 覆盖槽。 |
| `--xh-combobox-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` | combobox 的 loading 部件 padding-block 覆盖槽。 |
| `--xh-combobox-placeholder-fg` | `input` | `color` | `placeholder` | `--xh-fg-subtle` | combobox 的 input 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `color` · `rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[表单字段](./field)。

## 最佳实践

- 异步候选要有在途与空态两种反馈，用户才知道是在找还是没有。
- 允许自由文本时仍要提供空态说明，并明确提示 Enter 会使用当前文字；空态不会伪造成一个可选项。
- 高亮匹配片段用[文本高亮](./highlight)，让用户看清为什么这条被选出来。
- 无头用法需要按 `api.value` 遍历，为每个值调用 `api.getHiddenInputProps({ value })` 并渲染原生 input；旧的无参调用与 CSV 提交合同已删除。Vue/React 的 `HiddenInput` 部件自动铺开，Web Components 仍只需声明一个原生 `input[data-xh-part="hidden-input"]`，额外字段由宿主管理。

## 反模式

- 允许自由文本却不告诉用户——他以为自己选中了一条，其实提交了一段文字。
- 输入一个字符就发一次请求。
