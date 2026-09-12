来源：https://ui.docs.xihanfun.com/components/calendar

# Calendar `日历`

一整月（或周 / 月 / 季 / 年）的网格，格子里可以放内容。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/calendar" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/calendar.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/calendar" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/calendar" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/calendar.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

网格由作者照 weeks / weekDays 自己渲染，组件一个节点都不替你生成

```vue
<script setup lang="ts">
import {
  XhCalendarCell,
  XhCalendarCellTrigger,
  XhCalendarGrid,
  XhCalendarGridBody,
  XhCalendarGridHead,
  XhCalendarHeader,
  XhCalendarHeading,
  XhCalendarNextTrigger,
  XhCalendarPrevTrigger,
  XhCalendarRoot,
  XhCalendarWeekDay,
  XhCalendarWeekRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 选中值恒为数组，单选时长度不超过 1
const value = ref<string[]>([]);
</script>

<template>
  <XhCalendarRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    locale="zh-CN"
    fixed-weeks
    style="max-inline-size: 280px"
  >
    <XhCalendarHeader>
      <!-- 箭头字符念不出「上个月」，可及名字得自己给 -->
      <XhCalendarPrevTrigger aria-label="上个月" />
      <XhCalendarHeading />
      <XhCalendarNextTrigger aria-label="下个月" />
    </XhCalendarHeader>
    <XhCalendarGrid>
      <XhCalendarGridHead>
        <XhCalendarWeekRow>
          <XhCalendarWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
        </XhCalendarWeekRow>
      </XhCalendarGridHead>
      <XhCalendarGridBody>
        <!-- 格子按日期做 key：翻月时前后两月共有的那几天原地复用，指针底下那一格不被抽走 -->
        <XhCalendarWeekRow v-for="week in weeks" :key="week[0].value">
          <XhCalendarCell v-for="day in week" :key="day.value" :value="day.value">
            <XhCalendarCellTrigger>{{ day.day }}</XhCalendarCellTrigger>
          </XhCalendarCell>
        </XhCalendarWeekRow>
      </XhCalendarGridBody>
    </XhCalendarGrid>
  </XhCalendarRoot>

  <span style="font-size: 13px">选中：{{ value[0] ?? "（未选）" }}</span>
</template>
```

```html
<div id="calendar-basic-mount"></div>
<span style="font-size: 13px">选中：<span id="calendar-basic-value">（未选）</span></span>

<!-- 结构先收在模板里：必需的格子要在元素接线前就位，所以网格填好了才入页 -->
<template id="calendar-basic-template">
  <xh-calendar locale="zh-CN" fixed-weeks>
    <div data-xh-part="root" style="max-inline-size: 280px">
      <div data-xh-part="header">
        <!-- 箭头字符念不出「上个月」，可及名字得自己给 -->
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
  </xh-calendar>
</template>

<script type="module">
  const fragment = document
    .getElementById("calendar-basic-template")
    .content.cloneNode(true);
  const calendar = fragment.querySelector("xh-calendar");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector('[data-xh-part="grid-head"] [data-xh-part="week-row"]');
  const body = fragment.querySelector('[data-xh-part="grid-body"]');
  const readout = document.getElementById("calendar-basic-value");

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

  // 换了月才重画格子：同月内移动焦点时格子原样留着，选中态与焦点态由元素自己写
  function paintBody() {
    const first = calendar.weeks[0][0].value;
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
          cell.setAttribute("value", day.value);
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

  // 元素一连上就能读 weeks / weekDays，接线排在这之后，格子赶得上
  document.getElementById("calendar-basic-mount").append(fragment);
  paintHead();
  paintBody();

  calendar.addEventListener("focused-value-change", paintBody);
  calendar.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
</script>
```

## 示例

### 区间选择

selection-mode=range：第一下落起点、第二下落终点，中间铺一条连续底色

```vue
<script setup lang="ts">
import {
  XhCalendarCell,
  XhCalendarCellTrigger,
  XhCalendarGrid,
  XhCalendarGridBody,
  XhCalendarGridHead,
  XhCalendarHeader,
  XhCalendarHeading,
  XhCalendarNextTrigger,
  XhCalendarPrevTrigger,
  XhCalendarRoot,
  XhCalendarWeekDay,
  XhCalendarWeekRow,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const value = ref<string[]>([]);

// 挑到一半时集合里只有起点一个值
const text = computed(() => {
  if (value.value.length === 0)
    return "（未选）";
  if (value.value.length === 1)
    return `${value.value[0]} → 待定`;
  return `${value.value[0]} → ${value.value[1]}`;
});
</script>

<template>
  <XhCalendarRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    locale="zh-CN"
    selection-mode="range"
    fixed-weeks
    style="max-inline-size: 280px"
  >
    <XhCalendarHeader>
      <XhCalendarPrevTrigger aria-label="上个月" />
      <XhCalendarHeading />
      <XhCalendarNextTrigger aria-label="下个月" />
    </XhCalendarHeader>
    <XhCalendarGrid>
      <XhCalendarGridHead>
        <XhCalendarWeekRow>
          <XhCalendarWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
        </XhCalendarWeekRow>
      </XhCalendarGridHead>
      <XhCalendarGridBody>
        <XhCalendarWeekRow v-for="week in weeks" :key="week[0].value">
          <XhCalendarCell v-for="day in week" :key="day.value" :value="day.value">
            <XhCalendarCellTrigger>{{ day.day }}</XhCalendarCellTrigger>
          </XhCalendarCell>
        </XhCalendarWeekRow>
      </XhCalendarGridBody>
    </XhCalendarGrid>
  </XhCalendarRoot>

  <span style="font-size: 13px">区间：{{ text }}</span>
</template>
```

```html
<div id="calendar-range-mount"></div>
<span style="font-size: 13px">区间：<span id="calendar-range-value">（未选）</span></span>

<!-- 结构先收在模板里：必需的格子要在元素接线前就位，所以网格填好了才入页 -->
<template id="calendar-range-template">
  <xh-calendar locale="zh-CN" selection-mode="range" fixed-weeks>
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
  </xh-calendar>
</template>

<script type="module">
  const fragment = document
    .getElementById("calendar-range-template")
    .content.cloneNode(true);
  const calendar = fragment.querySelector("xh-calendar");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector('[data-xh-part="grid-head"] [data-xh-part="week-row"]');
  const body = fragment.querySelector('[data-xh-part="grid-body"]');
  const readout = document.getElementById("calendar-range-value");

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
    const first = calendar.weeks[0][0].value;
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
          cell.setAttribute("value", day.value);
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

  document.getElementById("calendar-range-mount").append(fragment);
  paintHead();
  paintBody();

  calendar.addEventListener("focused-value-change", paintBody);
  calendar.addEventListener("value-change", (event) => {
    // 挑到一半时集合里只有起点一个值
    const [start, end] = event.detail.value;
    readout.textContent = start ? `${start} → ${end ?? "待定"}` : "（未选）";
  });
</script>
```

### 不可选的日子

isDateUnavailable 与 min / max 都只挡落值不挡聚焦：方向键照样走得过去

```vue
<script setup lang="ts">
import {
  XhCalendarCell,
  XhCalendarCellTrigger,
  XhCalendarGrid,
  XhCalendarGridBody,
  XhCalendarGridHead,
  XhCalendarHeader,
  XhCalendarHeading,
  XhCalendarNextTrigger,
  XhCalendarPrevTrigger,
  XhCalendarRoot,
  XhCalendarWeekDay,
  XhCalendarWeekRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string[]>([]);

// 今天前后各七天是可选窗口
function shift(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

const min = shift(-7);
const max = shift(7);

// 周末判为不可用
function isWeekend(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const weekday = new Date(y, m - 1, d).getDay();
  return weekday === 0 || weekday === 6;
}
</script>

<template>
  <XhCalendarRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    :min="min"
    :max="max"
    :is-date-unavailable="isWeekend"
    locale="zh-CN"
    weekday-format="narrow"
    fixed-weeks
    style="max-inline-size: 280px"
  >
    <XhCalendarHeader>
      <XhCalendarPrevTrigger aria-label="上个月" />
      <XhCalendarHeading />
      <XhCalendarNextTrigger aria-label="下个月" />
    </XhCalendarHeader>
    <XhCalendarGrid>
      <XhCalendarGridHead>
        <XhCalendarWeekRow>
          <XhCalendarWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
        </XhCalendarWeekRow>
      </XhCalendarGridHead>
      <XhCalendarGridBody>
        <XhCalendarWeekRow v-for="week in weeks" :key="week[0].value">
          <XhCalendarCell v-for="day in week" :key="day.value" :value="day.value">
            <XhCalendarCellTrigger>{{ day.day }}</XhCalendarCellTrigger>
          </XhCalendarCell>
        </XhCalendarWeekRow>
      </XhCalendarGridBody>
    </XhCalendarGrid>
  </XhCalendarRoot>

  <span style="font-size: 13px">
    可选窗口 {{ min }} ~ {{ max }}，周末除外 · 选中：{{ value[0] ?? "（未选）" }}
  </span>
</template>
```

```html
<div id="calendar-unavailable-mount"></div>
<span id="calendar-unavailable-note" style="font-size: 13px"></span>

<!-- 结构先收在模板里：必需的格子要在元素接线前就位，所以网格填好了才入页 -->
<template id="calendar-unavailable-template">
  <xh-calendar locale="zh-CN" weekday-format="narrow" fixed-weeks>
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
  </xh-calendar>
</template>

<script type="module">
  const fragment = document
    .getElementById("calendar-unavailable-template")
    .content.cloneNode(true);
  const calendar = fragment.querySelector("xh-calendar");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector('[data-xh-part="grid-head"] [data-xh-part="week-row"]');
  const body = fragment.querySelector('[data-xh-part="grid-body"]');
  const note = document.getElementById("calendar-unavailable-note");

  // 今天前后各七天是可选窗口
  function shift(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  }

  const min = shift(-7);
  const max = shift(7);

  // 周末判为不可用
  function isWeekend(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    const weekday = new Date(y, m - 1, d).getDay();
    return weekday === 0 || weekday === 6;
  }

  // 已经画出来的是哪个月
  let month = "";
  let picked = "（未选）";

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

  // 换了月才重画格子：同月内移动焦点时格子原样留着，可用与否由元素自己写
  function paintBody() {
    const first = calendar.weeks[0][0].value;
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
          cell.setAttribute("value", day.value);
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

  function paintNote() {
    note.textContent = `可选窗口 ${min} ~ ${max}，周末除外 · 选中：${picked}`;
  }

  // 范围与判定函数在入页前给：判定函数是函数，只走 property
  calendar.setAttribute("min", min);
  calendar.setAttribute("max", max);
  calendar.isDateUnavailable = isWeekend;

  document.getElementById("calendar-unavailable-mount").append(fragment);
  paintHead();
  paintBody();
  paintNote();

  calendar.addEventListener("focused-value-change", paintBody);
  calendar.addEventListener("value-change", (event) => {
    picked = event.detail.value[0] ?? "（未选）";
    paintNote();
  });
</script>
```

### 格子里放内容

cell-trigger 的内容全由作者写，日号之外还能塞自己的标记

```vue
<script setup lang="ts">
import {
  XhCalendarCell,
  XhCalendarCellTrigger,
  XhCalendarGrid,
  XhCalendarGridBody,
  XhCalendarGridHead,
  XhCalendarHeader,
  XhCalendarHeading,
  XhCalendarNextTrigger,
  XhCalendarPrevTrigger,
  XhCalendarRoot,
  XhCalendarWeekDay,
  XhCalendarWeekRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string[]>([]);

// 每月 1 号与 15 号当作有安排的日子
function hasPlan(iso: string) {
  const day = Number(iso.slice(8, 10));
  return day === 1 || day === 15;
}
</script>

<template>
  <XhCalendarRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    locale="zh-CN"
    fixed-weeks
    style="max-inline-size: 360px"
  >
    <XhCalendarHeader>
      <XhCalendarPrevTrigger aria-label="上个月" />
      <XhCalendarHeading />
      <XhCalendarNextTrigger aria-label="下个月" />
    </XhCalendarHeader>
    <XhCalendarGrid>
      <XhCalendarGridHead>
        <XhCalendarWeekRow>
          <XhCalendarWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
        </XhCalendarWeekRow>
      </XhCalendarGridHead>
      <XhCalendarGridBody>
        <XhCalendarWeekRow v-for="week in weeks" :key="week[0].value">
          <XhCalendarCell v-for="day in week" :key="day.value" :value="day.value">
            <XhCalendarCellTrigger>
              <span style="display: grid; justify-items: center; gap: 2px">
                <span>{{ day.day }}</span>
                <!-- 没安排的日子把这颗点隐掉，不是删掉 -->
                <span
                  :style="{
                    fontSize: '10px',
                    lineHeight: '1',
                    visibility: hasPlan(day.value) ? 'visible' : 'hidden',
                  }"
                >
                  •
                </span>
              </span>
            </XhCalendarCellTrigger>
          </XhCalendarCell>
        </XhCalendarWeekRow>
      </XhCalendarGridBody>
    </XhCalendarGrid>
  </XhCalendarRoot>

  <span style="font-size: 13px">选中：{{ value[0] ?? "（未选）" }}</span>
</template>
```

```html
<div id="calendar-cell-content-mount"></div>
<span style="font-size: 13px">
  选中：<span id="calendar-cell-content-value">（未选）</span>
</span>

<!-- 结构先收在模板里：必需的格子要在元素接线前就位，所以网格填好了才入页 -->
<template id="calendar-cell-content-template">
  <xh-calendar locale="zh-CN" fixed-weeks>
    <div data-xh-part="root" style="max-inline-size: 360px">
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
  </xh-calendar>
</template>

<script type="module">
  const fragment = document
    .getElementById("calendar-cell-content-template")
    .content.cloneNode(true);
  const calendar = fragment.querySelector("xh-calendar");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector('[data-xh-part="grid-head"] [data-xh-part="week-row"]');
  const body = fragment.querySelector('[data-xh-part="grid-body"]');
  const readout = document.getElementById("calendar-cell-content-value");

  // 每月 1 号与 15 号当作有安排的日子
  function hasPlan(iso) {
    const day = Number(iso.slice(8, 10));
    return day === 1 || day === 15;
  }

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

  // 换了月才重画格子：同月内移动焦点时格子原样留着，选中态与焦点态由元素自己写
  function paintBody() {
    const first = calendar.weeks[0][0].value;
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
          cell.setAttribute("value", day.value);

          const trigger = document.createElement("div");
          trigger.dataset.xhPart = "cell-trigger";
          trigger.innerHTML = `
            <span style="display: grid; justify-items: center; gap: 2px">
              <span>${day.day}</span>
              <span style="font-size: 10px; line-height: 1; visibility: ${
                hasPlan(day.value) ? "visible" : "hidden"
              }">•</span>
            </span>`;

          cell.append(trigger);
          row.append(cell);
        }
        return row;
      }),
    );
  }

  document.getElementById("calendar-cell-content-mount").append(fragment);
  paintHead();
  paintBody();

  calendar.addEventListener("focused-value-change", paintBody);
  calendar.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
</script>
```

## 设计指引

### 何时使用

- 需要看见整段时间的分布：日程、排班、可预约情况。
- 需要在格子里显示当天的事件。

### 何时不用

- 只是录入一个日期：用[日期选择器](./date-picker)或[日期输入](./date-field)。

### 特性

- 星期名由作者自己渲染，组件一个节点都不替你生成。
- `isDateUnavailable` 与 `min` / `max` 都只挡落值不挡聚焦——键盘用户仍能走到不可选的日子上，读屏会念出它不可选。
- 支持区间选择、整周选择、固定六行与多月并排。
- 周首日、月份名与星期名跟着 `locale` 走：`en-US` 周日起、`zh-CN` 周一起。不给 `locale` 就跟宿主浏览器语言，读不到才落 `en-US`——要固定成一种排法就把 `locale` 显式传上去。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-calendar>` |
| Vue 组件 | `XhCalendarCell` `XhCalendarCellTrigger` `XhCalendarGrid` `XhCalendarGridBody` `XhCalendarGridHead` `XhCalendarHeader` `XhCalendarHeading` `XhCalendarHeadingMonthTrigger` `XhCalendarHeadingYearTrigger` `XhCalendarNextTrigger` `XhCalendarNextYearTrigger` `XhCalendarPrevTrigger` `XhCalendarPrevYearTrigger` `XhCalendarRoot` `XhCalendarWeekDay` `XhCalendarWeekNumber` `XhCalendarWeekRow` |
| 组合式函数 | `useCalendar` |
| 状态机 | `calendarMachine` |
| 皮肤 | `@xihan-ui/styles/calendar.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="calendar"`：`root` · `header` · `prev-year-trigger` · `prev-trigger` · `next-trigger` · `next-year-trigger` · `heading` · `heading-year-trigger` · `heading-month-trigger` · **`grid`** · `grid-head` · `week-day` · `grid-body` · `week-row` · `week-number` · **`cell`** · **`cell-trigger`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| string[]` |  | 选中值，ISO 串。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 单选写成裸串是简写，内部一律归一成数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `selectionMode` | `CalendarSelectionMode` |  |  |
| `focusedValue` | `string` |  | 当前聚焦的那天，ISO 串；它同时决定展示哪个月。给定即受控。 缺省时退回首个选中值，再退回今天。 |
| `defaultFocusedValue` | `string` |  |  |
| `min` | `string` |  | 可选范围下界（含当天），ISO 串。界外的日子转 aria-disabled，但仍可聚焦。 |
| `max` | `string` |  | 可选范围上界（含当天），ISO 串。 |
| `isDateUnavailable` | `(value: string) => boolean` |  | 作者给的不可用判定，收 ISO 串。返回真的日子与界外日子同等对待。 |
| `locale` | `string` |  | 决定周首日与月份/星期几的文案，不给按宿主语言，宿主也没有时按 en-US。 |
| `timeZone` | `string` |  | 判定「今天」与格式化文案用的时区，默认取宿主本地时区。 |
| `disabled` | `boolean` |  | 整张日历禁用：翻月按钮转原生 disabled，格子全转 aria-disabled，键盘与点击都不改值。 |
| `readOnly` | `boolean` |  | 只读：翻月与移动焦点照常，只是选不动值。 |
| `weekdayFormat` | `CalendarWeekdayFormat` |  | 表头缩写粒度，默认 short。 |
| `fixedWeeks` | `boolean` |  | 恒渲染六行，默认按当月实际周数。开着能让翻月时网格高度不跳。 |
| `view` | `CalendarView` |  | 挑的粒度：天（默认）、月、季度、年。这一档也是「点一格就是选中」的那一档。 格子的值一律是「那段时间的第一天」的 ISO 串，不另立一套值形态—— min/max 比较、区间逻辑、不可用判定、表单出口于是全都原样复用。 |
| `activeView` | `CalendarView` |  | 面板此刻铺的是哪一档格子。给定即受控（date-picker 就是这么持有它的）。 它与 view 是两件事：view 是作者要挑的粒度，这个是人钻到了哪一层。 点标题里的年会把它抬到 year，再点一格就往 view 那一档钻回去；到了 view 那一档， 点一格才是选中。缺省即等于 view。 |
| `defaultActiveView` | `CalendarView` |  | 非受控初值，缺省同 view。 |
| `weekSelection` | `boolean` |  | 周选：点任意一天选中它所在的整周，值落成 [周首日, 周末日]。 只在 view=day 且 selectionMode=range 下生效。 |
| `visibleCount` | `number` |  | 并排展示几个连续月，默认 1。区间选择给 2 才好挑——起止常跨月， 一个面板要来回翻页。翻页时整窗一起走一个月，不是各翻各的。 小于 1 的写法回落到 1。 |
| `onValueChange` | `(details: CalendarValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onFocusedValueChange` | `(details: CalendarFocusChangeDetails) => void` |  | 聚焦日变化（方向键、翻页、点了邻月的日子都会发）；受控时是唯一出口。 |
| `onActiveViewChange` | `(details: CalendarViewChangeDetails) => void` |  | 面板钻到了哪一层（点标题钻上、点格子钻下都会发）；受控时是唯一出口。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `CalendarValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `focused-value-change` | `CalendarFocusChangeDetails` | 聚焦日变化；detail 为 `{ focusedValue: string }` |
| `active-view-change` | `CalendarViewChangeDetails` | 钻到了另一层；detail 为 `{ activeView: 'day'\|'month'\|'quarter'\|'year' }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCalendarRoot` | `default` | `CalendarRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `CELL.SELECT` · `FOCUS.SET` · `VIEW.SET` · `HOVER.SET` · `HOVER.CLEAR`

## connect API

`useCalendar` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 选中集合，ISO 串；形状不随模式变。 |
| `selectionMode` | `CalendarSelectionMode` |  |
| `focusedValue` | `string` | 生效的聚焦日（三路收口后的结果），恒非空。 |
| `panels` | `CalendarPanel[]` | 并排展示的面板，长度即 visibleCount。作者照它渲染几张网格。 |
| `visibleMonth` | `{ year: number, month: number, startValue: string }` | 首个面板的展示月：年、月（1-12）、月首日 ISO。多面板时是最左那个。 |
| `weeks` | `CalendarDay[][]` | 首个面板的日期矩阵。多面板请改用 panels。 |
| `weekDays` | `CalendarWeekDay[]` | 七列表头，作者照它渲染 week-day。 |
| `headingLabel` | `string` | 首个面板的标题文案（如 2024年2月）。多面板请改用 panels。 |
| `view` | `CalendarView` | 作者要挑的粒度。 |
| `activeView` | `CalendarView` | 面板此刻铺的是哪一档格子。等于 view 时点一格就是选中，粗过 view 时点一格是往下钻。 |
| `headingOrder` | `readonly ('year' \| 'month')[]` | 标题里年与月在这个语言里的先后（zh-CN 是年在前，en-US 是月在前）。 手写标记时照它摆两个钮的顺序，标题读起来才顺。 |
| `canZoomOutYear` | `boolean` | 点标题里的年钻不钻得上去：年视图已到顶，钻不上去。 |
| `canZoomOutMonth` | `boolean` | 点标题里的月钻不钻得上去：只有日视图有月这一截。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `isUnavailable` | `(value: string) => boolean` | 界外或作者判定不可用。禁用的日历下恒为真。 |
| `canGoPrev` | `boolean` | 上一页是否还有可看的日子（整张禁用或整页都在 min 之前即为假）。 |
| `canGoNext` | `boolean` |  |
| `canGoPrevYear` | `boolean` | 大步翻此刻能不能按。判据同上，只是步长换成大步。 |
| `canGoNextYear` | `boolean` |  |
| `setValue` | `(next: string[]) => void` |  |
| `select` | `(value: string) => void` |  |
| `focus` | `(value: string) => void` | 改写聚焦日；跨月会连带换掉展示月。 |
| `setActiveView` | `(next: CalendarView) => void` | 直接钻到某一层。 |
| `goToPrevMonth` | `() => void` |  |
| `goToNextMonth` | `() => void` |  |
| `goToPrevYear` | `() => void` | 大步翻：日视图走一年，月/季度走十年，年视图走一百年。 |
| `goToNextYear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getPrevYearTriggerProps` | `() => T['button']` |  |
| `getPrevTriggerProps` | `() => T['button']` |  |
| `getNextTriggerProps` | `() => T['button']` |  |
| `getNextYearTriggerProps` | `() => T['button']` |  |
| `getHeadingProps` | `(props?: CalendarPanelProps) => T['element']` |  |
| `getHeadingYearTriggerProps` | `(props?: CalendarPanelProps) => T['button']` | 标题里年那一截，点它钻到十年格。年视图下已到顶，转原生 disabled。 |
| `getHeadingMonthTriggerProps` | `(props?: CalendarPanelProps) => T['button']` | 标题里月那一截，点它钻到月格。不在日视图时带 hidden（那一层没有月这一截）。 |
| `getGridProps` | `(props?: CalendarPanelProps) => T['element']` |  |
| `getGridHeadProps` | `() => T['element']` |  |
| `getWeekDayProps` | `(props: CalendarWeekDayProps) => T['element']` |  |
| `getGridBodyProps` | `() => T['element']` |  |
| `getWeekRowProps` | `() => T['element']` |  |
| `getWeekNumberProps` | `(props: CalendarWeekNumberProps) => T['element']` | 周序号格：行首那一列，语义上是这一行的表头（role=rowheader）。 |
| `getWeekNumberText` | `(props: CalendarWeekNumberProps) => string` | 这一行该显示的周序号文字。两个适配器都拿它填文本，保证同构。 |
| `getCellProps` | `(props: CalendarCellProps) => T['element']` |  |
| `getCellTriggerProps` | `(props: CalendarCellProps) => T['element']` |  |

## 键盘

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
| `Enter` / `Space` | focus in grid, 聚焦日可用且非只读 | 选中聚焦日：单选替换、多选切换、区间先落起点再落终点。还没钻到 view 那一档时这一下是往下钻一层 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `grid` | `aria-disabled` | 'true' \| 'false' |
| `grid` | `aria-labelledby` | `heading` 部件的 id |
| `grid` | `aria-multiselectable` | 'false' \| 'true' |
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
| `cell-trigger` | `aria-disabled` | 'true' \| 'false' |
| `cell-trigger` | `aria-label` | cellLabelFormatter.format(state.date.toDate(timeZone)) \| undefined |
| `cell-trigger` | `role` | 'button' |

## 样式

默认皮肤 `@xihan-ui/styles/calendar.css` 按部件选择：`[data-scope="calendar"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `prev-year-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `prev-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `next-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `next-year-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `heading` | `data-index` | panelOf(panel).index |
| `heading` | `data-view` | context.get('activeView') |
| `heading-year-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `heading-year-trigger` | `data-index` | panelOf(panel).index |
| `heading-year-trigger` | `data-view` | context.get('activeView') |
| `heading-month-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `heading-month-trigger` | `data-index` | panelOf(panel).index |
| `heading-month-trigger` | `data-view` | context.get('activeView') |
| `grid` | `data-disabled` | ''（条件成立时才出现） |
| `grid` | `data-index` | panelOf(panel).index |
| `grid` | `data-readonly` | ''（条件成立时才出现） |
| `grid` | `data-view` | context.get('activeView') |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-calendar-cell-bg-hover` | `cell-trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])`<br>`not([data-selected])`<br>`selected` | `--xh-bg-subtle-hover` | calendar 的 cell-trigger 部件 background 覆盖槽。 |
| `--xh-calendar-cell-bg-selected` | `cell-trigger` | `background` | `selected` | `--xh-bg-brand` | calendar 的 cell-trigger 部件 background 覆盖槽。 |
| `--xh-calendar-cell-fg` | `cell-trigger` | `color` | `@media print`<br>`default`<br>`selected` | `--xh-fg-default` | calendar 的 cell-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-cell-fg-outside` | `cell-trigger` | `color` | `outside-month` | `--xh-fg-subtle` | calendar 的 cell-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-cell-fg-selected` | `cell-trigger` | `color` | `selected` | `--xh-fg-on-brand` | calendar 的 cell-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-cell-font-size` | `cell-trigger` | `font-size` | `default` | `--xh-text-body-size` | calendar 的 cell-trigger 部件 font-size 覆盖槽。 |
| `--xh-calendar-cell-gap` | `cell` | `inset-block`<br>`padding` | `default`<br>`in-range` | `--xh-space-0_5` | calendar 的 cell 部件 inset-block、padding 覆盖槽。 |
| `--xh-calendar-cell-radius` | `cell`<br>`cell-trigger`<br>`grid`<br>`week-number`<br>`week-row` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `default`<br>`first-child`<br>`in-range`<br>`is([data-view='month'], [data-view='quarter'], [data-view='year'])`<br>`last-child`<br>`view=month`<br>`view=quarter`<br>`view=year` | `--xh-shape-pill` | calendar 的 cell、cell-trigger、grid、week-number、week-row 部件 border-end-end-radius、border-end-start-radius、border-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-calendar-cell-size` | `cell-trigger` | `min-inline-size` | `default` | `--xh-control-h-sm` | calendar 的 cell-trigger 部件 min-inline-size 覆盖槽。 |
| `--xh-calendar-gap` | `root` | `gap` | `default` | `--xh-space-3` | calendar 的 root 部件 gap 覆盖槽。 |
| `--xh-calendar-grid-gap` | `grid` | `gap` | `default` | `--xh-space-1` | calendar 的 grid 部件 gap 覆盖槽。 |
| `--xh-calendar-header-gap` | `header` | `gap` | `default` | `--xh-space-2` | calendar 的 header 部件 gap 覆盖槽。 |
| `--xh-calendar-heading-fg` | `heading`<br>`heading-month-trigger`<br>`heading-year-trigger` | `color` | `default`<br>`not([hidden])` | `--xh-fg-default` | calendar 的 heading、heading-month-trigger、heading-year-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-heading-font-size` | `heading`<br>`heading-month-trigger`<br>`heading-year-trigger` | `font-size` | `default`<br>`not([hidden])` | `--xh-text-label-size` | calendar 的 heading、heading-month-trigger、heading-year-trigger 部件 font-size 覆盖槽。 |
| `--xh-calendar-heading-font-weight` | `heading`<br>`heading-month-trigger`<br>`heading-year-trigger` | `font-weight` | `default`<br>`not([hidden])` | `--xh-font-weight-semibold` | calendar 的 heading、heading-month-trigger、heading-year-trigger 部件 font-weight 覆盖槽。 |
| `--xh-calendar-heading-trigger-fg-hover` | `heading-month-trigger`<br>`heading-year-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-brand` | calendar 的 heading-month-trigger、heading-year-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-heading-trigger-px` | `heading-month-trigger`<br>`heading-year-trigger` | `padding-inline` | `not([hidden])` | `--xh-space-1` | calendar 的 heading-month-trigger、heading-year-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-calendar-heading-trigger-radius` | `heading-month-trigger`<br>`heading-year-trigger` | `border-radius` | `not([hidden])` | `--xh-shape-control` | calendar 的 heading-month-trigger、heading-year-trigger 部件 border-radius 覆盖槽。 |
| `--xh-calendar-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | calendar 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-calendar-nav-bg` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `background` | `default` | `transparent` | calendar 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 background 覆盖槽。 |
| `--xh-calendar-nav-bg-hover` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | calendar 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 background 覆盖槽。 |
| `--xh-calendar-nav-fg` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `color` | `default` | `--xh-fg-muted` | calendar 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 color 覆盖槽。 |
| `--xh-calendar-nav-radius` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `border-radius` | `default` | `--xh-shape-control` | calendar 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 border-radius 覆盖槽。 |
| `--xh-calendar-nav-size` | `next-trigger`<br>`next-year-trigger`<br>`prev-trigger`<br>`prev-year-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-h-sm` | calendar 的 next-trigger、next-year-trigger、prev-trigger、prev-year-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-calendar-period-gap` | `grid` | `gap` | `view=month`<br>`view=quarter`<br>`view=year` | `--xh-space-1` | calendar 的 grid 部件 gap 覆盖槽。 |
| `--xh-calendar-period-py` | `cell-trigger`<br>`grid` | `padding-block` | `is([data-view='month'], [data-view='quarter'], [data-view='year'])`<br>`view=month`<br>`view=quarter`<br>`view=year` | `--xh-space-2` | calendar 的 cell-trigger、grid 部件 padding-block 覆盖槽。 |
| `--xh-calendar-range-bg` | `cell` | `background` | `in-range` | `--xh-bg-brand-subtle` | calendar 的 cell 部件 background 覆盖槽。 |
| `--xh-calendar-row-gap` | `grid-body`<br>`grid-head` | `gap` | `default` | `--xh-space-0` | calendar 的 grid-body、grid-head 部件 gap 覆盖槽。 |
| `--xh-calendar-today-border` | `cell-trigger` | `border-color` | `today` | `--xh-border-control` | calendar 的 cell-trigger 部件 border-color 覆盖槽。 |
| `--xh-calendar-week-day-fg` | `week-day` | `color` | `default` | `--xh-fg-subtle` | calendar 的 week-day 部件 color 覆盖槽。 |
| `--xh-calendar-week-day-font-size` | `week-day` | `font-size` | `default` | `--xh-text-caption-size` | calendar 的 week-day 部件 font-size 覆盖槽。 |
| `--xh-calendar-week-day-font-weight` | `week-day` | `font-weight` | `default` | `--xh-font-weight-medium` | calendar 的 week-day 部件 font-weight 覆盖槽。 |
| `--xh-calendar-week-day-h` | `week-day` | `block-size` | `default` | `--xh-control-h-sm` | calendar 的 week-day 部件 block-size 覆盖槽。 |
| `--xh-calendar-week-number-fg` | `week-number` | `color` | `default` | `--xh-fg-subtle` | calendar 的 week-number 部件 color 覆盖槽。 |
| `--xh-calendar-week-number-font-size` | `week-number` | `font-size` | `default` | `--xh-text-caption-size` | calendar 的 week-number 部件 font-size 覆盖槽。 |
| `--xh-calendar-week-number-w` | `week-number`<br>`week-row` | `grid-template-columns` | `has(> [data-part='week-number'])`<br>`not([hidden])` | `2.25rem` | calendar 的 week-number、week-row 部件 grid-template-columns 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 格子里放[徽标](./badge)或一小段[排印](./typography)；外面套[卡片](./card)。

## 最佳实践

- 今天要有明显标记，且与"选中"区分开。
- 格子里的内容超出时收起来，别让某一行比别的行高很多。

## 反模式

- 不可选的日子连焦点都到不了：键盘用户无从知道那里有什么。
- 用它当日期输入框。
