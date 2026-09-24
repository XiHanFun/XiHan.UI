来源：https://ui.docs.xihanfun.com/components/calendar-range-picker

# CalendarRangePicker 日历范围选择器

在日历网格中先选起点再选终点，选出一段连续的天、周、月、季度或年。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/calendar-range-picker" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/calendar-range-picker.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/calendar-range-picker" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/calendar-range-picker" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/calendar-range-picker.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

先落下起点再落下终点，也可以按住拖动经过；两端都落定才写值，Escape 撤销起点

```vue
<script setup lang="ts">
import {
  XhCalendarRangePickerCell,
  XhCalendarRangePickerCellTrigger,
  XhCalendarRangePickerGrid,
  XhCalendarRangePickerGridBody,
  XhCalendarRangePickerGridHead,
  XhCalendarRangePickerHeader,
  XhCalendarRangePickerHeading,
  XhCalendarRangePickerNextTrigger,
  XhCalendarRangePickerPrevTrigger,
  XhCalendarRangePickerRoot,
  XhCalendarRangePickerWeekDay,
  XhCalendarRangePickerWeekRow,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const value = ref<string[]>([]);

// 值只在两端都落定时更新；挑到一半的起点记在组件里
const text = computed(() => (value.value.length === 2 ? `${value.value[0]} → ${value.value[1]}` : "（未选）"));
</script>

<template>
  <XhCalendarRangePickerRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    locale="zh-CN"
    fixed-weeks
    style="max-inline-size: 280px"
  >
    <XhCalendarRangePickerHeader>
      <XhCalendarRangePickerPrevTrigger aria-label="上个月" />
      <XhCalendarRangePickerHeading />
      <XhCalendarRangePickerNextTrigger aria-label="下个月" />
    </XhCalendarRangePickerHeader>
    <XhCalendarRangePickerGrid>
      <XhCalendarRangePickerGridHead>
        <XhCalendarRangePickerWeekRow>
          <XhCalendarRangePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
        </XhCalendarRangePickerWeekRow>
      </XhCalendarRangePickerGridHead>
      <XhCalendarRangePickerGridBody>
        <XhCalendarRangePickerWeekRow v-for="week in weeks" :key="week[0].start">
          <XhCalendarRangePickerCell v-for="day in week" :key="day.start" :value="day.start">
            <XhCalendarRangePickerCellTrigger>{{ day.day }}</XhCalendarRangePickerCellTrigger>
          </XhCalendarRangePickerCell>
        </XhCalendarRangePickerWeekRow>
      </XhCalendarRangePickerGridBody>
    </XhCalendarRangePickerGrid>
  </XhCalendarRangePickerRoot>

  <span style="font-size: 13px">区间：{{ text }}</span>
</template>
```

```html
<div id="calendar-range-picker-basic-mount"></div>
<span style="font-size: 13px">区间：<span id="calendar-range-picker-basic-value">（未选）</span></span>

<!-- 结构先收在模板里：必需的格子要在元素接线前就位，所以网格填好了才入页 -->
<template id="calendar-range-picker-basic-template">
  <xh-calendar-range-picker locale="zh-CN" fixed-weeks>
    <div data-xh-part="root" style="max-inline-size: 280px">
      <div data-xh-part="header">
        <button data-xh-part="prev-trigger" aria-label="上个月"></button>
        <div data-xh-part="heading"></div>
        <button data-xh-part="next-trigger" aria-label="下个月"></button>
      </div>
      <div data-xh-part="grid">
        <div data-xh-part="grid-head">
          <div data-xh-part="week-row"></div>
        </div>
        <div data-xh-part="grid-body"></div>
      </div>
    </div>
  </xh-calendar-range-picker>
</template>

<script type="module">
  const fragment = document
    .getElementById("calendar-range-picker-basic-template")
    .content.cloneNode(true);
  const calendar = fragment.querySelector("xh-calendar-range-picker");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector('[data-xh-part="grid-head"] [data-xh-part="week-row"]');
  const body = fragment.querySelector('[data-xh-part="grid-body"]');
  const readout = document.getElementById("calendar-range-picker-basic-value");

  // 已经画出来的是哪个月
  let month = "";

  // 表头七列只跟 locale 走，画一次就够
  function paintHead() {
    head.replaceChildren(
      ...calendar.weekDays.map((day) => {
        const cell = document.createElement("span");
        cell.dataset.xhPart = "week-day";
        cell.setAttribute("value", day.value);
        cell.textContent = day.label;
        return cell;
      }),
    );
  }

  // 换了月才重画格子：同月内移动焦点时格子原样留着，区间底色由元素自己写
  function paintBody() {
    const first = calendar.weeks[0][0].start;
    if (first === month) {
      return;
    }
    month = first;
    heading.textContent = calendar.headingLabel;
    body.replaceChildren(
      ...calendar.weeks.map((week) => {
        const row = document.createElement("div");
        row.dataset.xhPart = "week-row";
        for (const day of week) {
          const cell = document.createElement("div");
          cell.dataset.xhPart = "cell";
          cell.setAttribute("value", day.start);
          const trigger = document.createElement("div");
          trigger.dataset.xhPart = "cell-trigger";
          trigger.textContent = day.day;
          cell.append(trigger);
          row.append(cell);
        }
        return row;
      }),
    );
  }

  document.getElementById("calendar-range-picker-basic-mount").append(fragment);
  paintHead();
  paintBody();

  calendar.addEventListener("focused-value-change", paintBody);
  calendar.addEventListener("value-change", (event) => {
    // 值只在两端都落定时更新；挑到一半的起点记在元素里
    const [start, end] = event.detail.value;
    readout.textContent = start && end ? `${start} → ${end}` : "（未选）";
  });
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="calendar-range-picker"`：`root` · `header` · `prev-year-trigger` · `prev-trigger` · `next-trigger` · `next-year-trigger` · `heading` · `heading-year-trigger` · `heading-month-trigger` · **`grid`** · `grid-head` · `week-day` · `grid-body` · `week-row` · `week-number` · **`cell`** · **`cell-trigger`**

## 示例

### 并排两个月

visible-count=2：起止常跨月，并排查看两页更便于选择；翻页时整个窗口一起移动

```vue
<script setup lang="ts">
import {
  XhCalendarRangePickerCell,
  XhCalendarRangePickerCellTrigger,
  XhCalendarRangePickerGrid,
  XhCalendarRangePickerGridBody,
  XhCalendarRangePickerGridHead,
  XhCalendarRangePickerHeader,
  XhCalendarRangePickerHeading,
  XhCalendarRangePickerNextTrigger,
  XhCalendarRangePickerPrevTrigger,
  XhCalendarRangePickerRoot,
  XhCalendarRangePickerWeekDay,
  XhCalendarRangePickerWeekRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string[]>(["2026-09-28", "2026-10-06"]);
</script>

<template>
  <XhCalendarRangePickerRoot
    v-slot="{ panels, weekDays }"
    v-model:value="value"
    default-focused-value="2026-09-28"
    locale="zh-CN"
    :visible-count="2"
    fixed-weeks
  >
    <XhCalendarRangePickerHeader>
      <XhCalendarRangePickerPrevTrigger aria-label="上个月" />
      <!-- 两张面板各有自己的标题，翻页按钮只有一对 -->
      <XhCalendarRangePickerHeading v-for="panel in panels" :key="panel.index" :index="panel.index" />
      <XhCalendarRangePickerNextTrigger aria-label="下个月" />
    </XhCalendarRangePickerHeader>
    <div style="display: flex; gap: 16px">
      <XhCalendarRangePickerGrid v-for="panel in panels" :key="panel.index" :index="panel.index">
        <XhCalendarRangePickerGridHead>
          <XhCalendarRangePickerWeekRow>
            <XhCalendarRangePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
          </XhCalendarRangePickerWeekRow>
        </XhCalendarRangePickerGridHead>
        <XhCalendarRangePickerGridBody>
          <XhCalendarRangePickerWeekRow v-for="week in panel.weeks" :key="week[0].start">
            <!-- 同一天会同时出现在两张面板里，格子得自报属于哪一张 -->
            <XhCalendarRangePickerCell v-for="day in week" :key="day.start" :value="day.start" :index="panel.index">
              <XhCalendarRangePickerCellTrigger>{{ day.day }}</XhCalendarRangePickerCellTrigger>
            </XhCalendarRangePickerCell>
          </XhCalendarRangePickerWeekRow>
        </XhCalendarRangePickerGridBody>
      </XhCalendarRangePickerGrid>
    </div>
  </XhCalendarRangePickerRoot>

  <span style="font-size: 13px">区间：{{ value.length === 2 ? `${value[0]} → ${value[1]}` : "（未选）" }}</span>
</template>
```

```html
<div id="calendar-range-picker-two-panels-mount"></div>
<span style="font-size: 13px">区间：<span id="calendar-range-picker-two-panels-value">2026-09-28 → 2026-10-06</span></span>

<!-- 结构先收在模板里：必需的格子要在元素接线前就位，所以网格填好了才入页 -->
<template id="calendar-range-picker-two-panels-template">
  <xh-calendar-range-picker locale="zh-CN" visible-count="2" default-focused-value="2026-09-28" fixed-weeks>
    <div data-xh-part="root">
      <div data-xh-part="header">
        <button data-xh-part="prev-trigger" aria-label="上个月"></button>
        <!-- 两张面板各有自己的标题，翻页按钮只有一对 -->
        <div data-xh-part="heading" index="0"></div>
        <div data-xh-part="heading" index="1"></div>
        <button data-xh-part="next-trigger" aria-label="下个月"></button>
      </div>
      <div style="display: flex; gap: 16px">
        <div data-xh-part="grid" index="0">
          <div data-xh-part="grid-head"><div data-xh-part="week-row"></div></div>
          <div data-xh-part="grid-body"></div>
        </div>
        <div data-xh-part="grid" index="1">
          <div data-xh-part="grid-head"><div data-xh-part="week-row"></div></div>
          <div data-xh-part="grid-body"></div>
        </div>
      </div>
    </div>
  </xh-calendar-range-picker>
</template>

<script type="module">
  const fragment = document
    .getElementById("calendar-range-picker-two-panels-template")
    .content.cloneNode(true);
  const calendar = fragment.querySelector("xh-calendar-range-picker");
  const headings = [...fragment.querySelectorAll('[data-xh-part="heading"]')];
  const grids = [...fragment.querySelectorAll('[data-xh-part="grid"]')];
  const readout = document.getElementById("calendar-range-picker-two-panels-value");
  calendar.defaultValue = ["2026-09-28", "2026-10-06"];

  let painted = "";

  function paintHead(grid) {
    const head = grid.querySelector('[data-xh-part="grid-head"] [data-xh-part="week-row"]');
    head.replaceChildren(
      ...calendar.weekDays.map((day) => {
        const cell = document.createElement("span");
        cell.dataset.xhPart = "week-day";
        cell.setAttribute("value", day.value);
        cell.textContent = day.label;
        return cell;
      }),
    );
  }

  // 视窗整体翻页才重画：两张面板各铺各的月，格子归所在的那张 grid
  function paintBody() {
    const panels = calendar.panels;
    const key = panels.map((p) => p.startValue).join("|");
    if (key === painted) {
      return;
    }
    painted = key;
    panels.forEach((panel, index) => {
      headings[index].textContent = panel.headingLabel;
      const body = grids[index].querySelector('[data-xh-part="grid-body"]');
      body.replaceChildren(
        ...panel.weeks.map((week) => {
          const row = document.createElement("div");
          row.dataset.xhPart = "week-row";
          for (const day of week) {
            const cell = document.createElement("div");
            cell.dataset.xhPart = "cell";
            cell.setAttribute("value", day.start);
            const trigger = document.createElement("div");
            trigger.dataset.xhPart = "cell-trigger";
            trigger.textContent = day.day;
            cell.append(trigger);
            row.append(cell);
          }
          return row;
        }),
      );
    });
  }

  document.getElementById("calendar-range-picker-two-panels-mount").append(fragment);
  grids.forEach(paintHead);
  paintBody();

  calendar.addEventListener("focused-value-change", paintBody);
  calendar.addEventListener("value-change", (event) => {
    const [start, end] = event.detail.value;
    readout.textContent = start && end ? `${start} → ${end}` : "（未选）";
  });
</script>
```

### 不可用的日期

allows-non-contiguous-ranges 允许区间跨过周末，只是这些日期不铺设轨道；isDateUnavailable 可得到起点，据此限制区间长度

```vue
<script setup lang="ts">
import {
  XhCalendarRangePickerCell,
  XhCalendarRangePickerCellTrigger,
  XhCalendarRangePickerGrid,
  XhCalendarRangePickerGridBody,
  XhCalendarRangePickerGridHead,
  XhCalendarRangePickerHeader,
  XhCalendarRangePickerHeading,
  XhCalendarRangePickerNextTrigger,
  XhCalendarRangePickerPrevTrigger,
  XhCalendarRangePickerRoot,
  XhCalendarRangePickerWeekDay,
  XhCalendarRangePickerWeekRow,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const value = ref<string[]>([]);

// 周末判为不可用；第二个参数是挑到一半的起点，落了起点之后只许挑 7 天内
function isUnavailable(iso: string, anchor: string | null) {
  const [y, m, d] = iso.split("-").map(Number);
  const weekday = new Date(y, m - 1, d).getDay();
  if (weekday === 0 || weekday === 6)
    return true;
  if (!anchor)
    return false;
  const days = Math.abs((new Date(iso).getTime() - new Date(anchor).getTime()) / 86400000);
  return days > 7;
}

// 值只在两端都落定时更新；挑到一半的起点记在组件里
const text = computed(() => (value.value.length === 2 ? `${value.value[0]} → ${value.value[1]}` : "（未选）"));
</script>

<template>
  <XhCalendarRangePickerRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    locale="zh-CN"
    :is-date-unavailable="isUnavailable"
    allows-non-contiguous-ranges
    fixed-weeks
    style="max-inline-size: 280px"
  >
    <XhCalendarRangePickerHeader>
      <XhCalendarRangePickerPrevTrigger aria-label="上个月" />
      <XhCalendarRangePickerHeading />
      <XhCalendarRangePickerNextTrigger aria-label="下个月" />
    </XhCalendarRangePickerHeader>
    <XhCalendarRangePickerGrid>
      <XhCalendarRangePickerGridHead>
        <XhCalendarRangePickerWeekRow>
          <XhCalendarRangePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
        </XhCalendarRangePickerWeekRow>
      </XhCalendarRangePickerGridHead>
      <XhCalendarRangePickerGridBody>
        <XhCalendarRangePickerWeekRow v-for="week in weeks" :key="week[0].start">
          <XhCalendarRangePickerCell v-for="day in week" :key="day.start" :value="day.start">
            <XhCalendarRangePickerCellTrigger>{{ day.day }}</XhCalendarRangePickerCellTrigger>
          </XhCalendarRangePickerCell>
        </XhCalendarRangePickerWeekRow>
      </XhCalendarRangePickerGridBody>
    </XhCalendarRangePickerGrid>
  </XhCalendarRangePickerRoot>

  <span style="font-size: 13px">区间：{{ text }}</span>
</template>
```

```html
<div id="calendar-range-picker-unavailable-mount"></div>
<span style="font-size: 13px">区间：<span id="calendar-range-picker-unavailable-value">（未选）</span></span>

<!-- 结构先收在模板里：必需的格子要在元素接线前就位，所以网格填好了才入页 -->
<template id="calendar-range-picker-unavailable-template">
  <xh-calendar-range-picker locale="zh-CN" allows-non-contiguous-ranges fixed-weeks>
    <div data-xh-part="root" style="max-inline-size: 280px">
      <div data-xh-part="header">
        <button data-xh-part="prev-trigger" aria-label="上个月"></button>
        <div data-xh-part="heading"></div>
        <button data-xh-part="next-trigger" aria-label="下个月"></button>
      </div>
      <div data-xh-part="grid">
        <div data-xh-part="grid-head">
          <div data-xh-part="week-row"></div>
        </div>
        <div data-xh-part="grid-body"></div>
      </div>
    </div>
  </xh-calendar-range-picker>
</template>

<script type="module">
  const fragment = document
    .getElementById("calendar-range-picker-unavailable-template")
    .content.cloneNode(true);
  const calendar = fragment.querySelector("xh-calendar-range-picker");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector('[data-xh-part="grid-head"] [data-xh-part="week-row"]');
  const body = fragment.querySelector('[data-xh-part="grid-body"]');
  const readout = document.getElementById("calendar-range-picker-unavailable-value");

  // 周末判为不可用；第二个参数是挑到一半的起点，落了起点之后只许挑 7 天内
  calendar.isDateUnavailable = (iso, anchor) => {
    const [y, m, d] = iso.split("-").map(Number);
    const weekday = new Date(y, m - 1, d).getDay();
    if (weekday === 0 || weekday === 6) {
      return true;
    }
    if (!anchor) {
      return false;
    }
    const days = Math.abs((new Date(iso).getTime() - new Date(anchor).getTime()) / 86400000);
    return days > 7;
  };

  // 已经画出来的是哪个月
  let month = "";

  // 表头七列只跟 locale 走，画一次就够
  function paintHead() {
    head.replaceChildren(
      ...calendar.weekDays.map((day) => {
        const cell = document.createElement("span");
        cell.dataset.xhPart = "week-day";
        cell.setAttribute("value", day.value);
        cell.textContent = day.label;
        return cell;
      }),
    );
  }

  // 换了月才重画格子：同月内移动焦点时格子原样留着，区间底色由元素自己写
  function paintBody() {
    const first = calendar.weeks[0][0].start;
    if (first === month) {
      return;
    }
    month = first;
    heading.textContent = calendar.headingLabel;
    body.replaceChildren(
      ...calendar.weeks.map((week) => {
        const row = document.createElement("div");
        row.dataset.xhPart = "week-row";
        for (const day of week) {
          const cell = document.createElement("div");
          cell.dataset.xhPart = "cell";
          cell.setAttribute("value", day.start);
          const trigger = document.createElement("div");
          trigger.dataset.xhPart = "cell-trigger";
          trigger.textContent = day.day;
          cell.append(trigger);
          row.append(cell);
        }
        return row;
      }),
    );
  }

  document.getElementById("calendar-range-picker-unavailable-mount").append(fragment);
  paintHead();
  paintBody();

  calendar.addEventListener("focused-value-change", paintBody);
  calendar.addEventListener("value-change", (event) => {
    // 值只在两端都落定时更新；挑到一半的起点记在元素里
    const [start, end] = event.detail.value;
    readout.textContent = start && end ? `${start} → ${end}` : "（未选）";
  });
</script>
```

### 按周选择

granularity=week：一行一个整周，格子直接铺进网格；值是两端两周的周首日；月、季度与年同理

```vue
<script setup lang="ts">
import {
  XhCalendarRangePickerCell,
  XhCalendarRangePickerCellTrigger,
  XhCalendarRangePickerGrid,
  XhCalendarRangePickerHeader,
  XhCalendarRangePickerHeading,
  XhCalendarRangePickerNextTrigger,
  XhCalendarRangePickerPrevTrigger,
  XhCalendarRangePickerRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const value = ref<string[]>([]);

// 值只在两端都落定时更新；挑到一半的起点记在组件里
const text = computed(() => (value.value.length === 2 ? `${value.value[0]} → ${value.value[1]}` : "（未选）"));
</script>

<template>
  <XhCalendarRangePickerRoot
    v-slot="{ periods }"
    v-model:value="value"
    locale="zh-CN"
    granularity="week"
    style="max-inline-size: 280px"
  >
    <XhCalendarRangePickerHeader>
      <XhCalendarRangePickerPrevTrigger aria-label="上个月" />
      <XhCalendarRangePickerHeading />
      <XhCalendarRangePickerNextTrigger aria-label="下个月" />
    </XhCalendarRangePickerHeader>
    <!-- 周期视图没有周行那一层：一格就是一整周，格子直接铺进网格 -->
    <XhCalendarRangePickerGrid>
      <XhCalendarRangePickerCell v-for="period in periods" :key="period.key" :value="period.start">
        <XhCalendarRangePickerCellTrigger>{{ period.label }}</XhCalendarRangePickerCellTrigger>
      </XhCalendarRangePickerCell>
    </XhCalendarRangePickerGrid>
  </XhCalendarRangePickerRoot>

  <span style="font-size: 13px">周区间：{{ text }}</span>
</template>
```

```html
<div id="calendar-range-picker-granularity-mount"></div>
<span style="font-size: 13px">周区间：<span id="calendar-range-picker-granularity-value">（未选）</span></span>

<!-- 结构先收在模板里：必需的格子要在元素接线前就位，所以网格填好了才入页。
     周期视图没有周行那一层：一格就是一整周，格子直接铺进 grid -->
<template id="calendar-range-picker-granularity-template">
  <xh-calendar-range-picker locale="zh-CN" granularity="week">
    <div data-xh-part="root" style="max-inline-size: 280px">
      <div data-xh-part="header">
        <button data-xh-part="prev-trigger" aria-label="上个月"></button>
        <div data-xh-part="heading"></div>
        <button data-xh-part="next-trigger" aria-label="下个月"></button>
      </div>
      <div data-xh-part="grid"></div>
    </div>
  </xh-calendar-range-picker>
</template>

<script type="module">
  const fragment = document
    .getElementById("calendar-range-picker-granularity-template")
    .content.cloneNode(true);
  const calendar = fragment.querySelector("xh-calendar-range-picker");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const grid = fragment.querySelector('[data-xh-part="grid"]');
  const readout = document.getElementById("calendar-range-picker-granularity-value");

  // 已经画出来的是哪个月
  let month = "";

  // 换了月才重画格子：同月内移动焦点时格子原样留着，区间底色由元素自己写
  function paintBody() {
    const periods = calendar.periods;
    const first = periods[0]?.start ?? "";
    if (first === month) {
      return;
    }
    month = first;
    heading.textContent = calendar.headingLabel;
    grid.replaceChildren(
      ...periods.map((period) => {
        const cell = document.createElement("div");
        cell.dataset.xhPart = "cell";
        cell.setAttribute("value", period.start);
        const trigger = document.createElement("div");
        trigger.dataset.xhPart = "cell-trigger";
        trigger.textContent = period.label;
        cell.append(trigger);
        return cell;
      }),
    );
  }

  document.getElementById("calendar-range-picker-granularity-mount").append(fragment);
  paintBody();

  calendar.addEventListener("focused-value-change", paintBody);
  calendar.addEventListener("value-change", (event) => {
    // 值只在两端都落定时更新；挑到一半的起点记在元素里
    const [start, end] = event.detail.value;
    readout.textContent = start && end ? `${start} → ${end}` : "（未选）";
  });
</script>
```

## 设计指引

### 何时使用

- 需要查看整月分布再选择一段起止：预订入住与退房、报表统计区间、排班周期。
- 起止常跨月，需要并排查看两个月再决定。

### 何时不用

- 只选一天或几个不连续的日期时，使用[日历选择器](./calendar-picker)。
- 需要键入起止日期或放在表单字段中时，使用[日期范围选择器](./date-range-picker)。

### 特性

- 先选起点再选终点：起点只记录在组件内，两端都落定后才写值；Escape 撤销起点后原区间保持不变。
- 支持按住拖选：按下即落起点，拖到另一格松开即完成；按住已选区间的一端拖动可以直接改写该端；触屏按住片刻才开始拖动，轻点仍是普通点选。
- 焦点离开网格时，未完成的区间在起点到聚焦日之间就地收口，不留悬空的起点。
- 落起点后可选范围默认被夹在两侧最近的不可用日之间，`allowsNonContiguousRanges` 允许跨过它们；`isDateUnavailable` 的第二个参数是当前起点，可据此限制区间长度。
- 已选区间的任一端越界或不可用即标记为不合法，也可以用 `invalid` 显式声明。
- `granularity` 决定周期格的生成方式；周、月、季度和年区间共用同一套 Period 边界判断。
- `visibleCount` 并排展示连续的月份，翻页时整个视窗一起移动；起止常跨月时建议为 2。
- `calendarPeriodValue` 将两端转换为 `{ granularity, start, end, keys }`，可直接用于查询参数。
- 周首日、月份名与星期名跟随 `locale`，与日历选择器使用同一套解析链。

### 组合

- 内嵌在[日期范围选择器](./date-range-picker)的浮层中，由它持有聚焦日与层级切换。
- 与[日历选择器](./calendar-picker)共用同一套部件名与皮肤槽，只多出区间轨道的几条状态。

### 最佳实践

- 区间中段保持连续淡色带，起止使用实心端点；未完成的预览与已落定的区间外观一致，悬停预览不显示独立的普通悬停样式。
- 今天使用 1px 品牌环 + 品牌字，落在区间里时环压在淡色带上，仍与起止端点的实心面分得开。
- 周区间按整周格连续预览，月份、季度和年份区间共用同一套 Period 边界判断。
- 落起点后把焦点移动一格，让键盘用户看出正在选择一段而不是一天。
- 起止常跨月时设置 `visibleCount="2"`，避免用户来回翻页。

### 反模式

- 用两个日历选择器分别选起止：中间的日期不铺轨道，也没有拖选与预览。
- 不可选的日期无法聚焦，键盘用户无从知道该位置的内容。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-calendar-range-picker>` |
| Vue 组件 | `XhCalendarRangePickerCell` `XhCalendarRangePickerCellTrigger` `XhCalendarRangePickerGrid` `XhCalendarRangePickerGridBody` `XhCalendarRangePickerGridHead` `XhCalendarRangePickerHeader` `XhCalendarRangePickerHeading` `XhCalendarRangePickerHeadingMonthTrigger` `XhCalendarRangePickerHeadingYearTrigger` `XhCalendarRangePickerNextTrigger` `XhCalendarRangePickerNextYearTrigger` `XhCalendarRangePickerPrevTrigger` `XhCalendarRangePickerPrevYearTrigger` `XhCalendarRangePickerRoot` `XhCalendarRangePickerWeekDay` `XhCalendarRangePickerWeekNumber` `XhCalendarRangePickerWeekRow` |
| 组合式函数 | `useCalendarRangePicker` |
| 状态机 | `calendarRangePickerMachine` |
| 皮肤 | `@xihan-ui/styles/calendar-range-picker.css` |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `CalendarRangePickerValueChangeDetails` | 区间两端都落定；detail 为 `{ value: string[] }`，长度恒为 2 |
| `focused-value-change` | `CalendarFocusChangeDetails` | 聚焦日变化；detail 为 `{ focusedValue: string }` |
| `active-view-change` | `CalendarViewChangeDetails` | 切换到另一层级；detail 为 `{ activeView: 'day'\|'week'\|'month'\|'quarter'\|'year' }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCalendarRangePickerRoot` | `default` | `CalendarRangePickerRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhCalendarRangePickerCell` | `value` | `string` | 是 | ISO 日期串。 |
| `XhCalendarRangePickerCell` | `index` | `number` |  | 属于第几个面板，默认 0。多面板时必须提供：同一天会同时出现在两个面板中 （8 月末的几天也铺在 9 月的首行），是否为本月只有连同面板一起看才能判定。 |
| `XhCalendarRangePickerGrid` | `index` | `number` |  | 属于第几个面板，默认 0。单面板时不必写。 |
| `XhCalendarRangePickerHeading` | `index` | `number` |  | 属于第几个面板，默认 0。单面板时不必写。 |
| `XhCalendarRangePickerHeadingMonthTrigger` | `index` | `number` |  | 属于第几个面板，默认 0。单面板时不必写。 |
| `XhCalendarRangePickerHeadingYearTrigger` | `index` | `number` |  | 属于第几个面板，默认 0。单面板时不必写。 |
| `XhCalendarRangePickerRoot` | `value` | `string \| string[]` |  |  |
| `XhCalendarRangePickerRoot` | `defaultValue` | `string \| string[]` |  |  |
| `XhCalendarRangePickerRoot` | `focusedValue` | `string` |  |  |
| `XhCalendarRangePickerRoot` | `defaultFocusedValue` | `string` |  |  |
| `XhCalendarRangePickerRoot` | `min` | `string` |  |  |
| `XhCalendarRangePickerRoot` | `max` | `string` |  |  |
| `XhCalendarRangePickerRoot` | `isDateUnavailable` | `(value: string, anchor: string \| null) => boolean` |  |  |
| `XhCalendarRangePickerRoot` | `allowsNonContiguousRanges` | `boolean` |  | 区间允许跨过不可用的日期；默认关闭，落下起点后只能选到两侧最近的不可用日为止。 |
| `XhCalendarRangePickerRoot` | `invalid` | `boolean` |  | 校验失败：根带 data-invalid，区间内的格子报告 aria-invalid。 |
| `XhCalendarRangePickerRoot` | `locale` | `string` |  |  |
| `XhCalendarRangePickerRoot` | `timeZone` | `string` |  |  |
| `XhCalendarRangePickerRoot` | `disabled` | `boolean` |  |  |
| `XhCalendarRangePickerRoot` | `readOnly` | `boolean` |  |  |
| `XhCalendarRangePickerRoot` | `weekdayFormat` | `CalendarWeekdayFormat` |  |  |
| `XhCalendarRangePickerRoot` | `fixedWeeks` | `boolean` |  |  |
| `XhCalendarRangePickerRoot` | `granularity` | `CalendarGranularity` |  | 选择粒度。 |
| `XhCalendarRangePickerRoot` | `activeView` | `CalendarView` |  | 面板当前所处的层级；给定即受控，默认跟随 granularity。 |
| `XhCalendarRangePickerRoot` | `defaultActiveView` | `CalendarView` |  | 非受控初值，默认同 granularity。 |
| `XhCalendarRangePickerRoot` | `visibleCount` | `number` |  | 并排展示几页，默认 1。 |
| `XhCalendarRangePickerRoot` | `translations` | `Partial<CalendarRangePickerTranslations>` |  |  |
| `XhCalendarRangePickerRoot` | `onValueChange` | `CalendarRangePickerProps['onValueChange']` |  |  |
| `XhCalendarRangePickerRoot` | `onFocusedValueChange` | `CalendarRangePickerProps['onFocusedValueChange']` |  |  |
| `XhCalendarRangePickerRoot` | `onActiveViewChange` | `CalendarRangePickerProps['onActiveViewChange']` |  |  |
| `XhCalendarRangePickerRoot` | `children` | `SlotChildren<CalendarRangePickerRootSlotProps>` |  |  |
| `XhCalendarRangePickerWeekDay` | `value` | `number \| string` | 是 | 列序 0-6，兼收字符串。 |
| `XhCalendarRangePickerWeekNumber` | `value` | `string` | 是 | 该行行首那一天的 ISO 串。 |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle` · `anchored`

**事件**：`RANGE.ANCHOR` · `RANGE.COMMIT` · `DRAG.SET` · `HOVER.SET` · `HOVER.CLEAR` · `PRESS.START` · `PRESS.END`

**判据**：`startsRange` · `anchorsRange` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `rangeAnchor` | `string \| null` | 区间选到一半时的起点（周期首日的 ISO 串）；其余时候为 null。 |
| `dragging` | `boolean` | 指针正按在格子上拖动选择区间。 |
| `setRangeAnchor` | `(next: string \| null) => void` | 直接改写区间起点；传 null 撤销选到一半的区间。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/#kbd_label)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the grid | 整张网格只占一个 Tab 位：焦点进入聚焦日那一格 |
| `ArrowLeft` | focus in grid | 焦点前移一天；越过月首即翻到上一月并落在那一天。粗粒度视图里走一格（一个月 / 一季 / 一年） |
| `ArrowRight` | focus in grid | 焦点后移一天；越过月末即翻到下一月并落在那一天。粗粒度视图里走一格 |
| `ArrowUp` | focus in grid | 焦点上移一周（减七天），跨月照样翻页。粗粒度视图里上移一行 |
| `ArrowDown` | focus in grid | 焦点下移一周（加七天），跨月照样翻页。粗粒度视图里下移一行 |
| `Home` | focus in grid | 焦点移到本周第一天；周首日随 locale 变。粗粒度视图里移到本行头一格 |
| `End` | focus in grid | 焦点移到本周最后一天。粗粒度视图里移到本行末一格 |
| `PageUp` | focus in grid | 退一个月，日号不变（月末日被目标月夹住：3 月 31 日退成 2 月 29 日）。粗粒度视图里退一整页 |
| `PageDown` | focus in grid | 进一个月，日号不变。粗粒度视图里进一整页 |
| `Shift+PageUp` | focus in grid | 退一年；粗粒度视图里退十页 |
| `Shift+PageDown` | focus in grid | 进一年；粗粒度视图里进十页 |
| `Enter` / `Space` | focus in grid, 聚焦周期可用且非只读 | 先落起点再落终点。落起点后焦点自动前进一格（挑不了就退一格），方向键走到哪儿预览就铺到哪儿；落终点那一下把两端一并写出。还没钻到 granularity 那一档时这一下是往下钻一层 |
| `Escape` | focus in grid, 区间已落起点 | 撤掉起点，原来的区间原样还在；不拦默认行为，外层浮层照常收起 |
| `Tab` / `Shift+Tab` | focus in grid, 区间已落起点 | 焦点离开前把区间收在起点到聚焦日之间；不拦默认行为，焦点照常离开 |
| `Enter` / `Space` | held in prev-year-trigger / prev-trigger / next-trigger / next-year-trigger / heading-year-trigger / heading-month-trigger / cell-trigger, 该部件可按 | 按住期间该部件投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，按住途中整张转入禁用也撤下。落起点那一下焦点前进一格，按压面随焦点一起走。整张禁用时谁都不进；只读时日期格不进（翻页与钻层照常）；到界的翻页钮与到顶的标题是原生 disabled，不可选的格子是 aria-disabled，都不进 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `grid` | `aria-disabled` | 'true' \| 'false' |
| `grid` | `aria-labelledby` | frame.headingId(panel.index) |
| `grid` | `aria-multiselectable` | 'true' |
| `grid` | `aria-readonly` | 'true' \| 'false' |
| `grid` | `role` | 'grid' |
| `grid-head` | `role` | 'rowgroup' |
| `week-day` | `aria-label` | meta?.long |
| `week-day` | `role` | 'columnheader' |
| `grid-body` | `role` | 'rowgroup' |
| `week-row` | `role` | 'row' |
| `week-number` | `aria-hidden` | 'true' |
| `week-number` | `role` | 'rowheader' |
| `cell` | `aria-selected` | 'true' \| 'false' |
| `cell` | `role` | 'gridcell' |
| `cell-trigger` | `aria-description` | translations.finishRangeSelectionPrompt \| translations.startRangeSelectionPrompt \| undefined |
| `cell-trigger` | `aria-disabled` | 'true' \| 'false' |
| `cell-trigger` | `aria-invalid` | 'true' \| undefined |
| `cell-trigger` | `aria-label` | frame.dateLabel(state.date, period) |
| `cell-trigger` | `role` | 'button' |

## 样式参考

### 皮肤

`@xihan-ui/styles/calendar-range-picker.css` 使用 `[data-scope="calendar-range-picker"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `prev-year-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `prev-year-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `prev-year-trigger` | `data-xh-action-control` | '' |
| `prev-year-trigger` | `data-xh-action-display` | 'always' |
| `prev-year-trigger` | `data-xh-action-profile` | 'icon' |
| `prev-year-trigger` | `data-xh-action-size` | 'sm' |
| `prev-year-trigger` | `data-xh-action-variant` | 'ghost' |
| `prev-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `prev-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `prev-trigger` | `data-xh-action-control` | '' |
| `prev-trigger` | `data-xh-action-display` | 'always' |
| `prev-trigger` | `data-xh-action-profile` | 'icon' |
| `prev-trigger` | `data-xh-action-size` | 'sm' |
| `prev-trigger` | `data-xh-action-variant` | 'ghost' |
| `next-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `next-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `next-trigger` | `data-xh-action-control` | '' |
| `next-trigger` | `data-xh-action-display` | 'always' |
| `next-trigger` | `data-xh-action-profile` | 'icon' |
| `next-trigger` | `data-xh-action-size` | 'sm' |
| `next-trigger` | `data-xh-action-variant` | 'ghost' |
| `next-year-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `next-year-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `next-year-trigger` | `data-xh-action-control` | '' |
| `next-year-trigger` | `data-xh-action-display` | 'always' |
| `next-year-trigger` | `data-xh-action-profile` | 'icon' |
| `next-year-trigger` | `data-xh-action-size` | 'sm' |
| `next-year-trigger` | `data-xh-action-variant` | 'ghost' |
| `heading` | `data-index` | frame.panelOf(panel).index |
| `heading` | `data-view` | view |
| `heading-year-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `heading-year-trigger` | `data-index` | frame.panelOf(panel).index |
| `heading-year-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `heading-year-trigger` | `data-view` | view |
| `heading-year-trigger` | `data-xh-action-control` | '' |
| `heading-year-trigger` | `data-xh-action-display` | 'always' |
| `heading-year-trigger` | `data-xh-action-profile` | 'text' |
| `heading-year-trigger` | `data-xh-action-size` | 'sm' |
| `heading-year-trigger` | `data-xh-action-variant` | 'ghost' |
| `heading-month-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `heading-month-trigger` | `data-index` | frame.panelOf(panel).index |
| `heading-month-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `heading-month-trigger` | `data-view` | view |
| `heading-month-trigger` | `data-xh-action-control` | '' |
| `heading-month-trigger` | `data-xh-action-display` | 'always' |
| `heading-month-trigger` | `data-xh-action-profile` | 'text' |
| `heading-month-trigger` | `data-xh-action-size` | 'sm' |
| `heading-month-trigger` | `data-xh-action-variant` | 'ghost' |
| `grid` | `data-disabled` | ''（条件成立时才出现） |
| `grid` | `data-dragging` | ''（条件成立时才出现） |
| `grid` | `data-index` | frame.panelOf(panel).index |
| `grid` | `data-readonly` | ''（条件成立时才出现） |
| `grid` | `data-view` | view |
| `cell` | `data-disabled` | ''（条件成立时才出现） |
| `cell` | `data-focus` | ''（条件成立时才出现） |
| `cell` | `data-in-range` | ''（条件成立时才出现） |
| `cell` | `data-invalid` | ''（条件成立时才出现） |
| `cell` | `data-outside-month` | ''（条件成立时才出现） |
| `cell` | `data-range-end` | ''（条件成立时才出现） |
| `cell` | `data-range-preview` | ''（条件成立时才出现） |
| `cell` | `data-range-start` | ''（条件成立时才出现） |
| `cell` | `data-selected` | ''（条件成立时才出现） |
| `cell` | `data-today` | ''（条件成立时才出现） |
| `cell-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `cell-trigger` | `data-focus` | ''（条件成立时才出现） |
| `cell-trigger` | `data-in-range` | ''（条件成立时才出现） |
| `cell-trigger` | `data-invalid` | ''（条件成立时才出现） |
| `cell-trigger` | `data-outside-month` | ''（条件成立时才出现） |
| `cell-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `cell-trigger` | `data-range-end` | ''（条件成立时才出现） |
| `cell-trigger` | `data-range-preview` | ''（条件成立时才出现） |
| `cell-trigger` | `data-range-start` | ''（条件成立时才出现） |
| `cell-trigger` | `data-selected` | ''（条件成立时才出现） |
| `cell-trigger` | `data-today` | ''（条件成立时才出现） |
| `cell-trigger` | `data-xh-action-control` | '' |
| `cell-trigger` | `data-xh-action-display` | 'always' |
| `cell-trigger` | `data-xh-action-profile` | 'text' |
| `cell-trigger` | `data-xh-action-size` | 'sm' |
| `cell-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-calendar-range-picker-cell-bg-hover` | `cell-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | calendar-range-picker 的 cell-trigger 部件 background-color 覆盖槽。 |
| `--xh-calendar-range-picker-cell-bg-pressed` | `cell-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | calendar-range-picker 的 cell-trigger 部件 background-color 覆盖槽。 |
| `--xh-calendar-range-picker-cell-bg-selected` | `cell-trigger` | `background-color` | `disabled`<br>`focus-visible`<br>`hover`<br>`in-range`<br>`is([data-range-start], [data-range-end])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-in-range])`<br>`not([data-loading])`<br>`not([data-outside-month])`<br>`outside-month`<br>`range-end`<br>`range-start`<br>`selected` | `--xh-bg-brand` | calendar-range-picker 的 cell-trigger 部件 background-color 覆盖槽。 |
| `--xh-calendar-range-picker-cell-bg-selected-active` | `cell-trigger` | `background-color` | `disabled`<br>`in-range`<br>`is(:active, [data-pressed])`<br>`is([data-range-start], [data-range-end])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-in-range])`<br>`not([data-loading])`<br>`not([data-outside-month])`<br>`outside-month`<br>`pressed`<br>`range-end`<br>`range-start`<br>`selected` | `--xh-bg-brand-active` | calendar-range-picker 的 cell-trigger 部件 background-color 覆盖槽。 |
| `--xh-calendar-range-picker-cell-bg-selected-disabled` | `cell-trigger` | `background-color` | `disabled`<br>`selected` | `--xh-bg-subtle` | calendar-range-picker 的 cell-trigger 部件 background-color 覆盖槽。 |
| `--xh-calendar-range-picker-cell-fg` | `cell-trigger` | `color` | `@media print`<br>`default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`in-range`<br>`is(:active, [data-pressed])`<br>`is([data-range-start], [data-range-end])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-in-range])`<br>`not([data-loading])`<br>`not([data-outside-month])`<br>`outside-month`<br>`pressed`<br>`range-end`<br>`range-start`<br>`selected` | `--xh-fg-default` | calendar-range-picker 的 cell-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-range-picker-cell-fg-outside` | `cell-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`outside-month`<br>`pressed` | `--xh-fg-subtle` | calendar-range-picker 的 cell-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-range-picker-cell-fg-selected` | `cell-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`in-range`<br>`is(:active, [data-pressed])`<br>`is([data-range-start], [data-range-end])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-in-range])`<br>`not([data-loading])`<br>`not([data-outside-month])`<br>`outside-month`<br>`pressed`<br>`range-end`<br>`range-start`<br>`selected` | `--xh-fg-on-brand` | calendar-range-picker 的 cell-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-range-picker-cell-font-size` | `cell-trigger` | `font-size` | `default` | `--xh-text-body-size` | calendar-range-picker 的 cell-trigger 部件 font-size 覆盖槽。 |
| `--xh-calendar-range-picker-cell-font-weight` | `cell-trigger` | `font-weight` | `default` | `--xh-font-weight-medium` | calendar-range-picker 的 cell-trigger 部件 font-weight 覆盖槽。 |
| `--xh-calendar-range-picker-cell-gap` | `cell`<br>`cell-trigger` | `inset`<br>`inset-block`<br>`padding` | `default`<br>`in-range`<br>`not([data-outside-month])`<br>`outside-month` | `--xh-space-0_5` | calendar-range-picker 的 cell、cell-trigger 部件 inset、inset-block、padding 覆盖槽。 |
| `--xh-calendar-range-picker-cell-radius` | `cell`<br>`cell-trigger`<br>`grid` | `border-radius` | `default`<br>`in-range`<br>`is([data-view='week'], [data-view='month'], [data-view='quarter'], [data-view='year'])`<br>`view=month`<br>`view=quarter`<br>`view=week`<br>`view=year` | `--xh-shape-inset` | calendar-range-picker 的 cell、cell-trigger、grid 部件 border-radius 覆盖槽。 |
| `--xh-calendar-range-picker-cell-size` | `cell-trigger` | `min-inline-size` | `default` | `--xh-control-h-sm` | calendar-range-picker 的 cell-trigger 部件 min-inline-size 覆盖槽。 |
| `--xh-calendar-range-picker-gap` | `root` | `gap` | `default` | `--xh-space-2` | calendar-range-picker 的 root 部件 gap 覆盖槽。 |
| `--xh-calendar-range-picker-grid-gap` | `grid` | `gap` | `default` | `--xh-space-1` | calendar-range-picker 的 grid 部件 gap 覆盖槽。 |
| `--xh-calendar-range-picker-header-gap` | `header` | `gap` | `default` | `--xh-space-2` | calendar-range-picker 的 header 部件 gap 覆盖槽。 |
| `--xh-calendar-range-picker-heading-fg` | `heading`<br>`heading-month-trigger`<br>`heading-year-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`not([hidden])` | `--xh-fg-default` | calendar-range-picker 的 heading、heading-month-trigger、heading-year-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-range-picker-heading-font-size` | `heading`<br>`heading-month-trigger`<br>`heading-year-trigger` | `font-size` | `default`<br>`not([hidden])` | `--xh-text-label-size` | calendar-range-picker 的 heading、heading-month-trigger、heading-year-trigger 部件 font-size 覆盖槽。 |
| `--xh-calendar-range-picker-heading-font-weight` | `heading`<br>`heading-month-trigger`<br>`heading-year-trigger` | `font-weight` | `default`<br>`not([hidden])` | `--xh-font-weight-semibold` | calendar-range-picker 的 heading、heading-month-trigger、heading-year-trigger 部件 font-weight 覆盖槽。 |
| `--xh-calendar-range-picker-heading-trigger-bg-pressed` | `heading-month-trigger`<br>`heading-year-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([hidden])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | calendar-range-picker 的 heading-month-trigger、heading-year-trigger 部件 background-color 覆盖槽。 |
| `--xh-calendar-range-picker-heading-trigger-fg-hover` | `heading-month-trigger`<br>`heading-year-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([hidden])`<br>`pressed` | `--xh-fg-brand` | calendar-range-picker 的 heading-month-trigger、heading-year-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-range-picker-heading-trigger-px` | `heading-month-trigger`<br>`heading-year-trigger` | `padding-inline` | `not([hidden])` | `--xh-space-1` | calendar-range-picker 的 heading-month-trigger、heading-year-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-calendar-range-picker-heading-trigger-radius` | `heading-month-trigger`<br>`heading-year-trigger` | `border-radius` | `not([hidden])` | `--xh-shape-control` | calendar-range-picker 的 heading-month-trigger、heading-year-trigger 部件 border-radius 覆盖槽。 |
| `--xh-calendar-range-picker-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-sm` | calendar-range-picker 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-calendar-range-picker-nav-bg` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `background-color` | `default`<br>`focus-visible` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-rest` | calendar-range-picker 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 background-color 覆盖槽。 |
| `--xh-calendar-range-picker-nav-bg-hover` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | calendar-range-picker 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 background-color 覆盖槽。 |
| `--xh-calendar-range-picker-nav-bg-pressed` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | calendar-range-picker 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 background-color 覆盖槽。 |
| `--xh-calendar-range-picker-nav-fg` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `color` | `default`<br>`focus-visible` | `--xh-fg-muted` | calendar-range-picker 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-range-picker-nav-fg-hover` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | calendar-range-picker 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-range-picker-nav-radius` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `border-radius` | `default` | `--xh-shape-control` | calendar-range-picker 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 border-radius 覆盖槽。 |
| `--xh-calendar-range-picker-nav-size` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | calendar-range-picker 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-calendar-range-picker-period-gap` | `grid` | `gap` | `view=month`<br>`view=quarter`<br>`view=week`<br>`view=year` | `--xh-space-1` | calendar-range-picker 的 grid 部件 gap 覆盖槽。 |
| `--xh-calendar-range-picker-period-py` | `cell-trigger`<br>`grid` | `padding-block` | `is([data-view='week'], [data-view='month'], [data-view='quarter'], [data-view='year'])`<br>`view=month`<br>`view=quarter`<br>`view=week`<br>`view=year` | `--xh-space-2` | calendar-range-picker 的 cell-trigger、grid 部件 padding-block 覆盖槽。 |
| `--xh-calendar-range-picker-period-radius` | `cell-trigger`<br>`grid` | `border-radius` | `is([data-view='week'], [data-view='month'], [data-view='quarter'], [data-view='year'])`<br>`view=month`<br>`view=quarter`<br>`view=week`<br>`view=year` | `--xh-shape-control` | calendar-range-picker 的 cell-trigger、grid 部件 border-radius 覆盖槽。 |
| `--xh-calendar-range-picker-range-bg` | `cell` | `background` | `in-range`<br>`not([data-outside-month])`<br>`outside-month` | `--xh-bg-brand-subtle` | calendar-range-picker 的 cell 部件 background 覆盖槽。 |
| `--xh-calendar-range-picker-range-cap-radius` | `cell` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `in-range`<br>`range-end`<br>`range-start` | `--xh-shape-inset` | calendar-range-picker 的 cell 部件 border-end-end-radius、border-end-start-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-calendar-range-picker-range-cell-bg-hover` | `cell-trigger` | `background-color` | `disabled`<br>`hover`<br>`in-range`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-outside-month], [data-disabled], [data-range-start], [data-range-end])`<br>`outside-month`<br>`range-end`<br>`range-start` | `--xh-bg-brand-subtle-hover` | calendar-range-picker 的 cell-trigger 部件 background-color 覆盖槽。 |
| `--xh-calendar-range-picker-range-cell-bg-pressed` | `cell-trigger` | `background-color` | `disabled`<br>`in-range`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`not([data-outside-month], [data-disabled], [data-range-start], [data-range-end])`<br>`outside-month`<br>`pressed`<br>`range-end`<br>`range-start` | `--xh-bg-brand-subtle-active` | calendar-range-picker 的 cell-trigger 部件 background-color 覆盖槽。 |
| `--xh-calendar-range-picker-range-row-radius` | `cell`<br>`week-number`<br>`week-row` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `first-child`<br>`in-range`<br>`last-child` | `--xh-shape-inset` | calendar-range-picker 的 cell、week-number、week-row 部件 border-end-end-radius、border-end-start-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-calendar-range-picker-row-gap` | `grid-body`<br>`grid-head` | `gap` | `default` | `--xh-space-0` | calendar-range-picker 的 grid-body、grid-head 部件 gap 覆盖槽。 |
| `--xh-calendar-range-picker-today-bg` | `cell-trigger` | `background-color` | `disabled`<br>`focus-visible`<br>`today` | `transparent` | calendar-range-picker 的 cell-trigger 部件 background-color 覆盖槽。 |
| `--xh-calendar-range-picker-today-border` | `cell-trigger` | `border`<br>`border-color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`today` | `--xh-fg-brand` | calendar-range-picker 的 cell-trigger 部件 border、border-color 覆盖槽。 |
| `--xh-calendar-range-picker-today-fg` | `cell-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`today` | `--xh-fg-brand` | calendar-range-picker 的 cell-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-range-picker-week-cell-px` | `cell-trigger`<br>`grid` | `padding-inline` | `view=week` | `--xh-space-3` | calendar-range-picker 的 cell-trigger、grid 部件 padding-inline 覆盖槽。 |
| `--xh-calendar-range-picker-week-day-fg` | `week-day` | `color` | `default` | `--xh-fg-subtle` | calendar-range-picker 的 week-day 部件 color 覆盖槽。 |
| `--xh-calendar-range-picker-week-day-font-size` | `week-day` | `font-size` | `default` | `--xh-text-caption-size` | calendar-range-picker 的 week-day 部件 font-size 覆盖槽。 |
| `--xh-calendar-range-picker-week-day-font-weight` | `week-day` | `font-weight` | `default` | `--xh-font-weight-medium` | calendar-range-picker 的 week-day 部件 font-weight 覆盖槽。 |
| `--xh-calendar-range-picker-week-day-h` | `week-day` | `block-size` | `default` | `--xh-control-h-sm` | calendar-range-picker 的 week-day 部件 block-size 覆盖槽。 |
| `--xh-calendar-range-picker-week-number-fg` | `week-number` | `color` | `default` | `--xh-fg-subtle` | calendar-range-picker 的 week-number 部件 color 覆盖槽。 |
| `--xh-calendar-range-picker-week-number-font-size` | `week-number` | `font-size` | `default` | `--xh-text-caption-size` | calendar-range-picker 的 week-number 部件 font-size 覆盖槽。 |
| `--xh-calendar-range-picker-week-number-w` | `week-row` | `grid-template-columns` | `has(> [data-part='week-number'])`<br>`not([hidden])` | `--xh-control-h-md` | calendar-range-picker 的 week-row 部件 grid-template-columns 覆盖槽。 |
| `--xh-calendar-range-picker-year-grid-max-h` | `grid` | `max-block-size` | `view=year` | `--xh-viewport-h-sm` | calendar-range-picker 的 grid 部件 max-block-size 覆盖槽。 |
| `--xh-calendar-range-picker-year-grid-pe` | `grid` | `padding-inline-end` | `view=year` | `--xh-space-1` | calendar-range-picker 的 grid 部件 padding-inline-end 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
