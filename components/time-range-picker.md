来源：https://ui.docs.xihanfun.com/components/time-range-picker

# TimeRangePicker 时间范围选择器 `new`

将起止两组可键入的分段时间框、范围分隔符、时钟触发器和两组并排的分列选择浮层组合成一个字段。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/time-range-picker" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/time-range-picker.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/time-range-picker" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/time-range-picker" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/time-range-picker.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

起止两组输入框与两组选择面板共享同一份值；按 15 分钟列出选项并实时显示结果

```vue
<script setup lang="ts">
import {
  XhTimeRangePickerClearTrigger,
  XhTimeRangePickerColumn,
  XhTimeRangePickerColumnGroup,
  XhTimeRangePickerColumnGroupLabel,
  XhTimeRangePickerContent,
  XhTimeRangePickerControl,
  XhTimeRangePickerHiddenInput,
  XhTimeRangePickerItem,
  XhTimeRangePickerLabel,
  XhTimeRangePickerPositioner,
  XhTimeRangePickerRangeSeparator,
  XhTimeRangePickerRoot,
  XhTimeRangePickerSegment,
  XhTimeRangePickerSegmentGroup,
  XhTimeRangePickerTrigger,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const value = ref<string[]>(["09:00", "18:00"]);
// 值恒为两端：只填了终点时是 ['', end]
const text = computed(() => (value.value[0] && value.value[1] ? `${value.value[0]} → ${value.value[1]}` : "（未填齐）"));
</script>

<template>
  <XhTimeRangePickerRoot
    v-model:value="value"
    name="open-at"
    end-name="close-at"
    :step="15"
  >
    <XhTimeRangePickerLabel>营业时段</XhTimeRangePickerLabel>
    <XhTimeRangePickerControl>
      <!-- 端号定这组段位认领哪一端：0 起点、1 终点 -->
      <XhTimeRangePickerSegmentGroup :index="0">
        <XhTimeRangePickerSegment segment="hour" />
        <span>:</span>
        <XhTimeRangePickerSegment segment="minute" />
      </XhTimeRangePickerSegmentGroup>
      <XhTimeRangePickerRangeSeparator />
      <XhTimeRangePickerSegmentGroup :index="1">
        <XhTimeRangePickerSegment segment="hour" />
        <span>:</span>
        <XhTimeRangePickerSegment segment="minute" />
      </XhTimeRangePickerSegmentGroup>
      <XhTimeRangePickerClearTrigger />
      <XhTimeRangePickerTrigger />
    </XhTimeRangePickerControl>
    <!-- 两份表单出口：0 是起点，1 是终点 -->
    <XhTimeRangePickerHiddenInput :index="0" />
    <XhTimeRangePickerHiddenInput :index="1" />
    <XhTimeRangePickerPositioner>
      <XhTimeRangePickerContent>
        <!-- 起止各一组时列，端号写在外壳上，组内的列与格子跟着它走 -->
        <XhTimeRangePickerColumnGroup v-for="(label, end) in ['开始', '结束']" :key="end" :index="end">
          <XhTimeRangePickerColumnGroupLabel>{{ label }}</XhTimeRangePickerColumnGroupLabel>
          <XhTimeRangePickerColumn v-slot="{ options }" unit="hour">
            <XhTimeRangePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimeRangePickerColumn>
          <XhTimeRangePickerColumn v-slot="{ options }" unit="minute">
            <XhTimeRangePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimeRangePickerColumn>
        </XhTimeRangePickerColumnGroup>
      </XhTimeRangePickerContent>
    </XhTimeRangePickerPositioner>
  </XhTimeRangePickerRoot>

  <span aria-live="polite" style="font-size: 13px">
    当前值：{{ text }}
  </span>
</template>
```

```html
<div id="time-range-picker-basic"></div>
<span aria-live="polite" style="font-size: 13px">
  当前值：<span id="time-range-picker-basic-value">（未填齐）</span>
</span>

<!-- 结构先收在模板里：两组列里的格子要在元素接线前就位，所以铺满了才入页 -->
<template id="time-range-picker-basic-shell">
  <xh-time-range-picker name="open-at" end-name="close-at" step="15">
    <div data-xh-part="root">
      <label data-xh-part="label">营业时段</label>
      <div data-xh-part="control">
        <!-- 文档序在前的这组认领起点，在后的认领终点；也可以像这里一样显式写 index -->
        <div data-xh-part="segment-group" index="0">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
        <span data-xh-part="range-separator">-</span>
        <div data-xh-part="segment-group" index="1">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
        <button data-xh-part="clear-trigger"></button>
        <button data-xh-part="trigger"></button>
      </div>
      <!-- 两份表单出口：文档序对应起止两端 -->
      <input data-xh-part="hidden-input" />
      <input data-xh-part="hidden-input" />
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <!-- 起止各一组时列：列里的格子由脚本按 columnGroups 铺 -->
          <div data-xh-part="column-group" index="0">
            <div data-xh-part="column-group-label">开始</div>
            <div data-xh-part="column" unit="hour"></div>
            <div data-xh-part="column" unit="minute"></div>
          </div>
          <div data-xh-part="column-group" index="1">
            <div data-xh-part="column-group-label">结束</div>
            <div data-xh-part="column" unit="hour"></div>
            <div data-xh-part="column" unit="minute"></div>
          </div>
        </div>
      </div>
    </div>
  </xh-time-range-picker>
</template>

<script type="module">
  const stage = document.getElementById("time-range-picker-basic");
  const readout = document.getElementById("time-range-picker-basic-value");
  const node = document.getElementById("time-range-picker-basic-shell").content.cloneNode(true);
  const picker = node.querySelector("xh-time-range-picker");
  // 浮层展开后 content 会被搬到落点，之后从元素往下查不到它；先把它记住
  const content = picker.querySelector('[data-xh-part="content"]');

  // 每列上一次画的是哪一串值，没变就不动它（正在用方向键走的那一列不该被换掉）
  const painted = new Map();

  function itemNode(value) {
    const cell = document.createElement("div");
    cell.dataset.xhPart = "item";
    cell.setAttribute("value", value);
    // 格子上的字由组件按 locale 填
    return cell;
  }

  // 两组各自该排哪几列、每列有哪些格由组件给；区间约束只切换格子的禁用态，不删节点
  function paint() {
    content.querySelectorAll('[data-xh-part="column-group"]').forEach((group, index) => {
      const columns = picker.columnGroups[index].columns;
      for (const column of group.querySelectorAll('[data-xh-part="column"]')) {
        const unit = column.getAttribute("unit");
        const options = columns.find((c) => c.unit === unit)?.options ?? [];
        const shape = options.join(",");
        if (painted.get(column) === shape) continue;
        painted.set(column, shape);
        column.replaceChildren(...options.map(itemNode));
      }
    });
  }

  function show([start, end]) {
    readout.textContent = start && end ? `${start} → ${end}` : "（未填齐）";
  }

  picker.addEventListener("value-change", async (event) => {
    picker.value = event.detail.value;
    show(event.detail.value);
    // 受控值要等元素这一轮更新把它送进机器，之后各格才会按新边界刷新禁用态
    await picker.updateComplete;
    paint();
  });
  // 挑一格、敲一个数字都可能让别的列刷新禁用态；浮层被搬走后事件不再经过元素，
  // 所以挂在 content 自己身上，等机器处理完这一下再重读一遍
  for (const type of ["click", "keydown"])
    content.addEventListener(type, () => queueMicrotask(paint));

  // 元素一连上就能读 columnGroups；接线排在微任务里，同步铺好的格子赶得上。
  // 数组只走 property；值由宿主持有，事件里写回才生效
  const initial = ["09:00", "18:00"];
  stage.append(node);
  picker.value = initial;
  paint();
  show(initial);
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="time-range-picker"`：**`root`** · `label` · **`control`** · **`segment-group`** · **`segment`** · `range-separator` · **`trigger`** · `clear-trigger` · `positioner` · **`content`** · `preset-group` · `preset` · **`column-group`** · `column-group-label` · `column` · `item` · `hidden-input`

## 示例

### 可选时段

min/max 与另一端边界把界外格标为禁用，两组列的结构与滚动位置保持稳定

```vue
<script setup lang="ts">
import {
  XhTimeRangePickerClearTrigger,
  XhTimeRangePickerColumn,
  XhTimeRangePickerColumnGroup,
  XhTimeRangePickerColumnGroupLabel,
  XhTimeRangePickerContent,
  XhTimeRangePickerControl,
  XhTimeRangePickerItem,
  XhTimeRangePickerLabel,
  XhTimeRangePickerPositioner,
  XhTimeRangePickerRangeSeparator,
  XhTimeRangePickerRoot,
  XhTimeRangePickerSegment,
  XhTimeRangePickerSegmentGroup,
  XhTimeRangePickerTrigger,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const value = ref<string[]>(["10:00", ""]);
const text = computed(() => (value.value[0] && value.value[1] ? `${value.value[0]} → ${value.value[1]}` : "（未填齐）"));
</script>

<template>
  <XhTimeRangePickerRoot
    v-model:value="value"
    min="08:00"
    max="20:00"
    :step="30"
  >
    <XhTimeRangePickerLabel>预约时段</XhTimeRangePickerLabel>
    <XhTimeRangePickerControl>
      <!-- 端号定这组段位认领哪一端：0 起点、1 终点 -->
      <XhTimeRangePickerSegmentGroup :index="0">
        <XhTimeRangePickerSegment segment="hour" />
        <span>:</span>
        <XhTimeRangePickerSegment segment="minute" />
      </XhTimeRangePickerSegmentGroup>
      <XhTimeRangePickerRangeSeparator />
      <XhTimeRangePickerSegmentGroup :index="1">
        <XhTimeRangePickerSegment segment="hour" />
        <span>:</span>
        <XhTimeRangePickerSegment segment="minute" />
      </XhTimeRangePickerSegmentGroup>
      <XhTimeRangePickerClearTrigger />
      <XhTimeRangePickerTrigger />
    </XhTimeRangePickerControl>
    <XhTimeRangePickerPositioner>
      <XhTimeRangePickerContent>
        <!-- 起止各一组时列，端号写在外壳上，组内的列与格子跟着它走 -->
        <XhTimeRangePickerColumnGroup v-for="(label, end) in ['开始', '结束']" :key="end" :index="end">
          <XhTimeRangePickerColumnGroupLabel>{{ label }}</XhTimeRangePickerColumnGroupLabel>
          <XhTimeRangePickerColumn v-slot="{ options }" unit="hour">
            <XhTimeRangePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimeRangePickerColumn>
          <XhTimeRangePickerColumn v-slot="{ options }" unit="minute">
            <XhTimeRangePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimeRangePickerColumn>
        </XhTimeRangePickerColumnGroup>
      </XhTimeRangePickerContent>
    </XhTimeRangePickerPositioner>
  </XhTimeRangePickerRoot>

  <span aria-live="polite" style="font-size: 13px">
    当前值：{{ text }}
  </span>
</template>
```

```html
<div id="time-range-picker-bounds"></div>
<span aria-live="polite" style="font-size: 13px">
  当前值：<span id="time-range-picker-bounds-value">（未填齐）</span>
</span>

<!-- 结构先收在模板里：两组列里的格子要在元素接线前就位，所以铺满了才入页 -->
<template id="time-range-picker-bounds-shell">
  <xh-time-range-picker min="08:00" max="20:00" step="30">
    <div data-xh-part="root">
      <label data-xh-part="label">预约时段</label>
      <div data-xh-part="control">
        <!-- 文档序在前的这组认领起点，在后的认领终点；也可以像这里一样显式写 index -->
        <div data-xh-part="segment-group" index="0">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
        <span data-xh-part="range-separator">-</span>
        <div data-xh-part="segment-group" index="1">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
        <button data-xh-part="clear-trigger"></button>
        <button data-xh-part="trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <!-- 起止各一组时列：列里的格子由脚本按 columnGroups 铺 -->
          <div data-xh-part="column-group" index="0">
            <div data-xh-part="column-group-label">开始</div>
            <div data-xh-part="column" unit="hour"></div>
            <div data-xh-part="column" unit="minute"></div>
          </div>
          <div data-xh-part="column-group" index="1">
            <div data-xh-part="column-group-label">结束</div>
            <div data-xh-part="column" unit="hour"></div>
            <div data-xh-part="column" unit="minute"></div>
          </div>
        </div>
      </div>
    </div>
  </xh-time-range-picker>
</template>

<script type="module">
  const stage = document.getElementById("time-range-picker-bounds");
  const readout = document.getElementById("time-range-picker-bounds-value");
  const node = document.getElementById("time-range-picker-bounds-shell").content.cloneNode(true);
  const picker = node.querySelector("xh-time-range-picker");
  // 浮层展开后 content 会被搬到落点，之后从元素往下查不到它；先把它记住
  const content = picker.querySelector('[data-xh-part="content"]');

  // 每列上一次画的是哪一串值，没变就不动它（正在用方向键走的那一列不该被换掉）
  const painted = new Map();

  function itemNode(value) {
    const cell = document.createElement("div");
    cell.dataset.xhPart = "item";
    cell.setAttribute("value", value);
    // 格子上的字由组件按 locale 填
    return cell;
  }

  // 两组各自该排哪几列、每列有哪些格由组件给；区间约束只切换格子的禁用态，不删节点
  function paint() {
    content.querySelectorAll('[data-xh-part="column-group"]').forEach((group, index) => {
      const columns = picker.columnGroups[index].columns;
      for (const column of group.querySelectorAll('[data-xh-part="column"]')) {
        const unit = column.getAttribute("unit");
        const options = columns.find((c) => c.unit === unit)?.options ?? [];
        const shape = options.join(",");
        if (painted.get(column) === shape) continue;
        painted.set(column, shape);
        column.replaceChildren(...options.map(itemNode));
      }
    });
  }

  function show([start, end]) {
    readout.textContent = start && end ? `${start} → ${end}` : "（未填齐）";
  }

  picker.addEventListener("value-change", async (event) => {
    picker.value = event.detail.value;
    show(event.detail.value);
    // 受控值要等元素这一轮更新把它送进机器，之后各格才会按新边界刷新禁用态
    await picker.updateComplete;
    paint();
  });
  // 挑一格、敲一个数字都可能让别的列刷新禁用态；浮层被搬走后事件不再经过元素，
  // 所以挂在 content 自己身上，等机器处理完这一下再重读一遍
  for (const type of ["click", "keydown"])
    content.addEventListener(type, () => queueMicrotask(paint));

  // 元素一连上就能读 columnGroups；接线排在微任务里，同步铺好的格子赶得上。
  // 数组只走 property；值由宿主持有，事件里写回才生效
  const initial = ["10:00", ""];
  stage.append(node);
  picker.value = initial;
  paint();
  show(initial);
</script>
```

### 快捷选项

presets 在两组列旁边多排一列，点击一条即把两端整份写入值并收起

```vue
<script setup lang="ts">
import { timeRangePickerPresetFromNow, timeRangePickerPresetValue } from "@xihan-ui/headless";
import {
  XhTimeRangePickerClearTrigger,
  XhTimeRangePickerColumn,
  XhTimeRangePickerColumnGroup,
  XhTimeRangePickerColumnGroupLabel,
  XhTimeRangePickerContent,
  XhTimeRangePickerControl,
  XhTimeRangePickerItem,
  XhTimeRangePickerLabel,
  XhTimeRangePickerPositioner,
  XhTimeRangePickerPresetGroup,
  XhTimeRangePickerRangeSeparator,
  XhTimeRangePickerRoot,
  XhTimeRangePickerSegment,
  XhTimeRangePickerSegmentGroup,
  XhTimeRangePickerTrigger,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const value = ref<string[]>([]);
const text = computed(() => (value.value[0] && value.value[1] ? `${value.value[0]} → ${value.value[1]}` : "（未填齐）"));

// 时刻在自己的 computed 里算好再传：库不在渲染期算「此刻」
const presets = computed(() => [
  { label: "接下来一小时", value: timeRangePickerPresetFromNow(60) },
  { label: "上午", value: timeRangePickerPresetValue("09:00", "12:00") },
  { label: "下午", value: timeRangePickerPresetValue("13:30", "18:00") },
  { label: "全天", value: timeRangePickerPresetValue("09:00", "18:00") },
]);
</script>

<template>
  <XhTimeRangePickerRoot v-model:value="value" :presets="presets" :step="15">
    <XhTimeRangePickerLabel>会议时段</XhTimeRangePickerLabel>
    <XhTimeRangePickerControl>
      <!-- 端号定这组段位认领哪一端：0 起点、1 终点 -->
      <XhTimeRangePickerSegmentGroup :index="0">
        <XhTimeRangePickerSegment segment="hour" />
        <span>:</span>
        <XhTimeRangePickerSegment segment="minute" />
      </XhTimeRangePickerSegmentGroup>
      <XhTimeRangePickerRangeSeparator />
      <XhTimeRangePickerSegmentGroup :index="1">
        <XhTimeRangePickerSegment segment="hour" />
        <span>:</span>
        <XhTimeRangePickerSegment segment="minute" />
      </XhTimeRangePickerSegmentGroup>
      <XhTimeRangePickerClearTrigger />
      <XhTimeRangePickerTrigger />
    </XhTimeRangePickerControl>
    <XhTimeRangePickerPositioner>
      <XhTimeRangePickerContent>
        <!-- 不写默认插槽就按 presets 数据自动铺，产出的 DOM 与手写部件一致 -->
        <XhTimeRangePickerPresetGroup />
        <!-- 起止各一组时列，端号写在外壳上，组内的列与格子跟着它走 -->
        <XhTimeRangePickerColumnGroup v-for="(label, end) in ['开始', '结束']" :key="end" :index="end">
          <XhTimeRangePickerColumnGroupLabel>{{ label }}</XhTimeRangePickerColumnGroupLabel>
          <XhTimeRangePickerColumn v-slot="{ options }" unit="hour">
            <XhTimeRangePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimeRangePickerColumn>
          <XhTimeRangePickerColumn v-slot="{ options }" unit="minute">
            <XhTimeRangePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimeRangePickerColumn>
        </XhTimeRangePickerColumnGroup>
      </XhTimeRangePickerContent>
    </XhTimeRangePickerPositioner>
  </XhTimeRangePickerRoot>

  <span aria-live="polite" style="font-size: 13px">
    当前值：{{ text }}
  </span>
</template>
```

```html
<div id="time-range-picker-presets"></div>
<span aria-live="polite" style="font-size: 13px">
  当前值：<span id="time-range-picker-presets-value">（未填齐）</span>
</span>

<!-- 结构先收在模板里：两组列里的格子要在元素接线前就位，所以铺满了才入页 -->
<template id="time-range-picker-presets-shell">
  <xh-time-range-picker step="15">
    <div data-xh-part="root">
      <label data-xh-part="label">会议时段</label>
      <div data-xh-part="control">
        <!-- 文档序在前的这组认领起点，在后的认领终点；也可以像这里一样显式写 index -->
        <div data-xh-part="segment-group" index="0">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
        <span data-xh-part="range-separator">-</span>
        <div data-xh-part="segment-group" index="1">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
        <button data-xh-part="clear-trigger"></button>
        <button data-xh-part="trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="preset-group"></div>
          <!-- 起止各一组时列：列里的格子由脚本按 columnGroups 铺 -->
          <div data-xh-part="column-group" index="0">
            <div data-xh-part="column-group-label">开始</div>
            <div data-xh-part="column" unit="hour"></div>
            <div data-xh-part="column" unit="minute"></div>
          </div>
          <div data-xh-part="column-group" index="1">
            <div data-xh-part="column-group-label">结束</div>
            <div data-xh-part="column" unit="hour"></div>
            <div data-xh-part="column" unit="minute"></div>
          </div>
        </div>
      </div>
    </div>
  </xh-time-range-picker>
</template>

<script type="module">
  const stage = document.getElementById("time-range-picker-presets");
  const readout = document.getElementById("time-range-picker-presets-value");
  const node = document.getElementById("time-range-picker-presets-shell").content.cloneNode(true);
  const picker = node.querySelector("xh-time-range-picker");
  // 浮层展开后 content 会被搬到落点，之后从元素往下查不到它；先把它记住
  const content = picker.querySelector('[data-xh-part="content"]');

  // 每列上一次画的是哪一串值，没变就不动它（正在用方向键走的那一列不该被换掉）
  const painted = new Map();

  function itemNode(value) {
    const cell = document.createElement("div");
    cell.dataset.xhPart = "item";
    cell.setAttribute("value", value);
    // 格子上的字由组件按 locale 填
    return cell;
  }

  // 两组各自该排哪几列、每列有哪些格由组件给；区间约束只切换格子的禁用态，不删节点
  function paint() {
    content.querySelectorAll('[data-xh-part="column-group"]').forEach((group, index) => {
      const columns = picker.columnGroups[index].columns;
      for (const column of group.querySelectorAll('[data-xh-part="column"]')) {
        const unit = column.getAttribute("unit");
        const options = columns.find((c) => c.unit === unit)?.options ?? [];
        const shape = options.join(",");
        if (painted.get(column) === shape) continue;
        painted.set(column, shape);
        column.replaceChildren(...options.map(itemNode));
      }
    });
  }

  function show([start, end]) {
    readout.textContent = start && end ? `${start} → ${end}` : "（未填齐）";
  }

  // 示例台不能 import 包，这里把 timeRangePickerPresetFromNow 做的事等价地写一遍
  function fromNow(minutes) {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const total = Math.min(d.getHours() * 60 + d.getMinutes() + minutes, 23 * 60 + 59);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}/${pad(Math.trunc(total / 60))}:${pad(total % 60)}`;
  }

  // 时刻算一次就固定下来，组件只认已经算好的字面值；值用 ISO 8601 的区间写法把两端拼在一起
  const presets = [
    { label: "接下来一小时", value: fromNow(60) },
    { label: "上午", value: "09:00/12:00" },
    { label: "下午", value: "13:30/18:00" },
    { label: "全天", value: "09:00/18:00" },
  ];
  picker.presets = presets;
  // 条目由作者铺：value 属性对上数据，文字自己写
  const list = picker.querySelector('[data-xh-part="preset-group"]');
  for (const preset of presets) {
    const item = document.createElement("div");
    item.dataset.xhPart = "preset";
    item.setAttribute("value", preset.value);
    item.textContent = preset.label;
    list.append(item);
  }

  picker.addEventListener("value-change", async (event) => {
    picker.value = event.detail.value;
    show(event.detail.value);
    // 受控值要等元素这一轮更新把它送进机器，之后各格才会按新边界刷新禁用态
    await picker.updateComplete;
    paint();
  });
  // 挑一格、敲一个数字都可能让别的列刷新禁用态；浮层被搬走后事件不再经过元素，
  // 所以挂在 content 自己身上，等机器处理完这一下再重读一遍
  for (const type of ["click", "keydown"])
    content.addEventListener(type, () => queueMicrotask(paint));

  // 元素一连上就能读 columnGroups；接线排在微任务里，同步铺好的格子赶得上。
  // 数组只走 property；值由宿主持有，事件里写回才生效
  const initial = [];
  stage.append(node);
  picker.value = initial;
  paint();
  show(initial);
</script>
```

### 逐格判定

isTimeUnavailable 收到值、列与端，起点只能整点开始、终点只能半点结束

```vue
<script setup lang="ts">
import type { TimePickerColumnUnit, TimeRangePickerEndIndex } from "@xihan-ui/headless";
import {
  XhTimeRangePickerClearTrigger,
  XhTimeRangePickerColumn,
  XhTimeRangePickerColumnGroup,
  XhTimeRangePickerColumnGroupLabel,
  XhTimeRangePickerContent,
  XhTimeRangePickerControl,
  XhTimeRangePickerItem,
  XhTimeRangePickerLabel,
  XhTimeRangePickerPositioner,
  XhTimeRangePickerRangeSeparator,
  XhTimeRangePickerRoot,
  XhTimeRangePickerSegment,
  XhTimeRangePickerSegmentGroup,
  XhTimeRangePickerTrigger,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const value = ref<string[]>([]);
const text = computed(() => (value.value[0] && value.value[1] ? `${value.value[0]} → ${value.value[1]}` : "（未填齐）"));

// 判定与 min/max 的界外值同等对待：判真的格子仍可聚焦，只是选不中
function isTimeUnavailable(option: string, unit: TimePickerColumnUnit, index: TimeRangePickerEndIndex): boolean {
  if (unit !== "minute")
    return false;
  return index === 0 ? option !== "00" : option !== "30";
}
</script>

<template>
  <XhTimeRangePickerRoot v-model:value="value" :is-time-unavailable="isTimeUnavailable" :step="15">
    <XhTimeRangePickerLabel>课时</XhTimeRangePickerLabel>
    <XhTimeRangePickerControl>
      <!-- 端号定这组段位认领哪一端：0 起点、1 终点 -->
      <XhTimeRangePickerSegmentGroup :index="0">
        <XhTimeRangePickerSegment segment="hour" />
        <span>:</span>
        <XhTimeRangePickerSegment segment="minute" />
      </XhTimeRangePickerSegmentGroup>
      <XhTimeRangePickerRangeSeparator />
      <XhTimeRangePickerSegmentGroup :index="1">
        <XhTimeRangePickerSegment segment="hour" />
        <span>:</span>
        <XhTimeRangePickerSegment segment="minute" />
      </XhTimeRangePickerSegmentGroup>
      <XhTimeRangePickerClearTrigger />
      <XhTimeRangePickerTrigger />
    </XhTimeRangePickerControl>
    <XhTimeRangePickerPositioner>
      <XhTimeRangePickerContent>
        <!-- 起止各一组时列，端号写在外壳上，组内的列与格子跟着它走 -->
        <XhTimeRangePickerColumnGroup v-for="(label, end) in ['开始', '结束']" :key="end" :index="end">
          <XhTimeRangePickerColumnGroupLabel>{{ label }}</XhTimeRangePickerColumnGroupLabel>
          <XhTimeRangePickerColumn v-slot="{ options }" unit="hour">
            <XhTimeRangePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimeRangePickerColumn>
          <XhTimeRangePickerColumn v-slot="{ options }" unit="minute">
            <XhTimeRangePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimeRangePickerColumn>
        </XhTimeRangePickerColumnGroup>
      </XhTimeRangePickerContent>
    </XhTimeRangePickerPositioner>
  </XhTimeRangePickerRoot>

  <span aria-live="polite" style="font-size: 13px">
    当前值：{{ text }}
  </span>
</template>
```

```html
<div id="time-range-picker-predicate"></div>
<span aria-live="polite" style="font-size: 13px">
  当前值：<span id="time-range-picker-predicate-value">（未填齐）</span>
</span>

<!-- 结构先收在模板里：两组列里的格子要在元素接线前就位，所以铺满了才入页 -->
<template id="time-range-picker-predicate-shell">
  <xh-time-range-picker step="15">
    <div data-xh-part="root">
      <label data-xh-part="label">课时</label>
      <div data-xh-part="control">
        <!-- 文档序在前的这组认领起点，在后的认领终点；也可以像这里一样显式写 index -->
        <div data-xh-part="segment-group" index="0">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
        <span data-xh-part="range-separator">-</span>
        <div data-xh-part="segment-group" index="1">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
        <button data-xh-part="clear-trigger"></button>
        <button data-xh-part="trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <!-- 起止各一组时列：列里的格子由脚本按 columnGroups 铺 -->
          <div data-xh-part="column-group" index="0">
            <div data-xh-part="column-group-label">开始</div>
            <div data-xh-part="column" unit="hour"></div>
            <div data-xh-part="column" unit="minute"></div>
          </div>
          <div data-xh-part="column-group" index="1">
            <div data-xh-part="column-group-label">结束</div>
            <div data-xh-part="column" unit="hour"></div>
            <div data-xh-part="column" unit="minute"></div>
          </div>
        </div>
      </div>
    </div>
  </xh-time-range-picker>
</template>

<script type="module">
  const stage = document.getElementById("time-range-picker-predicate");
  const readout = document.getElementById("time-range-picker-predicate-value");
  const node = document.getElementById("time-range-picker-predicate-shell").content.cloneNode(true);
  const picker = node.querySelector("xh-time-range-picker");
  // 浮层展开后 content 会被搬到落点，之后从元素往下查不到它；先把它记住
  const content = picker.querySelector('[data-xh-part="content"]');

  // 每列上一次画的是哪一串值，没变就不动它（正在用方向键走的那一列不该被换掉）
  const painted = new Map();

  function itemNode(value) {
    const cell = document.createElement("div");
    cell.dataset.xhPart = "item";
    cell.setAttribute("value", value);
    // 格子上的字由组件按 locale 填
    return cell;
  }

  // 两组各自该排哪几列、每列有哪些格由组件给；区间约束只切换格子的禁用态，不删节点
  function paint() {
    content.querySelectorAll('[data-xh-part="column-group"]').forEach((group, index) => {
      const columns = picker.columnGroups[index].columns;
      for (const column of group.querySelectorAll('[data-xh-part="column"]')) {
        const unit = column.getAttribute("unit");
        const options = columns.find((c) => c.unit === unit)?.options ?? [];
        const shape = options.join(",");
        if (painted.get(column) === shape) continue;
        painted.set(column, shape);
        column.replaceChildren(...options.map(itemNode));
      }
    });
  }

  function show([start, end]) {
    readout.textContent = start && end ? `${start} → ${end}` : "（未填齐）";
  }

  // 判定函数只走 property；判真的格子仍可聚焦，只是选不中
  picker.isTimeUnavailable = (option, unit, index) => {
    if (unit !== "minute")
      return false;
    return index === 0 ? option !== "00" : option !== "30";
  };

  picker.addEventListener("value-change", async (event) => {
    picker.value = event.detail.value;
    show(event.detail.value);
    // 受控值要等元素这一轮更新把它送进机器，之后各格才会按新边界刷新禁用态
    await picker.updateComplete;
    paint();
  });
  // 挑一格、敲一个数字都可能让别的列刷新禁用态；浮层被搬走后事件不再经过元素，
  // 所以挂在 content 自己身上，等机器处理完这一下再重读一遍
  for (const type of ["click", "keydown"])
    content.addEventListener(type, () => queueMicrotask(paint));

  // 元素一连上就能读 columnGroups；接线排在微任务里，同步铺好的格子赶得上。
  // 数组只走 property；值由宿主持有，事件里写回才生效
  const initial = [];
  stage.append(node);
  picker.value = initial;
  paint();
  show(initial);
</script>
```

### 十二小时制

hourCycle 决定两组段位与时列的写法，上下午各成一段一列

```vue
<script setup lang="ts">
import {
  XhTimeRangePickerClearTrigger,
  XhTimeRangePickerColumn,
  XhTimeRangePickerColumnGroup,
  XhTimeRangePickerColumnGroupLabel,
  XhTimeRangePickerContent,
  XhTimeRangePickerControl,
  XhTimeRangePickerItem,
  XhTimeRangePickerLabel,
  XhTimeRangePickerPositioner,
  XhTimeRangePickerRangeSeparator,
  XhTimeRangePickerRoot,
  XhTimeRangePickerSegment,
  XhTimeRangePickerSegmentGroup,
  XhTimeRangePickerTrigger,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const value = ref<string[]>(["09:00", "17:30"]);
const text = computed(() => (value.value[0] && value.value[1] ? `${value.value[0]} → ${value.value[1]}` : "（未填齐）"));
</script>

<template>
  <XhTimeRangePickerRoot v-model:value="value" :hour-cycle="12" locale="zh-CN" :step="30">
    <XhTimeRangePickerLabel>值班时段</XhTimeRangePickerLabel>
    <XhTimeRangePickerControl>
      <XhTimeRangePickerSegmentGroup v-for="end in [0, 1]" :key="end" :index="end">
        <XhTimeRangePickerSegment segment="hour" />
        <span>:</span>
        <XhTimeRangePickerSegment segment="minute" />
        <XhTimeRangePickerSegment segment="dayPeriod" />
        <XhTimeRangePickerRangeSeparator v-if="end === 0" />
      </XhTimeRangePickerSegmentGroup>
      <XhTimeRangePickerClearTrigger />
      <XhTimeRangePickerTrigger />
    </XhTimeRangePickerControl>
    <XhTimeRangePickerPositioner>
      <XhTimeRangePickerContent>
        <!-- 起止各一组时列，端号写在外壳上，组内的列与格子跟着它走 -->
        <XhTimeRangePickerColumnGroup v-for="(label, end) in ['开始', '结束']" :key="end" :index="end">
          <XhTimeRangePickerColumnGroupLabel>{{ label }}</XhTimeRangePickerColumnGroupLabel>
          <XhTimeRangePickerColumn v-slot="{ options }" unit="hour">
            <XhTimeRangePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimeRangePickerColumn>
          <XhTimeRangePickerColumn v-slot="{ options }" unit="minute">
            <XhTimeRangePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimeRangePickerColumn>
          <XhTimeRangePickerColumn v-slot="{ options }" unit="dayPeriod">
            <XhTimeRangePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimeRangePickerColumn>
        </XhTimeRangePickerColumnGroup>
      </XhTimeRangePickerContent>
    </XhTimeRangePickerPositioner>
  </XhTimeRangePickerRoot>

  <span aria-live="polite" style="font-size: 13px">
    当前值：{{ text }}
  </span>
</template>
```

```html
<div id="time-range-picker-hour-cycle"></div>
<span aria-live="polite" style="font-size: 13px">
  当前值：<span id="time-range-picker-hour-cycle-value">（未填齐）</span>
</span>

<!-- 结构先收在模板里：两组列里的格子要在元素接线前就位，所以铺满了才入页 -->
<template id="time-range-picker-hour-cycle-shell">
  <xh-time-range-picker hour-cycle="12" locale="zh-CN" step="30">
    <div data-xh-part="root">
      <label data-xh-part="label">值班时段</label>
      <div data-xh-part="control">
        <!-- 文档序在前的这组认领起点，在后的认领终点；也可以像这里一样显式写 index -->
        <div data-xh-part="segment-group" index="0">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
          <span data-xh-part="segment" segment="dayPeriod"></span>
        </div>
        <span data-xh-part="range-separator">-</span>
        <div data-xh-part="segment-group" index="1">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
          <span data-xh-part="segment" segment="dayPeriod"></span>
        </div>
        <button data-xh-part="clear-trigger"></button>
        <button data-xh-part="trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <!-- 起止各一组时列：列里的格子由脚本按 columnGroups 铺 -->
          <div data-xh-part="column-group" index="0">
            <div data-xh-part="column-group-label">开始</div>
            <div data-xh-part="column" unit="hour"></div>
            <div data-xh-part="column" unit="minute"></div>
            <div data-xh-part="column" unit="dayPeriod"></div>
          </div>
          <div data-xh-part="column-group" index="1">
            <div data-xh-part="column-group-label">结束</div>
            <div data-xh-part="column" unit="hour"></div>
            <div data-xh-part="column" unit="minute"></div>
            <div data-xh-part="column" unit="dayPeriod"></div>
          </div>
        </div>
      </div>
    </div>
  </xh-time-range-picker>
</template>

<script type="module">
  const stage = document.getElementById("time-range-picker-hour-cycle");
  const readout = document.getElementById("time-range-picker-hour-cycle-value");
  const node = document.getElementById("time-range-picker-hour-cycle-shell").content.cloneNode(true);
  const picker = node.querySelector("xh-time-range-picker");
  // 浮层展开后 content 会被搬到落点，之后从元素往下查不到它；先把它记住
  const content = picker.querySelector('[data-xh-part="content"]');

  // 每列上一次画的是哪一串值，没变就不动它（正在用方向键走的那一列不该被换掉）
  const painted = new Map();

  function itemNode(value) {
    const cell = document.createElement("div");
    cell.dataset.xhPart = "item";
    cell.setAttribute("value", value);
    // 格子上的字由组件按 locale 填
    return cell;
  }

  // 两组各自该排哪几列、每列有哪些格由组件给；区间约束只切换格子的禁用态，不删节点
  function paint() {
    content.querySelectorAll('[data-xh-part="column-group"]').forEach((group, index) => {
      const columns = picker.columnGroups[index].columns;
      for (const column of group.querySelectorAll('[data-xh-part="column"]')) {
        const unit = column.getAttribute("unit");
        const options = columns.find((c) => c.unit === unit)?.options ?? [];
        const shape = options.join(",");
        if (painted.get(column) === shape) continue;
        painted.set(column, shape);
        column.replaceChildren(...options.map(itemNode));
      }
    });
  }

  function show([start, end]) {
    readout.textContent = start && end ? `${start} → ${end}` : "（未填齐）";
  }

  picker.addEventListener("value-change", async (event) => {
    picker.value = event.detail.value;
    show(event.detail.value);
    // 受控值要等元素这一轮更新把它送进机器，之后各格才会按新边界刷新禁用态
    await picker.updateComplete;
    paint();
  });
  // 挑一格、敲一个数字都可能让别的列刷新禁用态；浮层被搬走后事件不再经过元素，
  // 所以挂在 content 自己身上，等机器处理完这一下再重读一遍
  for (const type of ["click", "keydown"])
    content.addEventListener(type, () => queueMicrotask(paint));

  // 元素一连上就能读 columnGroups；接线排在微任务里，同步铺好的格子赶得上。
  // 数组只走 property；值由宿主持有，事件里写回才生效
  const initial = ["09:00", "17:30"];
  stage.append(node);
  picker.value = initial;
  paint();
  show(initial);
</script>
```

## 设计指引

### 何时使用

- 用户需要选择一段起止时间：营业时段、预约时段、会议起止。
- 可选时间是离散的（每 15 分钟一档），或需要限制可选时段。

### 何时不用

- 只选一个时刻时，使用[时间选择器](./time-picker)。
- 任意时间都可以、用户直接键入时，使用两个[时间字段](./time-field)。
- 起止跨天、需要连同日期一起选择时，使用[日期范围选择器](./date-range-picker)。

### 特性

- 值始终为区间两端 `[start, end]`，按位存放：只填了终点时是 `['', 终点]`，受控回写按同一下标对应。
- 起止各一组段位，`range-separator` 隔在中间；方向键换段不跨组，`name` 与 `endName` 各自决定两份隐藏输入是否参与提交。
- 浮层内起止两组时间列并排，左右键跨组换列；选中一格只改对应端的段，浮层不收起。
- 终点组以起点为下界、起点组以终点为上界：另一端填满后，界外的格留在原位并标为禁用，列高、滚动位置与焦点节点不跳。
- `step` 分列设定各列的步长；`min` / `max` 与 `isTimeUnavailable` 只改变格子的可选性，第三个参数是哪一端。
- `presets` 提供“上午”“全天”等整段快捷项，值使用 ISO 8601 的区间写法拼接两端，点击后两端整份写入值并收起。
- 终点早于起点、任一端越界时整个字段标为不合法，也可以用 `invalid` 显式声明。
- 触发器打开空值时焦点直接落到起点组的第一项；从输入段打开时继续保留键入焦点，展开后落到正在编辑一端的时间列。

### 组合

- 输入行内嵌两组与[时间字段](./time-field)同构的段位，逐段键入与加减由它负责。
- 与[日期范围选择器](./date-range-picker)配合组成日期时间区间。

### 最佳实践

- 使用明确的字段标签，两组段位各自报告“开始时间”“结束时间”。
- 起止段组之间必须渲染 `range-separator`，不依赖空白区分两端。
- 浮层内两组时间列各带一个小标题（`column-group-label`），便于分辨起点与终点。
- 常用时段优先提供快捷项，时刻在 computed / memo 中计算后再传入。

### 反模式

- 用两个时间选择器拼接一个区间：两端之间没有互相裁剪，也不校验先后顺序。
- 步长设为 1 分钟：一列六十格，两组一百二十格，滚动过长。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-time-range-picker>` |
| Vue 组件 | `XhTimeRangePickerClearTrigger` `XhTimeRangePickerColumn` `XhTimeRangePickerColumnGroup` `XhTimeRangePickerColumnGroupLabel` `XhTimeRangePickerContent` `XhTimeRangePickerControl` `XhTimeRangePickerHiddenInput` `XhTimeRangePickerItem` `XhTimeRangePickerLabel` `XhTimeRangePickerPositioner` `XhTimeRangePickerPreset` `XhTimeRangePickerPresetGroup` `XhTimeRangePickerRangeSeparator` `XhTimeRangePickerRoot` `XhTimeRangePickerSegment` `XhTimeRangePickerSegmentGroup` `XhTimeRangePickerTrigger` |
| 组合式函数 | `useTimeRangePicker` |
| 状态机 | `timeRangePickerMachine` |
| 皮肤 | `@xihan-ui/styles/time-range-picker.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string[]` |  | 受控的区间两端 `[start, end]`；空缺的一端用空串占位。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 |
| `defaultValue` | `string[]` |  |  |
| `open` | `boolean` |  | 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `min` | `string` |  | 下界（含）。把浮层中落在界外的选项标为禁用，并把已填的越界值标注出来（不改写它）。终点组还以起点为下界。 |
| `max` | `string` |  | 上界（含）。同上。起点组还以终点为上界。 |
| `locale` | `string` |  | BCP 47 语言标记。决定上午 / 下午的文字，以及未显式提供 hourCycle 时的小时制。 |
| `hourCycle` | `TimeHourCycle` |  | 小时制。未提供时按 locale 推断，locale 也没有时使用 24。 |
| `granularity` | `TimeGranularity` |  | 值精确到哪一段，默认 minute。它同时决定两组分段输入各显示几段、浮层中各排几列。 |
| `step` | `number` |  | 分列的步进（分钟），默认 1。只影响浮层中的可选值，不限制手动输入的分钟数。 |
| `presets` | `TimeRangePickerPreset[]` |  | 快捷选项（「上午」「全天」等）。提供后浮层中多出一列，点击即两端整份写入值并收起。 时刻需计算后传入：连接层每帧求值，把当前时刻放进渲染期会每帧得出一个新结果。 无法解析、不是恰好两端、任一端落在 min / max 之外或终点早于起点的选项自动不可按下。 |
| `disabled` | `boolean` |  | 禁用：两组分段输入整组退出 Tab 序列、触发器使用原生 disabled，隐藏输入不参与提交。 |
| `readOnly` | `boolean` |  | 只读：浮层照常展开、列表照常浏览，但值不可修改也不可清空。 |
| `invalid` | `boolean` |  | 校验失败标注。未提供时也会自行判定：任一端越界，或终点早于起点。 |
| `required` | `boolean` |  | 必填标注（写入每段的 aria-required）。 |
| `name` | `string` |  | 起点隐藏输入的表单字段名；提供后才带 name。 |
| `endName` | `string` |  | 终点隐藏输入的表单字段名；未提供时终点不参与提交。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入行的描边与底色使用方式。默认 outline。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，输入行与浮层中的格子一并换档。 |
| `placement` | `Placement` |  |  |
| `dir` | `Direction` |  | 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `isTimeUnavailable` | `(value: string, unit: TimePickerColumnUnit, index: TimeRangePickerEndIndex) => boolean` |  | 逐值可选性。接收两位补零的值、所属的列与端：同一个 '30' 在分钟列与秒列含义不同， 起点与终点也可以各有规则。与 min / max 的界外值同等处理：判定为真的格子仍可聚焦，只是不可选中。 |
| `translations` | `Partial<TimeRangePickerTranslations>` |  | 段位与两端读屏名的覆盖；未提供时使用内置英文语义名。 |
| `onValueChange` | `(details: TimeRangePickerValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |
| `onOpenChange` | `(details: TimeRangePickerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

### TimeRangePickerPreset

`presets` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 |  |
| `label` | `string` | 是 | 显示文案，同时是该项的可及名。 |
| `disabled` | `boolean` |  | 禁用该项：方向键仍可停留，但按下不写值。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TimeRangePickerValueChangeDetails` | 两端变化；detail 为 `{ value: string[] }`，只填终点时为 `['', end]` |
| `open-change` | `TimeRangePickerOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTimeRangePickerColumn` | `default` | `TimeRangePickerColumnSlotProps` |  |
| `XhTimeRangePickerColumnGroup` | `default` | `TimeRangePickerColumnGroupSlotProps` |  |
| `XhTimeRangePickerPreset` | `default` | — | 条目内容；未写时使用数据中的 label。 |
| `XhTimeRangePickerPresetGroup` | `default` | `TimeRangePickerPresetsSlotProps` | 自行铺设条目；未写时按 presets 数据自动铺设，两者产出的 DOM 一致。 |
| `XhTimeRangePickerRoot` | `default` | `TimeRangePickerRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhTimeRangePickerColumn` | `unit` | `TimePickerColumnUnit` | 是 |  |
| `XhTimeRangePickerColumn` | `children` | `SlotChildren<TimeRangePickerColumnSlotProps>` |  |  |
| `XhTimeRangePickerColumnGroup` | `index` | `number \| string` |  | 端号：0 起点、1 终点，兼收字符串。 |
| `XhTimeRangePickerColumnGroup` | `children` | `SlotChildren<TimeRangePickerColumnGroupSlotProps>` |  |  |
| `XhTimeRangePickerHiddenInput` | `index` | `number \| string` |  | 写在段位容器外面时用它指明属于哪一端；写在容器内时不必提供，跟随容器。 |
| `XhTimeRangePickerItem` | `value` | `string` | 是 | 两位补零的显示串（'09' / '30'）；上下午列写 '00' / '01'。 |
| `XhTimeRangePickerPositioner` | `container` | `() => Element \| null` |  | 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 |
| `XhTimeRangePickerPreset` | `value` | `string` | 是 | 该条目的身份，与 presets 数据中的 value 逐字对应。 |
| `XhTimeRangePickerPresetGroup` | `children` | `SlotChildren<TimeRangePickerPresetsSlotProps>` |  | 自行铺设条目；未写时按 presets 数据自动铺设，两者产出的 DOM 一致。 |
| `XhTimeRangePickerRoot` | `children` | `SlotChildren<TimeRangePickerRootSlotProps>` |  |  |
| `XhTimeRangePickerSegment` | `segment` | `TimeSegmentType` | 是 | 段的身份由作者声明；属于哪一端跟随所在的段位容器。 |
| `XhTimeRangePickerSegmentGroup` | `index` | `number \| string` |  | 端号：0 起点、1 终点，兼收字符串。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `preset` | 'checked' \| 'unchecked' |
| `column-group` | 'open' \| 'closed' |
| `column` | 'open' \| 'closed' |
| `item` | 'checked' \| 'unchecked' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `VALUE.CLEAR` · `SEGMENT.STEP` · `SEGMENT.DIGIT` · `SEGMENT.CLEAR` · `SEGMENT.PERIOD` · `SEGMENT.FOCUS` · `SEGMENT.BLUR` · `OPTION.FOCUS` · `ITEM.SELECT` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`isOpenControlled` · `canEdit` · `closesOnPreset` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `value` | `string[]` | 区间两端，按位存放；空缺的一端为空串，尾部的空缺裁掉。 |
| `start` | `string \| null` | 起点的 ISO 时间串；尚未填全时为 null。 |
| `end` | `string \| null` | 终点的 ISO 时间串；尚未填全时为 null。 |
| `empty` | `boolean` | 两端都尚未填全。 |
| `outOfRange` | `boolean` | 任一端已填全但落在 min / max 之外。只是标注，不改写值。 |
| `reversed` | `boolean` | 两端都已填全但终点早于起点。只是标注，不改写值。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` | 与根节点的 data-invalid 同一口径：作者标记的、越界的、终点早于起点的都计入。 |
| `hourCycle` | `TimeHourCycle` | 实际生效的小时制（prop 未提供时由 locale 推断的值）。 |
| `granularity` | `TimeGranularity` |  |
| `step` | `number` | 实际生效的分列步进。 |
| `segments` | `TimeSegmentType[]` | 两组段位各自当前参与显示的段，文档序；两组相同。未列入的段由 connect 写上 hidden 收起。 |
| `focusedSegment` | `TimeRangePickerSegmentRef \| null` | 焦点所在的段；焦点在分段输入外时为 null。 |
| `columnGroups` | `readonly [TimeRangePickerColumnGroup, TimeRangePickerColumnGroup]` | 起止两组时列：每组应排列的稳定列及完整选项（已按 step 取样）。界外项由 isItemDisabled 标记，作者据此渲染浮层。 |
| `focusedColumn` | `TimeRangePickerColumnRef \| null` |  |
| `focusedItem` | `string \| null` |  |
| `presets` | `readonly TimeRangePickerPresetState[]` | 快捷选项逐条的状态，数据顺序。未提供 presets 时为空数组。 |
| `canClear` | `boolean` | 清空按钮当前是否可按。 |
| `getSegmentText` | `(props: TimeRangePickerSegmentProps) => string` | 某一端某一段应显示的文字（空段是占位串）。各适配器都用它填充文本，保证同构。 |
| `getItemText` | `(props: TimeRangePickerItemTextProps) => string` | 某一格应显示的文字。数字列即格子自身的值，上下午列按 locale 给出「上午 / 下午」。 各适配器都用它填充文本，保证同构。 |
| `isItemSelected` | `(props: TimeRangePickerItemProps) => boolean` |  |
| `isItemDisabled` | `(props: TimeRangePickerItemProps) => boolean` | 落在 min / max 之外、被另一端限制（或整个控件禁用）：仍在列表中，但不可选、方向键跳过。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[]) => void` | 整份写入两端。 |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getSegmentGroupProps` | `(props: TimeRangePickerEndProps) => T['element']` | 一端的段位容器：起止各一个，data-index 区分，各报「开始时间」「结束时间」。 |
| `getSegmentProps` | `(props: TimeRangePickerSegmentProps) => T['element']` | 分段输入：一段一个节点，与 TimeField 的段同构（role=spinbutton + roving tabindex）。 |
| `getRangeSeparatorProps` | `() => T['element']` | 起止两组段位之间的视觉分隔，退出可访问树。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getPresetGroupProps` | `() => T['element']` | 快捷选项列（role=listbox）；未提供 presets 时带 hidden。 |
| `getPresetProps` | `(props: TimeRangePickerPresetProps) => T['element']` | 一条快捷选项（role=option）：点击把两端整份写入值并收起浮层。 |
| `getColumnGroupProps` | `(props: TimeRangePickerEndProps) => T['element']` | 一端的时列外壳：起止各一个并排，data-index 区分，各报「开始时间」「结束时间」。 |
| `getColumnGroupLabelProps` | `(props: TimeRangePickerEndProps) => T['element']` | 时列外壳顶部的小标题（「开始」「结束」），纯视觉，退出可访问树。 |
| `getColumnProps` | `(props: TimeRangePickerColumnProps) => T['element']` |  |
| `getItemProps` | `(props: TimeRangePickerItemProps) => T['element']` |  |
| `getHiddenInputProps` | `(props: TimeRangePickerEndProps) => T['input']` | 表单出口：起止各一份 type=hidden 的原生输入，随表单提交各自的 ISO 串。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowDown` / `ArrowUp` | focus in trigger, closed, not disabled | 展开浮层，焦点落到起点那组的时列（已选的时仍可选就停在它上面，否则停在首格） |
| `Enter` / `Space` | focus in trigger, not disabled | 按钮的默认激活即展开/收起（不额外拦键，否则会一开一关） |
| `ArrowDown` | open, focus in 某一列 | 列内下移一格，到尾回绕；被 min/max 或另一端禁用的格自动跳过 |
| `ArrowUp` | open, focus in 某一列 | 列内上移一格，到头回绕；被 min/max 或另一端禁用的格自动跳过 |
| `Home` | open, focus in 某一列 | 焦点移到本列首格 |
| `End` | open, focus in 某一列 | 焦点移到本列末格 |
| `ArrowRight` | open | 换到下一列并落在该列的锚点上；起点那组的末列再往右进终点那组，已在最后一列则不动，不回绕 |
| `ArrowLeft` | open | 换到上一列并落在该列的锚点上；终点那组的首列再往左回起点那组，已在第一列则不动，不回绕 |
| `Enter` / `Space` | open, 焦点停在可选的格上, not disabled/readOnly | 把这一格写进对应那一端的段；浮层不收起（其余列与另一端还要接着挑） |
| `ArrowUp` / `ArrowDown` / `Home` / `End` | open, focus in 快捷选项列 | 在快捷选项之间移动焦点，到头回绕；时分秒那几列的处理器在这一列内不参与 |
| `Enter` / `Space` | open, focus in 某条快捷选项, not disabled/readOnly | 把这条快捷选项的两端整份写进值并收起浮层 |
| `Escape` | open | 收起浮层并把焦点归还触发器，两端不变 |
| `Tab` / `Shift+Tab` | open | 收起浮层且不拦按键，焦点按 Tab 序列自然离开，不抢回触发器 |
| `ArrowUp` | focus in 某一段, not disabled/readOnly | 本段加一格，到头回绕；空段落到该段下界 |
| `ArrowDown` | focus in 某一段, not disabled/readOnly | 本段减一格，到头回绕；空段落到该段上界 |
| `ArrowRight` | focus in 某一段, not disabled | 焦点移到本组下一段；已在本组末段则不动，不跨进另一端那组 |
| `ArrowLeft` | focus in 某一段, not disabled | 焦点移到本组上一段；已在本组首段则不动，不跨回另一端那组 |
| `Home` | focus in 某一段, not disabled | 焦点移到本组首段 |
| `End` | focus in 某一段, not disabled | 焦点移到本组末段 |
| `0-9` | focus in 数字段, not disabled/readOnly | 把数字并进本段；本段再吃不下第二位时自动跳到本组下一段 |
| `Backspace` / `Delete` | focus in 某一段, not disabled/readOnly | 清掉本段；小时被清时上下午段仍保留原来的上午/下午 |
| `a` / `p` | focus in 上下午段, 12 小时制, not disabled/readOnly | a 取上午、p 取下午（不区分大小写） |
| `Alt+ArrowDown` | focus in 某一段, closed, not disabled | 展开浮层并把焦点移入正在编辑一端的时列；触发按钮是可选部件，键盘入口不能只挂在它上面 |
| `Enter` | focus in 某一段, open | 收起浮层。段位里敲出来的值不触发「选完即收」（那时人还在打字），这是那条路的收口手势 |
| `Enter` / `Space` | held on trigger（not disabled）、clear-trigger（可清）、preset 或 item（open, not disabled/readOnly, 该条可按） | 按住期间该部件投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，浮层收起时一并撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `control` | `aria-disabled` | 'true' \| 'false' |
| `control` | `aria-invalid` | 'true' \| 'false' |
| `control` | `aria-labelledby` | `label` 部件的 id |
| `control` | `role` | 'group' |
| `segment-group` | `aria-disabled` | 'true' \| 'false' |
| `segment-group` | `aria-label` | endLabel(index, translations) |
| `segment-group` | `role` | 'group' |
| `segment` | `aria-disabled` | 'true' \| 'false' |
| `segment` | `aria-invalid` | 'true' \| 'false' |
| `segment` | `aria-label` | translations?.[segment] |
| `segment` | `aria-readonly` | 'true' \| 'false' |
| `segment` | `aria-required` | 'true' \| 'false' |
| `segment` | `aria-valuemax` | range.max |
| `segment` | `aria-valuemin` | range.min |
| `segment` | `aria-valuenow` | segmentNumber(drafts[index], segment, hourCycle) |
| `segment` | `aria-valuetext` | timeSegmentText(drafts[index], segment, { hourCycle, … |
| `segment` | `role` | 'spinbutton' |
| `range-separator` | `aria-hidden` | 'true' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `trigger` | `aria-labelledby` | `label` 部件的 id |
| `clear-trigger` | `aria-label` | translations?.clearTrigger |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-labelledby` | `label` 部件的 id |
| `content` | `aria-modal` | 'false' |
| `content` | `role` | 'dialog' |
| `preset-group` | `aria-disabled` | 'true' \| 'false' |
| `preset-group` | `aria-label` | translations?.presets |
| `preset-group` | `aria-multiselectable` | 'false' |
| `preset-group` | `aria-orientation` | 'vertical' |
| `preset-group` | `role` | 'listbox' |
| `preset` | `aria-disabled` | 'true' \| 'false' |
| `preset` | `aria-selected` | 'true' \| 'false' |
| `preset` | `role` | 'option' |
| `column-group` | `aria-label` | endLabel(index, translations) |
| `column-group` | `role` | 'group' |
| `column-group-label` | `aria-hidden` | 'true' |
| `column` | `aria-disabled` | 'true' \| 'false' |
| `column` | `aria-label` | translations?.[unit] |
| `column` | `aria-multiselectable` | 'false' |
| `column` | `aria-orientation` | 'vertical' |
| `column` | `role` | 'listbox' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |

## 样式参考

### 皮肤

`@xihan-ui/styles/time-range-picker.css` 使用 `[data-scope="time-range-picker"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

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
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-empty` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-state` | 'open' \| 'closed' |
| `control` | `data-variant` | props.variant |
| `control` | `data-xh-field-chrome` | '' |
| `control` | `data-xh-field-size` | props.size |
| `segment-group` | `data-complete` | ''（条件成立时才出现） |
| `segment-group` | `data-disabled` | ''（条件成立时才出现） |
| `segment-group` | `data-empty` | ''（条件成立时才出现） |
| `segment-group` | `data-index` | String(index) |
| `segment-group` | `data-invalid` | ''（条件成立时才出现） |
| `segment-group` | `data-out-of-range` | ''（条件成立时才出现） |
| `segment-group` | `data-readonly` | ''（条件成立时才出现） |
| `segment` | `data-disabled` | ''（条件成立时才出现） |
| `segment` | `data-focus` | ''（条件成立时才出现） |
| `segment` | `data-invalid` | ''（条件成立时才出现） |
| `segment` | `data-placeholder` | ''（条件成立时才出现） |
| `segment` | `data-readonly` | ''（条件成立时才出现） |
| `range-separator` | `data-disabled` | ''（条件成立时才出现） |
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
| `preset` | `data-disabled` | ''（条件成立时才出现） |
| `preset` | `data-pressed` | ''（条件成立时才出现） |
| `preset` | `data-state` | 'checked' \| 'unchecked' |
| `preset` | `data-xh-collection-context` | 'overlay' |
| `preset` | `data-xh-collection-item` | '' |
| `preset` | `data-xh-collection-size` | props.size |
| `column-group` | `data-disabled` | ''（条件成立时才出现） |
| `column-group` | `data-focus` | ''（条件成立时才出现） |
| `column-group` | `data-index` | String(index) |
| `column-group` | `data-state` | 'open' \| 'closed' |
| `column-group-label` | `data-disabled` | ''（条件成立时才出现） |
| `column-group-label` | `data-index` | String(index) |
| `column` | `data-disabled` | ''（条件成立时才出现） |
| `column` | `data-state` | 'open' \| 'closed' |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `hidden-input` | `data-index` | String(index) |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-time-range-picker-action-bg` | `clear-trigger`<br>`trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | time-range-picker 的 clear-trigger、trigger 部件 background-color 覆盖槽。 |
| `--xh-time-range-picker-action-bg-active` | `clear-trigger`<br>`trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | time-range-picker 的 clear-trigger、trigger 部件 background-color 覆盖槽。 |
| `--xh-time-range-picker-action-bg-hover` | `clear-trigger`<br>`trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=open` | `--xh-_action-variant-bg-hover` | time-range-picker 的 clear-trigger、trigger 部件 background-color 覆盖槽。 |
| `--xh-time-range-picker-action-fg` | `clear-trigger`<br>`trigger` | `color` | `default` | `--xh-fg-muted` | time-range-picker 的 clear-trigger、trigger 部件 color 覆盖槽。 |
| `--xh-time-range-picker-action-fg-hover` | `clear-trigger`<br>`trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=open` | `--xh-fg-default` | time-range-picker 的 clear-trigger、trigger 部件 color 覆盖槽。 |
| `--xh-time-range-picker-action-font-size` | `clear-trigger`<br>`trigger` | `font-size` | `default` | `--xh-text-secondary-size` | time-range-picker 的 clear-trigger、trigger 部件 font-size 覆盖槽。 |
| `--xh-time-range-picker-action-radius` | `clear-trigger`<br>`trigger` | `border-radius` | `default` | `--xh-shape-inset` | time-range-picker 的 clear-trigger、trigger 部件 border-radius 覆盖槽。 |
| `--xh-time-range-picker-action-size` | `clear-trigger`<br>`trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` | time-range-picker 的 clear-trigger、trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-time-range-picker-column-divider` | `column`<br>`preset-group` | `border-inline-end`<br>`border-inline-start` | `default` | `--xh-material-frosted-separator` | time-range-picker 的 column、preset-group 部件 border-inline-end、border-inline-start 覆盖槽。 |
| `--xh-time-range-picker-column-gap` | `column` | `gap` | `default` | `0` | time-range-picker 的 column 部件 gap 覆盖槽。 |
| `--xh-time-range-picker-column-group-divider` | `column-group` | `border-inline-start` | `default` | `--xh-material-frosted-separator` | time-range-picker 的 column-group 部件 border-inline-start 覆盖槽。 |
| `--xh-time-range-picker-column-group-gap` | `column-group` | `margin-inline-start`<br>`padding-inline-start` | `default` | `--xh-space-2` | time-range-picker 的 column-group 部件 margin-inline-start、padding-inline-start 覆盖槽。 |
| `--xh-time-range-picker-column-group-label-fg` | `column-group-label` | `color` | `default` | `--xh-fg-subtle` | time-range-picker 的 column-group-label 部件 color 覆盖槽。 |
| `--xh-time-range-picker-column-group-label-px` | `column-group-label` | `padding-inline` | `default` | `--xh-space-1` | time-range-picker 的 column-group-label 部件 padding-inline 覆盖槽。 |
| `--xh-time-range-picker-column-group-label-py` | `column-group`<br>`column-group-label` | `block-size`<br>`padding-block`<br>`padding-block-start` | `default` | `--xh-space-1` | time-range-picker 的 column-group、column-group-label 部件 block-size、padding-block、padding-block-start 覆盖槽。 |
| `--xh-time-range-picker-column-group-py` | `column-group`<br>`column-group-label` | `block-size`<br>`padding-block-start` | `default` | `--xh-time-range-picker-column-group-label-py` | time-range-picker 的 column-group、column-group-label 部件 block-size、padding-block-start 覆盖槽。 |
| `--xh-time-range-picker-column-h` | `column` | `block-size` | `default` | `--xh-viewport-h-sm` | time-range-picker 的 column 部件 block-size 覆盖槽。 |
| `--xh-time-range-picker-column-min-w` | `column` | `min-inline-size` | `default` | `--xh-overlay-column-min-w` | time-range-picker 的 column 部件 min-inline-size 覆盖槽。 |
| `--xh-time-range-picker-column-px` | `column` | `padding-inline` | `default` | `0` | time-range-picker 的 column 部件 padding-inline 覆盖槽。 |
| `--xh-time-range-picker-content-bg` | `content` | `background` | `default` | `--xh-bg-surface` | time-range-picker 的 content 部件 background 覆盖槽。 |
| `--xh-time-range-picker-content-border` | `content` | `border` | `default` | `--xh-border-default` | time-range-picker 的 content 部件 border 覆盖槽。 |
| `--xh-time-range-picker-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | time-range-picker 的 content 部件 color 覆盖槽。 |
| `--xh-time-range-picker-content-max-h` | `content` | `max-block-size` | `default` | `--xh-viewport-h-lg` | time-range-picker 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-time-range-picker-content-px` | `content` | `padding-inline` | `default` | `--xh-space-2` | time-range-picker 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-time-range-picker-content-py` | `content` | `padding-block` | `default` | `--xh-space-2` | time-range-picker 的 content 部件 padding-block 覆盖槽。 |
| `--xh-time-range-picker-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | time-range-picker 的 content 部件 border-radius 覆盖槽。 |
| `--xh-time-range-picker-content-shadow` | `content` | `box-shadow` | `default` | `--xh-elevation-floating` | time-range-picker 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-time-range-picker-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` | time-range-picker 的 control 部件 background-color 覆盖槽。 |
| `--xh-time-range-picker-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` | time-range-picker 的 control 部件 background-color 覆盖槽。 |
| `--xh-time-range-picker-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` | time-range-picker 的 control 部件 background-color 覆盖槽。 |
| `--xh-time-range-picker-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` | time-range-picker 的 control 部件 background-color 覆盖槽。 |
| `--xh-time-range-picker-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` | time-range-picker 的 control 部件 border 覆盖槽。 |
| `--xh-time-range-picker-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` | time-range-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-time-range-picker-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` | time-range-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-time-range-picker-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` | time-range-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-time-range-picker-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` | time-range-picker 的 control 部件 color 覆盖槽。 |
| `--xh-time-range-picker-control-gap` | `control`<br>`range-separator` | `gap`<br>`margin-inline` | `default`<br>`xh-field-chrome` | `--xh-_time-range-picker-gap` | time-range-picker 的 control、range-separator 部件 gap、margin-inline 覆盖槽。 |
| `--xh-time-range-picker-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_time-range-picker-control-h` | time-range-picker 的 control 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-time-range-picker-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` | time-range-picker 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-time-range-picker-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_time-range-picker-control-px` | time-range-picker 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-time-range-picker-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` | time-range-picker 的 control 部件 border-radius 覆盖槽。 |
| `--xh-time-range-picker-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` | time-range-picker 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-time-range-picker-control-w` | `root` | `inline-size`<br>`min-inline-size` | `default` | `--xh-control-w` | time-range-picker 的 root 部件 inline-size、min-inline-size 覆盖槽。 |
| `--xh-time-range-picker-font-size` | `control` | `font-size` | `default` | `--xh-_time-range-picker-font-size` | time-range-picker 的 control 部件 font-size 覆盖槽。 |
| `--xh-time-range-picker-gap` | `root` | `gap` | `default` | `--xh-space-1` | time-range-picker 的 root 部件 gap 覆盖槽。 |
| `--xh-time-range-picker-icon-size` | `control`<br>`positioner`<br>`root` | `--xh-icon-size` | `default`<br>`is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | time-range-picker 的 control、positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-time-range-picker-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` | time-range-picker 的 item 部件 background-color 覆盖槽。 |
| `--xh-time-range-picker-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` | time-range-picker 的 item 部件 background-color 覆盖槽。 |
| `--xh-time-range-picker-item-check-fg` | `item` | `background-color` | `default` | `--xh-_time-range-picker-check-fg` | time-range-picker 的 item 部件 background-color 覆盖槽。 |
| `--xh-time-range-picker-item-check-size` | `item` | `block-size`<br>`inline-size`<br>`padding-inline` | `default` | `--xh-glyph-size-sm` | time-range-picker 的 item 部件 block-size、inline-size、padding-inline 覆盖槽。 |
| `--xh-time-range-picker-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-material-frosted-fg` | time-range-picker 的 item 部件 color 覆盖槽。 |
| `--xh-time-range-picker-item-fg-selected` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-time-range-picker-item-fg` | time-range-picker 的 item 部件 color 覆盖槽。 |
| `--xh-time-range-picker-item-font-size` | `item` | `font-size` | `default` | `--xh-_time-range-picker-font-size` | time-range-picker 的 item 部件 font-size 覆盖槽。 |
| `--xh-time-range-picker-item-font-weight-selected` | `item` | `font-weight` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-font-weight-regular` | time-range-picker 的 item 部件 font-weight 覆盖槽。 |
| `--xh-time-range-picker-item-h` | `item` | `block-size` | `default` | `--xh-overlay-column-item-h` | time-range-picker 的 item 部件 block-size 覆盖槽。 |
| `--xh-time-range-picker-item-px` | `item` | `padding-inline` | `default` | `--xh-space-0_5` | time-range-picker 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-time-range-picker-item-py` | `item` | `padding-block` | `default` | `0` | time-range-picker 的 item 部件 padding-block 覆盖槽。 |
| `--xh-time-range-picker-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | time-range-picker 的 item 部件 border-radius 覆盖槽。 |
| `--xh-time-range-picker-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | time-range-picker 的 label 部件 color 覆盖槽。 |
| `--xh-time-range-picker-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | time-range-picker 的 label 部件 color 覆盖槽。 |
| `--xh-time-range-picker-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | time-range-picker 的 label 部件 font-size 覆盖槽。 |
| `--xh-time-range-picker-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | time-range-picker 的 label 部件 font-weight 覆盖槽。 |
| `--xh-time-range-picker-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | time-range-picker 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-time-range-picker-literal-fg` | `segment-group` | `color` | `not([data-scope])` | `--xh-fg-subtle` | time-range-picker 的 segment-group 部件 color 覆盖槽。 |
| `--xh-time-range-picker-placeholder-fg` | `segment` | `color` | `placeholder` | `--xh-fg-subtle` | time-range-picker 的 segment 部件 color 覆盖槽。 |
| `--xh-time-range-picker-preset-bg-hover` | `preset` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` | time-range-picker 的 preset 部件 background-color 覆盖槽。 |
| `--xh-time-range-picker-preset-bg-pressed` | `preset` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` | time-range-picker 的 preset 部件 background-color 覆盖槽。 |
| `--xh-time-range-picker-preset-check-fg` | `preset` | `background-color` | `default` | `--xh-_time-range-picker-check-fg` | time-range-picker 的 preset 部件 background-color 覆盖槽。 |
| `--xh-time-range-picker-preset-check-size` | `preset` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default` | `--xh-glyph-size-sm` | time-range-picker 的 preset 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-time-range-picker-preset-fg` | `preset` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-fg-default` | time-range-picker 的 preset 部件 color 覆盖槽。 |
| `--xh-time-range-picker-preset-fg-checked` | `preset` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-time-range-picker-preset-fg` | time-range-picker 的 preset 部件 color 覆盖槽。 |
| `--xh-time-range-picker-preset-fg-disabled` | `preset` | `background-color`<br>`color` | `default`<br>`disabled` | `--xh-fg-disabled` | time-range-picker 的 preset 部件 background-color、color 覆盖槽。 |
| `--xh-time-range-picker-preset-group-gap` | `preset-group` | `gap` | `default` | `--xh-list-option-gap` | time-range-picker 的 preset-group 部件 gap 覆盖槽。 |
| `--xh-time-range-picker-preset-group-h` | `preset-group` | `max-block-size` | `default` | `--xh-viewport-h-sm` | time-range-picker 的 preset-group 部件 max-block-size 覆盖槽。 |
| `--xh-time-range-picker-preset-group-px` | `preset-group` | `padding-inline` | `default` | `--xh-space-1` | time-range-picker 的 preset-group 部件 padding-inline 覆盖槽。 |
| `--xh-time-range-picker-preset-px` | `preset` | `inset-inline-end`<br>`padding-inline`<br>`padding-inline-end` | `default` | `--xh-space-3` | time-range-picker 的 preset 部件 inset-inline-end、padding-inline、padding-inline-end 覆盖槽。 |
| `--xh-time-range-picker-preset-py` | `preset` | `padding-block` | `default` | `--xh-space-1` | time-range-picker 的 preset 部件 padding-block 覆盖槽。 |
| `--xh-time-range-picker-preset-radius` | `preset` | `border-radius` | `default` | `--xh-shape-control` | time-range-picker 的 preset 部件 border-radius 覆盖槽。 |
| `--xh-time-range-picker-range-separator-fg` | `range-separator` | `color` | `default` | `--xh-fg-subtle` | time-range-picker 的 range-separator 部件 color 覆盖槽。 |
| `--xh-time-range-picker-range-separator-mx` | `range-separator` | `margin-inline` | `default` | `--xh-_time-range-picker-range-separator-mx` | time-range-picker 的 range-separator 部件 margin-inline 覆盖槽。 |
| `--xh-time-range-picker-range-separator-px` | `range-separator` | `margin-inline`<br>`padding-inline` | `default` | `--xh-space-1` | time-range-picker 的 range-separator 部件 margin-inline、padding-inline 覆盖槽。 |
| `--xh-time-range-picker-segment-bg-focus` | `segment` | `background` | `disabled`<br>`focus`<br>`focus-visible`<br>`not([data-disabled])` | `--xh-_time-range-picker-segment-bg` | time-range-picker 的 segment 部件 background 覆盖槽。 |
| `--xh-time-range-picker-segment-bg-hover` | `segment` | `background` | `disabled`<br>`focus`<br>`hover`<br>`not([data-focus], [data-disabled])` | `--xh-bg-subtle` | time-range-picker 的 segment 部件 background 覆盖槽。 |
| `--xh-time-range-picker-segment-bg-invalid-focus` | `segment` | `background` | `focus`<br>`invalid`<br>`is([data-focus], :focus-visible)` | `--xh-bg-subtle` | time-range-picker 的 segment 部件 background 覆盖槽。 |
| `--xh-time-range-picker-segment-fg-focus` | `segment` | `color` | `disabled`<br>`focus`<br>`focus-visible`<br>`not([data-disabled])`<br>`placeholder` | `--xh-_time-range-picker-segment-fg` | time-range-picker 的 segment 部件 color 覆盖槽。 |
| `--xh-time-range-picker-segment-fg-invalid` | `segment` | `color` | `invalid` | `--xh-fg-danger` | time-range-picker 的 segment 部件 color 覆盖槽。 |
| `--xh-time-range-picker-segment-fg-invalid-focus` | `segment` | `color` | `focus`<br>`invalid`<br>`is([data-focus], :focus-visible)` | `--xh-fg-danger` | time-range-picker 的 segment 部件 color 覆盖槽。 |
| `--xh-time-range-picker-segment-px` | `segment` | `padding-inline` | `default` | `--xh-space-0_5` | time-range-picker 的 segment 部件 padding-inline 覆盖槽。 |
| `--xh-time-range-picker-segment-radius` | `segment` | `border-radius` | `default` | `--xh-shape-inset` | time-range-picker 的 segment 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

共享关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`background` · `color` · `opacity` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
