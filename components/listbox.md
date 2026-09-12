来源：https://ui.docs.xihanfun.com/components/listbox

# Listbox `列表框`

一份直接铺在页面上的可选列表，不带浮层。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/listbox" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/listbox.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/listbox" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/listbox" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/listbox.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

方向键只搬焦点，Enter 或空格才落值；整组只占一个 Tab 位

```vue
<script setup lang="ts">
import { XhListboxRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const city = ref<string[]>(["beijing"]);
const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "busan", label: "Busan 釜山（禁用）", disabled: true },
  { value: "london", label: "London 伦敦" },
];
</script>

<template>
  <XhListboxRoot
    v-model:value="city"
    :collection="cities"
    label="城市"
    style="max-inline-size: 320px"
  />
  <p>已选：{{ city.length ? city.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-listbox id="listbox-basic" value="beijing">
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">城市</span>
    <div data-xh-part="content">
      <div data-xh-part="item" value="beijing">
        <span data-xh-part="item-text">Beijing 北京</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="berlin">
        <span data-xh-part="item-text">Berlin 柏林</span>
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
  </div>
</xh-listbox>
<p>已选：<span id="listbox-basic-value">beijing</span></p>

<script type="module">
  // 受控：选中集合写回后再回显
  const listbox = document.getElementById("listbox-basic");
  const readout = document.getElementById("listbox-basic-value");
  listbox.addEventListener("value-change", (event) => {
    listbox.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

## 示例

### 多选

selection-mode="multiple" 下空格改成切换该条，Shift + 方向键顺手扩选，Ctrl / Cmd + A 全选或全不选

```vue
<script setup lang="ts">
import { XhListboxRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const cities = ref<string[]>(["beijing", "london"]);
const options = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "chengdu", label: "Chengdu 成都" },
  { value: "london", label: "London 伦敦" },
];
</script>

<template>
  <XhListboxRoot
    v-model:value="cities"
    :collection="options"
    label="常去城市"
    selection-mode="multiple"
    style="max-inline-size: 320px"
  />
  <p>已选：{{ cities.length ? cities.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-listbox id="listbox-multiple" selection-mode="multiple">
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">常去城市</span>
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
  </div>
</xh-listbox>
<p>已选：<span id="listbox-multiple-value">beijing、london</span></p>

<script type="module">
  // 多选的选中集合是数组，只走 property：设初值、每次变更写回、再回显
  const listbox = document.getElementById("listbox-multiple");
  const readout = document.getElementById("listbox-multiple-value");
  listbox.value = ["beijing", "london"];
  listbox.addEventListener("value-change", (event) => {
    listbox.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 分组

group 把条目分段，group-label 是这一段的可及名字，不参与选中也不接方向键

```vue
<script setup lang="ts">
import {
  XhListboxContent,
  XhListboxGroup,
  XhListboxGroupLabel,
  XhListboxItem,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const city = ref<string[]>([]);
const groups = [
  {
    value: "asia",
    label: "亚洲",
    items: [
      { value: "bangkok", label: "Bangkok 曼谷" },
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
</script>

<template>
  <XhListboxRoot v-model:value="city" style="max-inline-size: 320px">
    <XhListboxLabel>城市</XhListboxLabel>
    <XhListboxContent>
      <XhListboxGroup v-for="g in groups" :key="g.value" :value="g.value">
        <XhListboxGroupLabel>{{ g.label }}</XhListboxGroupLabel>
        <XhListboxItem v-for="c in g.items" :key="c.value" :value="c.value">
          <XhListboxItemText>{{ c.label }}</XhListboxItemText>
          <XhListboxItemIndicator />
        </XhListboxItem>
      </XhListboxGroup>
    </XhListboxContent>
  </XhListboxRoot>
  <p>已选：{{ city.length ? city.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-listbox id="listbox-group">
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">城市</span>
    <div data-xh-part="content">
      <div data-xh-part="group" value="asia">
        <span data-xh-part="group-label">亚洲</span>
        <div data-xh-part="item" value="bangkok">
          <span data-xh-part="item-text">Bangkok 曼谷</span>
          <span data-xh-part="item-indicator"></span>
        </div>
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
  </div>
</xh-listbox>
<p>已选：<span id="listbox-group-value">（无）</span></p>

<script type="module">
  // 受控：初值是空集合，只走 property
  const listbox = document.getElementById("listbox-group");
  const readout = document.getElementById("listbox-group-value");
  listbox.value = [];
  listbox.addEventListener("value-change", (event) => {
    listbox.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 选择模式

selection-mode="extended" 是「裸点换一条、Ctrl 与 Shift 才扩选」，与 multiple 档的区别就在裸点

```vue
<script setup lang="ts">
import { XhListboxRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const files = ref<string[]>(["a"]);
const options = [
  { value: "a", label: "report.pdf" },
  { value: "b", label: "cover.png" },
  { value: "c", label: "notes.md" },
  { value: "d", label: "data.csv" },
];
</script>

<template>
  <XhListboxRoot
    v-model:value="files"
    :collection="options"
    label="文件（extended）"
    selection-mode="extended"
    style="max-inline-size: 320px"
  />
  <p>已选：{{ files.length ? files.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-listbox id="listbox-extended" value="a" selection-mode="extended">
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">文件（extended）</span>
    <div data-xh-part="content">
      <div data-xh-part="item" value="a">
        <span data-xh-part="item-text">report.pdf</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="b">
        <span data-xh-part="item-text">cover.png</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="c">
        <span data-xh-part="item-text">notes.md</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="d">
        <span data-xh-part="item-text">data.csv</span>
        <span data-xh-part="item-indicator"></span>
      </div>
    </div>
  </div>
</xh-listbox>
<p>已选：<span id="listbox-extended-value">a</span></p>

<script type="module">
  // 受控：选中集合写回后再回显
  const listbox = document.getElementById("listbox-extended");
  const readout = document.getElementById("listbox-extended-value");
  listbox.addEventListener("value-change", (event) => {
    listbox.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 弹出式选择

把列表装进浮层：触发器显示当前选中项，落值即收起，浮层底部还能放操作按钮

```vue
<script setup lang="ts">
import {
  XhButton,
  XhListboxRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const songs = [
  { value: "song1", label: "起风了" },
  { value: "song2", label: "夜空中最亮的星" },
  { value: "song3", label: "海阔天空（暂不可选）", disabled: true },
  { value: "song4", label: "晴天" },
];

const value = ref<string[]>(["song1"]);
const open = ref(false);
const label = computed(() => songs.find(s => s.value === value.value[0])?.label ?? "弹出选择");

// 单选：落值即收起浮层
function onValueChange(details: { value: string[] }): void {
  if (details.value.length > 0)
    open.value = false;
}
</script>

<template>
  <XhPopoverRoot v-model:open="open" placement="bottom-start">
    <XhPopoverTrigger>{{ label }}</XhPopoverTrigger>
    <XhPopoverPositioner>
      <XhPopoverContent>
        <XhListboxRoot
          v-model:value="value"
          :collection="songs"
          style="min-inline-size: 200px"
          @value-change="onValueChange"
        />
        <XhButton variant="ghost" size="sm" @click="value = []">清空</XhButton>
      </XhPopoverContent>
    </XhPopoverPositioner>
  </XhPopoverRoot>
  <p>已选：{{ value.length ? value.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-popover id="listbox-popover" open="false" placement="bottom-start">
  <button data-xh-part="trigger">起风了</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <xh-listbox id="listbox-popover-list" value="song1">
        <div data-xh-part="root" style="min-inline-size: 200px">
          <div data-xh-part="content">
            <div data-xh-part="item" value="song1">
              <span data-xh-part="item-text">起风了</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="song2">
              <span data-xh-part="item-text">夜空中最亮的星</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="song3" aria-disabled="true">
              <span data-xh-part="item-text">海阔天空（暂不可选）</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="song4">
              <span data-xh-part="item-text">晴天</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </xh-listbox>
      <xh-button variant="ghost" size="sm">
        <button data-xh-part="root" data-clear>清空</button>
      </xh-button>
    </div>
  </div>
</xh-popover>
<p>已选：<span id="listbox-popover-value">song1</span></p>

<script type="module">
  const popover = document.getElementById("listbox-popover");
  const list = document.getElementById("listbox-popover-list");
  const readout = document.getElementById("listbox-popover-value");
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
    trigger.textContent = picked ? picked.textContent.trim() : "弹出选择";
    readout.textContent = event.detail.value.join("、") || "（无）";
    if (event.detail.value.length > 0) popover.open = false;
  });

  popover.querySelector("[data-clear]").addEventListener("click", () => {
    list.value = [];
    trigger.textContent = "弹出选择";
    readout.textContent = "（无）";
  });
</script>
```

### 定高滚动

用 --xh-listbox-content-max-h 压住列表高度，条目多了就在容器里滚；方向键走到哪条，视图跟到哪条

```vue
<script setup lang="ts">
import { XhListboxRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const tracks = Array.from({ length: 40 }, (_, i) => ({
  value: `track-${i + 1}`,
  label: `第 ${i + 1} 首`,
}));

const picked = ref<string[]>(["track-1"]);
</script>

<template>
  <XhListboxRoot
    v-model:value="picked"
    :collection="tracks"
    label="曲目"
    style="max-inline-size: 320px; --xh-listbox-content-max-h: 180px"
  />
  <p>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-listbox id="listbox-scroll" value="track-1">
  <div
    data-xh-part="root"
    style="max-inline-size: 320px; --xh-listbox-content-max-h: 180px"
  >
    <span data-xh-part="label">曲目</span>
    <div data-xh-part="content">
      <div data-xh-part="item" value="track-1">
        <span data-xh-part="item-text">第 1 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-2">
        <span data-xh-part="item-text">第 2 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-3">
        <span data-xh-part="item-text">第 3 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-4">
        <span data-xh-part="item-text">第 4 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-5">
        <span data-xh-part="item-text">第 5 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-6">
        <span data-xh-part="item-text">第 6 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-7">
        <span data-xh-part="item-text">第 7 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-8">
        <span data-xh-part="item-text">第 8 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-9">
        <span data-xh-part="item-text">第 9 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-10">
        <span data-xh-part="item-text">第 10 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-11">
        <span data-xh-part="item-text">第 11 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-12">
        <span data-xh-part="item-text">第 12 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-13">
        <span data-xh-part="item-text">第 13 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-14">
        <span data-xh-part="item-text">第 14 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-15">
        <span data-xh-part="item-text">第 15 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-16">
        <span data-xh-part="item-text">第 16 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-17">
        <span data-xh-part="item-text">第 17 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-18">
        <span data-xh-part="item-text">第 18 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-19">
        <span data-xh-part="item-text">第 19 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-20">
        <span data-xh-part="item-text">第 20 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-21">
        <span data-xh-part="item-text">第 21 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-22">
        <span data-xh-part="item-text">第 22 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-23">
        <span data-xh-part="item-text">第 23 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-24">
        <span data-xh-part="item-text">第 24 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-25">
        <span data-xh-part="item-text">第 25 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-26">
        <span data-xh-part="item-text">第 26 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-27">
        <span data-xh-part="item-text">第 27 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-28">
        <span data-xh-part="item-text">第 28 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-29">
        <span data-xh-part="item-text">第 29 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-30">
        <span data-xh-part="item-text">第 30 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-31">
        <span data-xh-part="item-text">第 31 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-32">
        <span data-xh-part="item-text">第 32 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-33">
        <span data-xh-part="item-text">第 33 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-34">
        <span data-xh-part="item-text">第 34 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-35">
        <span data-xh-part="item-text">第 35 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-36">
        <span data-xh-part="item-text">第 36 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-37">
        <span data-xh-part="item-text">第 37 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-38">
        <span data-xh-part="item-text">第 38 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-39">
        <span data-xh-part="item-text">第 39 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="track-40">
        <span data-xh-part="item-text">第 40 首</span>
        <span data-xh-part="item-indicator"></span>
      </div>
    </div>
  </div>
</xh-listbox>
<p>已选：<span id="listbox-scroll-value">track-1</span></p>

<script type="module">
  // 受控：选中集合写回后再回显
  const listbox = document.getElementById("listbox-scroll");
  const readout = document.getElementById("listbox-scroll-value");
  listbox.addEventListener("value-change", (event) => {
    listbox.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 空态

条目筛空时收起列表、亮出空态节点：它挂在 content 之外，方向键、连打检索与全选都看不见它

```vue
<script setup lang="ts">
import {
  XhEmptyStateDescription,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
  XhListboxContent,
  XhListboxItem,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const members = [
  { value: "liuyi", label: "刘一" },
  { value: "chener", label: "陈二" },
  { value: "zhangsan", label: "张三" },
  { value: "lisi", label: "李四" },
];

const query = ref("");
const picked = ref<string[]>([]);
const filtered = computed(() => {
  const q = query.value.trim();
  return q === "" ? members : members.filter(m => m.label.includes(q));
});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px; max-inline-size: 320px">
    <XhTextFieldRoot v-model:value="query" placeholder="输入姓名筛选">
      <XhTextFieldLabel>搜索</XhTextFieldLabel>
      <XhTextFieldControl>
        <XhTextFieldInput />
      </XhTextFieldControl>
    </XhTextFieldRoot>
    <XhListboxRoot v-model:value="picked">
      <XhListboxLabel>成员</XhListboxLabel>
      <XhListboxContent :hidden="filtered.length === 0">
        <XhListboxItem v-for="m in filtered" :key="m.value" :value="m.value">
          <XhListboxItemText>{{ m.label }}</XhListboxItemText>
          <XhListboxItemIndicator />
        </XhListboxItem>
      </XhListboxContent>
      <!-- 空态节点常挂、靠 hidden 收起，它自带的活区才播报得到这次筛空 -->
      <XhEmptyStateRoot size="sm" :hidden="filtered.length > 0">
        <XhEmptyStateTitle>没有匹配的成员</XhEmptyStateTitle>
        <XhEmptyStateDescription>换个关键词再试试。</XhEmptyStateDescription>
      </XhEmptyStateRoot>
    </XhListboxRoot>
  </div>
  <p>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
```

```html
<div
  style="display: flex; flex-direction: column; gap: 8px; max-inline-size: 320px"
>
  <xh-text-field id="listbox-empty-query" placeholder="输入姓名筛选">
    <div data-xh-part="root">
      <label data-xh-part="label">搜索</label>
      <div data-xh-part="control">
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-text-field>

  <xh-listbox id="listbox-empty">
    <div data-xh-part="root">
      <span data-xh-part="label">成员</span>
      <div data-xh-part="content">
        <div data-xh-part="item" value="liuyi">
          <span data-xh-part="item-text">刘一</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="chener">
          <span data-xh-part="item-text">陈二</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="zhangsan">
          <span data-xh-part="item-text">张三</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="lisi">
          <span data-xh-part="item-text">李四</span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
      <!-- 空态节点常挂、靠 hidden 收起，它自带的活区才播报得到这次筛空 -->
      <xh-empty-state id="listbox-empty-state" size="sm">
        <div data-xh-part="root" hidden>
          <div data-xh-part="title">没有匹配的成员</div>
          <div data-xh-part="description">换个关键词再试试。</div>
        </div>
      </xh-empty-state>
    </div>
  </xh-listbox>
</div>
<p>已选：<span id="listbox-empty-value">（无）</span></p>

<script type="module">
  const list = document.getElementById("listbox-empty");
  const content = list.querySelector('[data-xh-part="content"]');
  const empty = document
    .getElementById("listbox-empty-state")
    .querySelector('[data-xh-part="root"]');
  const items = [...content.querySelectorAll('[data-xh-part="item"]')];

  // 命中的条目按原顺序放回列表，落选的整个摘走
  function filter(query) {
    let hit = 0;
    for (const item of items) {
      const label = item.querySelector('[data-xh-part="item-text"]').textContent;
      if (query === "" || label.includes(query)) {
        content.append(item);
        hit += 1;
      } else {
        item.remove();
      }
    }
    content.hidden = hit === 0;
    empty.hidden = hit > 0;
  }

  document
    .getElementById("listbox-empty-query")
    .addEventListener("value-change", (event) => {
      filter(event.detail.value.trim());
    });

  // 受控：初值是空集合，只走 property
  const readout = document.getElementById("listbox-empty-value");
  list.value = [];
  list.addEventListener("value-change", (event) => {
    list.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 三种相位

空、在途、还有更多各有部件：给了 collection 时前两者的收放归组件，取下一页那颗钮点了做什么归你

```vue
<script setup lang="ts">
import {
  XhListboxContent,
  XhListboxEmpty,
  XhListboxItem,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxLoading,
  XhListboxLoadMoreTrigger,
  XhListboxRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const pool = [
  { value: "liuyi", label: "刘一" },
  { value: "chener", label: "陈二" },
  { value: "zhangsan", label: "张三" },
  { value: "lisi", label: "李四" },
  { value: "wangwu", label: "王五" },
  { value: "zhaoliu", label: "赵六" },
];

const members = ref(pool.slice(0, 3));
const loading = ref(false);
const picked = ref<string[]>([]);

function loadMore() {
  loading.value = true;
  window.setTimeout(() => {
    members.value = pool.slice(0, members.value.length + 3);
    loading.value = false;
  }, 600);
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px; max-inline-size: 320px">
    <XhListboxRoot
      v-model:value="picked"
      :collection="members"
      :loading="loading"
    >
      <XhListboxLabel>成员</XhListboxLabel>
      <XhListboxContent>
        <XhListboxItem v-for="m in members" :key="m.value" :value="m.value">
          <XhListboxItemText>{{ m.label }}</XhListboxItemText>
          <XhListboxItemIndicator />
        </XhListboxItem>
      </XhListboxContent>
      <XhListboxEmpty>还没有成员，先取一页试试</XhListboxEmpty>
      <XhListboxLoading>正在取成员…</XhListboxLoading>
      <XhListboxLoadMoreTrigger
        v-if="members.length < pool.length"
        @click="loadMore"
      >
        取下一页
      </XhListboxLoadMoreTrigger>
    </XhListboxRoot>
    <button type="button" @click="members = []">清空</button>
  </div>
  <p>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 8px; max-inline-size: 320px">
  <xh-listbox id="listbox-phases">
    <div data-xh-part="root">
      <span data-xh-part="label">成员</span>
      <div data-xh-part="content">
        <div data-xh-part="item" value="liuyi">
          <span data-xh-part="item-text">刘一</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="chener">
          <span data-xh-part="item-text">陈二</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="zhangsan">
          <span data-xh-part="item-text">张三</span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
      <div data-xh-part="empty">还没有成员，先取一页试试</div>
      <div data-xh-part="loading">正在取成员…</div>
      <button data-xh-part="load-more-trigger">取下一页</button>
    </div>
  </xh-listbox>
  <button id="listbox-phases-reset" type="button">清空</button>
</div>
<p>已选：<span id="listbox-phases-value">（无）</span></p>

<script type="module">
  const pool = [
    { value: "liuyi", label: "刘一" },
    { value: "chener", label: "陈二" },
    { value: "zhangsan", label: "张三" },
    { value: "lisi", label: "李四" },
    { value: "wangwu", label: "王五" },
    { value: "zhaoliu", label: "赵六" },
  ];

  const list = document.getElementById("listbox-phases");
  const content = list.querySelector('[data-xh-part="content"]');
  const trigger = list.querySelector('[data-xh-part="load-more-trigger"]');
  const readout = document.getElementById("listbox-phases-value");

  // 受控：条目由 collection 铺开，标记里那三条是首屏
  list.value = [];
  list.collection = pool.slice(0, 3);

  // 条目节点跟着 collection 重铺：身份只报 value，文本与禁用都在数据里
  function render() {
    content.replaceChildren();
    for (const node of list.collection) {
      const item = document.createElement("div");
      item.dataset.xhPart = "item";
      item.setAttribute("value", node.value);
      const text = document.createElement("span");
      text.dataset.xhPart = "item-text";
      text.textContent = node.label;
      const mark = document.createElement("span");
      mark.dataset.xhPart = "item-indicator";
      item.append(text, mark);
      content.append(item);
    }
    trigger.hidden = list.collection.length >= pool.length;
  }

  trigger.addEventListener("click", () => {
    list.loading = true;
    window.setTimeout(() => {
      list.collection = pool.slice(0, list.collection.length + 3);
      list.loading = false;
      render();
    }, 600);
  });

  document
    .getElementById("listbox-phases-reset")
    .addEventListener("click", () => {
      list.collection = [];
      render();
    });

  list.addEventListener("value-change", (event) => {
    list.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 语气

tone 决定选中条目的勾选标记用哪族颜色，未选中的条目不受影响

```vue
<script setup lang="ts">
import { XhListboxRoot } from "@xihan-ui/vue";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "london", label: "London 伦敦" },
];
const tones = ["brand", "neutral", "success", "warning", "danger", "info"];
</script>

<template>
  <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))">
    <XhListboxRoot
      v-for="tone in tones"
      :key="tone"
      :tone="tone"
      :collection="cities"
      :default-value="['beijing']"
      :label="tone"
    />
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))">
  <xh-listbox tone="brand" value="beijing">
    <div data-xh-part="root">
      <span data-xh-part="label">brand</span>
      <div data-xh-part="content">
        <div data-xh-part="item" value="beijing">
          <span data-xh-part="item-text">Beijing 北京</span>
          <span data-xh-part="item-indicator"></span>
        </div>
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
  </xh-listbox>

  <xh-listbox tone="neutral" value="beijing">
    <div data-xh-part="root">
      <span data-xh-part="label">neutral</span>
      <div data-xh-part="content">
        <div data-xh-part="item" value="beijing">
          <span data-xh-part="item-text">Beijing 北京</span>
          <span data-xh-part="item-indicator"></span>
        </div>
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
  </xh-listbox>

  <xh-listbox tone="success" value="beijing">
    <div data-xh-part="root">
      <span data-xh-part="label">success</span>
      <div data-xh-part="content">
        <div data-xh-part="item" value="beijing">
          <span data-xh-part="item-text">Beijing 北京</span>
          <span data-xh-part="item-indicator"></span>
        </div>
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
  </xh-listbox>

  <xh-listbox tone="warning" value="beijing">
    <div data-xh-part="root">
      <span data-xh-part="label">warning</span>
      <div data-xh-part="content">
        <div data-xh-part="item" value="beijing">
          <span data-xh-part="item-text">Beijing 北京</span>
          <span data-xh-part="item-indicator"></span>
        </div>
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
  </xh-listbox>

  <xh-listbox tone="danger" value="beijing">
    <div data-xh-part="root">
      <span data-xh-part="label">danger</span>
      <div data-xh-part="content">
        <div data-xh-part="item" value="beijing">
          <span data-xh-part="item-text">Beijing 北京</span>
          <span data-xh-part="item-indicator"></span>
        </div>
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
  </xh-listbox>

  <xh-listbox tone="info" value="beijing">
    <div data-xh-part="root">
      <span data-xh-part="label">info</span>
      <div data-xh-part="content">
        <div data-xh-part="item" value="beijing">
          <span data-xh-part="item-text">Beijing 北京</span>
          <span data-xh-part="item-indicator"></span>
        </div>
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
  </xh-listbox>
</div>
```

## 设计指引

### 何时使用

- 选项需要常驻可见（穿梭框的两侧、设置面板的左栏）。
- 需要多选、范围选（Shift）与全选（Cmd + A）。

### 何时不用

- 选项要收起来：用[选择器](./select)。
- 列表只是展示、不可选：用[列表](./list)。

### 特性

- 三种选择模式：单选、多选、以及带 Shift 范围扩展的模式。
- `typeahead` 连打检索。
- 定高滚动与三种非条目相位都有对应部件：空（`empty`）、在途（`loading`）、还有更多（`load-more-trigger`）。
- `loading` 为真时列表报 `aria-busy`，在途占位顶上来、空态占位让位；给了 `collection` 时两者的收放归连接层。
- `collection` 为空时，列表本体隐藏并退出 Tab 序列；不保留空描边。条目手写时，空白文本、只有标题的空组、带 `hidden` 的条目和分组都不算可见候选；禁用条目仍属于有效内容。
- `load-more-trigger` 是取下一页的入口：还有没有下一页、点了做什么都归作者，连接层只保证在途与整列禁用两档点不动。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-listbox>` |
| Vue 组件 | `XhListboxContent` `XhListboxEmpty` `XhListboxGroup` `XhListboxGroupLabel` `XhListboxItem` `XhListboxItemIndicator` `XhListboxItemText` `XhListboxLabel` `XhListboxLoadMoreTrigger` `XhListboxLoading` `XhListboxRoot` |
| 组合式函数 | `useListbox` |
| 状态机 | `listboxMachine` |
| 皮肤 | `@xihan-ui/styles/listbox.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="listbox"`：`root` · `label` · **`content`** · `item` · `item-text` · `item-indicator` · `group` · `group-label` · `empty` · `loading` · `load-more-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ListboxNode[]` |  | 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用都写在条目部件上」的老路。 |
| `value` | `string \| string[]` |  | 选中值，给定即受控；单选可写成裸串，内部归一成数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `selectionMode` | `ListboxSelectionMode` |  | 选择模式，默认 single。 |
| `disabled` | `boolean` |  | 整个列表禁用，键盘与点击都不再改选中值。 |
| `readOnly` | `boolean` |  | 只读：条目照常浏览与聚焦，但选中值改不动。禁用则连焦点带都退出。 |
| `loading` | `boolean` |  | 条目还在取：列表报 aria-busy，在途占位顶上来，空态占位让位。 |
| `invalid` | `boolean` |  | 校验失败：列表报 aria-invalid，各角色节点带 data-invalid。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定勾选标记用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定条目的几何档位。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 vertical。 |
| `typeahead` | `boolean` |  | 连打检索，默认开。 |
| `onValueChange` | `(details: ListboxValueChangeDetails) => void` |  | value 变化意图回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ListboxValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhListboxRoot` | `default` | `ListboxRootSlotProps` |  |
| `XhListboxRoot` | `label` | — |  |
| `XhListboxRoot` | `item` | `ListboxNodeMeta` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.CLEAR` · `ITEM.SELECT` · `ITEM.TOGGLE` · `ITEM.FOCUS` · `FOCUS.CLEAR` · `LIST.BLUR`

## connect API

`useListbox` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 选中集合；单选模式下长度 ≤ 1。 |
| `collection` | `readonly ListboxNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `selectionMode` | `ListboxSelectionMode` | 生效的选择模式。 |
| `focusedValue` | `string \| null` | 焦点锚点；焦点不在列表内时为 null。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `loading` | `boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `setValue` | `(next: string[]) => void` |  |
| `select` | `(value: string) => void` | 只留这一个；加选用 toggle。 |
| `toggle` | `(value: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getEmptyProps` | `() => T['element']` | 空态占位：放在 root 里、content 的兄弟。 给了 collection 时由连接层按条数收放；条目手写时不写 hidden，露不露面归作者。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一个位置，两者不同屏——取数期间它顶上来，空态让位。 给了 collection 时由连接层按条数收放；条目手写时只按 loading 收放。 |
| `getLoadMoreTriggerProps` | `() => T['element']` | 取下一页的入口：库不知道还有没有下一页，露不露面与点了做什么都归作者， 连接层只保证取数在途与整列禁用两档点不动。 |
| `getGroupProps` | `(props: ListboxGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: ListboxGroupProps) => T['element']` |  |
| `getItemProps` | `(props: ListboxItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: ListboxItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: ListboxItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the listbox | 整个列表只占一个 Tab 位：焦点进入锚点条目，无锚点时先落容器再由它转投 |
| `ArrowDown` | focus in listbox, orientation=vertical | 焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕）；orientation=horizontal 时改由 ArrowRight 承担，dir=rtl 再对调左右 |
| `ArrowUp` | focus in listbox, orientation=vertical | 焦点移到上一个可停留条目（禁用项跳过、尽头按 loop 回绕）；orientation=horizontal 时改由 ArrowLeft 承担，dir=rtl 再对调左右 |
| `Home` | focus in listbox | 焦点移到首个可停留条目 |
| `End` | focus in listbox | 焦点移到末个可停留条目 |
| `Enter` / `Space` | focus on item, selectionMode 为 single 或 extended | 只选中焦点条目，替换原有选中；条目自报禁用则不认 |
| `Space` / `Enter` / `Ctrl+Space` | focus on item, 可多选（multiple；extended 下须按住 Ctrl/Cmd） | 切换焦点条目的选中态，其余选中不动 |
| `Shift+ArrowDown` / `Shift+ArrowUp` | focus in listbox, 可多选 | 焦点移到相邻条目并切换它的选中态；往回走即把刚扩进来的那个摘掉 |
| `Ctrl+A` / `Cmd+A` | focus in listbox, 可多选 | 选中全部可选条目；已经全选则把它们一并取消（禁用但已选中的不动） |
| `单个可打印字符` | focus in listbox, typeahead 未关 | 连打检索把焦点移到首字母匹配的条目，不改选中值 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `content` | `aria-busy` | 'true' \| undefined |
| `content` | `aria-disabled` | 'true' \| 'false' |
| `content` | `aria-invalid` | 'true' \| 'false' |
| `content` | `aria-labelledby` | `label` 部件的 id |
| `content` | `aria-multiselectable` | 'true' \| 'false' |
| `content` | `aria-orientation` | props.orientation |
| `content` | `aria-readonly` | 'true' \| 'false' |
| `content` | `role` | 'listbox' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-indicator` | `aria-hidden` | 'true' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |

## 样式

默认皮肤 `@xihan-ui/styles/listbox.css` 按部件选择：`[data-scope="listbox"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `content` | `data-disabled` | ''（条件成立时才出现） |
| `content` | `data-invalid` | ''（条件成立时才出现） |
| `content` | `data-orientation` | props.orientation |
| `content` | `data-readonly` | ''（条件成立时才出现） |
| `group` | `data-disabled` | ''（条件成立时才出现） |
| `group-label` | `data-disabled` | ''（条件成立时才出现） |
| `empty` | `data-disabled` | ''（条件成立时才出现） |
| `loading` | `data-disabled` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-loading` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-listbox-content-bg` | `content` | `background` | `default` | `--xh-bg-surface` | listbox 的 content 部件 background 覆盖槽。 |
| `--xh-listbox-content-border` | `content` | `border` | `default` | `--xh-border-default` | listbox 的 content 部件 border 覆盖槽。 |
| `--xh-listbox-content-border-invalid` | `content` | `border-color` | `invalid` | `--xh-border-invalid` | listbox 的 content 部件 border-color 覆盖槽。 |
| `--xh-listbox-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | listbox 的 content 部件 color 覆盖槽。 |
| `--xh-listbox-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` | listbox 的 content 部件 gap 覆盖槽。 |
| `--xh-listbox-content-max-h` | `content` | `max-block-size` | `default` | `--xh-viewport-h-md` | listbox 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-listbox-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` | listbox 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` | listbox 的 content 部件 padding-block 覆盖槽。 |
| `--xh-listbox-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | listbox 的 content 部件 border-radius 覆盖槽。 |
| `--xh-listbox-empty-fg` | `empty` | `color` | `default` | `--xh-fg-subtle` | listbox 的 empty 部件 color 覆盖槽。 |
| `--xh-listbox-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_listbox-font-size` | listbox 的 empty 部件 font-size 覆盖槽。 |
| `--xh-listbox-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` | listbox 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-listbox-gap` | `root` | `gap` | `default` | `--xh-space-2` | listbox 的 root 部件 gap 覆盖槽。 |
| `--xh-listbox-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | listbox 的 group 部件 gap 覆盖槽。 |
| `--xh-listbox-group-label-fg` | `group-label` | `color` | `default` | `--xh-fg-subtle` | listbox 的 group-label 部件 color 覆盖槽。 |
| `--xh-listbox-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | listbox 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-listbox-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | listbox 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-listbox-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | listbox 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-listbox-group-spacing` | `content`<br>`group`<br>`item` | `margin-block-start` | `has([data-scope='listbox'][data-part='item']:not([hidden])`<br>`not([data-scope='listbox'][data-part='content'] [hidden] *)` | `--xh-space-1_5` | listbox 的 content、group、item 部件 margin-block-start 覆盖槽。 |
| `--xh-listbox-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | listbox 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-listbox-item-bg-hover` | `item` | `background` | `disabled`<br>`highlighted`<br>`is(:hover, [data-highlighted], :focus-visible)`<br>`not([data-disabled])` | `--xh-bg-subtle` | listbox 的 item 部件 background 覆盖槽。 |
| `--xh-listbox-item-fg` | `item` | `color` | `default`<br>`state=checked` | `--xh-fg-default` | listbox 的 item 部件 color 覆盖槽。 |
| `--xh-listbox-item-fg-selected` | `item` | `color` | `state=checked` | `--xh-listbox-item-fg` | listbox 的 item 部件 color 覆盖槽。 |
| `--xh-listbox-item-font-size` | `item` | `font-size` | `default` | `--xh-_listbox-font-size` | listbox 的 item 部件 font-size 覆盖槽。 |
| `--xh-listbox-item-font-weight-selected` | `item` | `font-weight` | `state=checked` | `--xh-font-weight-regular` | listbox 的 item 部件 font-weight 覆盖槽。 |
| `--xh-listbox-item-gap` | `item` | `gap` | `default` | `--xh-_listbox-gap` | listbox 的 item 部件 gap 覆盖槽。 |
| `--xh-listbox-item-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_listbox-accent` | listbox 的 item-indicator 部件 color 覆盖槽。 |
| `--xh-listbox-item-indicator-size` | `item-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | listbox 的 item-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-listbox-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | listbox 的 item 部件 line-height 覆盖槽。 |
| `--xh-listbox-item-px` | `item` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-item-py` | `item` | `padding-block` | `default` | `--xh-_listbox-item-py` | listbox 的 item 部件 padding-block 覆盖槽。 |
| `--xh-listbox-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | listbox 的 item 部件 border-radius 覆盖槽。 |
| `--xh-listbox-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | listbox 的 label 部件 color 覆盖槽。 |
| `--xh-listbox-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | listbox 的 label 部件 font-size 覆盖槽。 |
| `--xh-listbox-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | listbox 的 label 部件 font-weight 覆盖槽。 |
| `--xh-listbox-load-more-trigger-bg-hover` | `load-more-trigger` | `background-color` | `hover` | `--xh-bg-subtle` | listbox 的 load-more-trigger 部件 background-color 覆盖槽。 |
| `--xh-listbox-load-more-trigger-fg` | `load-more-trigger` | `color` | `default` | `--xh-_tone-fg` | listbox 的 load-more-trigger 部件 color 覆盖槽。 |
| `--xh-listbox-load-more-trigger-font-size` | `load-more-trigger` | `font-size` | `default` | `--xh-_listbox-font-size` | listbox 的 load-more-trigger 部件 font-size 覆盖槽。 |
| `--xh-listbox-load-more-trigger-gap` | `load-more-trigger` | `gap` | `default` | `--xh-_listbox-gap` | listbox 的 load-more-trigger 部件 gap 覆盖槽。 |
| `--xh-listbox-load-more-trigger-px` | `load-more-trigger` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 load-more-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-load-more-trigger-py` | `load-more-trigger` | `padding-block` | `default` | `--xh-_listbox-item-py` | listbox 的 load-more-trigger 部件 padding-block 覆盖槽。 |
| `--xh-listbox-load-more-trigger-radius` | `load-more-trigger` | `border-radius` | `default` | `--xh-shape-control` | listbox 的 load-more-trigger 部件 border-radius 覆盖槽。 |
| `--xh-listbox-loading-fg` | `loading` | `color` | `default` | `--xh-fg-subtle` | listbox 的 loading 部件 color 覆盖槽。 |
| `--xh-listbox-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_listbox-font-size` | listbox 的 loading 部件 font-size 覆盖槽。 |
| `--xh-listbox-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 loading 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` | listbox 的 loading 部件 padding-block 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `background-color` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 作为[穿梭框](./transfer)的内层；长列表配[虚拟滚动](./virtualizer)。
- **弹出式选择**：把本组件装进[浮层](./popover)——触发器显示当前选中项，落值时自己收起浮层，浮层底部还能放操作按钮。不参与表单、也不带输入框的那种就地切换（排序方式、显示密度）走这一种写法，不必另找组件；要随表单提交才用[选择器](./select)。这是本库「浮层壳 + 条目层」的官方组合写法：浮层只管开合与定位，条目、键盘导航、连打检索与选中语义全在本组件里，换一个浮层壳（[菜单](./menu)、[气泡卡片](./popover)）写法不变。示例见本页「弹出式选择」与[选择器](./select)页的同一例。

## 最佳实践

- 单选、多选与 Select 使用同一视觉规则：对号表示选中，中性底表示悬停或键盘高亮，正文不变色、不加粗。
- 自定义条目应显式组合 `item-indicator`；该部件固定在逻辑末端，未选中时保留空间，避免选择时文字移动。
- 空态和加载文案由作者通过 `Empty` / `Loading` 部件提供，放在 `root` 中作为 `content` 的兄弟。默认按 `collection` 渲染时没有额外状态文案，不会自动制造提示、假选项或空白状态块；需要提示时使用现有复合部件。
- 给了 `collection` 时用同一份数据表达当前候选，空态与首次加载自动互斥；手写条目时由作者控制状态部件的 `hidden`。条目过滤使用 `hidden` 或移除节点，隐藏分组不参与方向键、连打、区间选择和全选；任意样式类的可见性由作者自行管理。

- 多选时给出"已选 N 项"的回显，否则滚动后用户不知道选了多少。
- 定高，别让列表把页面撑到需要整页滚动。

## 反模式

- 用它承载命令：列表框的条目是选项不是动作。
- 选项超过几百条却不虚拟化。
