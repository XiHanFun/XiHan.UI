来源：https://ui.docs.xihanfun.com/components/date-range-picker

# DateRangePicker 日期范围选择器

将起止两组可键入的分段日期框、范围分隔符、日历触发器和范围日历浮层组合成一个字段。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/date-range-picker" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/date-range-picker.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/date-range-picker" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/date-range-picker" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/date-range-picker.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

输入或选择起止日期

```vue
<script setup lang="ts">
import {
  XhDateRangePickerCalendar,
  XhDateRangePickerCell,
  XhDateRangePickerCellTrigger,
  XhDateRangePickerClearTrigger,
  XhDateRangePickerContent,
  XhDateRangePickerControl,
  XhDateRangePickerGrid,
  XhDateRangePickerGridBody,
  XhDateRangePickerGridHead,
  XhDateRangePickerHeader,
  XhDateRangePickerHeading,
  XhDateRangePickerHiddenInput,
  XhDateRangePickerLabel,
  XhDateRangePickerNextTrigger,
  XhDateRangePickerPositioner,
  XhDateRangePickerPrevTrigger,
  XhDateRangePickerRangeSeparator,
  XhDateRangePickerRoot,
  XhDateRangePickerSegment,
  XhDateRangePickerSegmentGroup,
  XhDateRangePickerTrigger,
  XhDateRangePickerWeekDay,
  XhDateRangePickerWeekRow,
} from "@xihan-ui/vue";
</script>

<template>
  <XhDateRangePickerRoot
    v-slot="{ weeks, weekDays }"
    locale="zh-CN"
    name="trip-start"
    end-name="trip-end"
  >
    <XhDateRangePickerLabel>旅行日期</XhDateRangePickerLabel>
    <XhDateRangePickerControl>
      <!-- 组号定这组段位认领哪一端：0 起点、1 终点 -->
      <XhDateRangePickerSegmentGroup :index="0">
        <XhDateRangePickerSegment :index="0" />
        <span>/</span>
        <XhDateRangePickerSegment :index="1" />
        <span>/</span>
        <XhDateRangePickerSegment :index="2" />
      </XhDateRangePickerSegmentGroup>
      <XhDateRangePickerRangeSeparator />
      <XhDateRangePickerSegmentGroup :index="1">
        <XhDateRangePickerSegment :index="0" />
        <span>/</span>
        <XhDateRangePickerSegment :index="1" />
        <span>/</span>
        <XhDateRangePickerSegment :index="2" />
      </XhDateRangePickerSegmentGroup>
      <XhDateRangePickerClearTrigger />
      <XhDateRangePickerTrigger />
    </XhDateRangePickerControl>
    <!-- 两份表单出口：0 是起点，1 是终点 -->
    <XhDateRangePickerHiddenInput :index="0" />
    <XhDateRangePickerHiddenInput :index="1" />
    <XhDateRangePickerPositioner>
      <XhDateRangePickerContent>
        <XhDateRangePickerCalendar>
          <XhDateRangePickerHeader>
            <XhDateRangePickerPrevTrigger aria-label="上个月" />
            <XhDateRangePickerHeading />
            <XhDateRangePickerNextTrigger aria-label="下个月" />
          </XhDateRangePickerHeader>
          <XhDateRangePickerGrid>
            <XhDateRangePickerGridHead>
              <XhDateRangePickerWeekRow>
                <XhDateRangePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
              </XhDateRangePickerWeekRow>
            </XhDateRangePickerGridHead>
            <XhDateRangePickerGridBody>
              <XhDateRangePickerWeekRow v-for="week in weeks" :key="week[0].start">
                <XhDateRangePickerCell v-for="day in week" :key="day.start" :value="day.start">
                  <XhDateRangePickerCellTrigger>{{ day.day }}</XhDateRangePickerCellTrigger>
                </XhDateRangePickerCell>
              </XhDateRangePickerWeekRow>
            </XhDateRangePickerGridBody>
          </XhDateRangePickerGrid>
        </XhDateRangePickerCalendar>
      </XhDateRangePickerContent>
    </XhDateRangePickerPositioner>
  </XhDateRangePickerRoot>
</template>
```

```html
<div id="date-range-picker-basic-mount"></div>

<template id="date-range-picker-basic-template">
  <xh-date-range-picker locale="zh-CN" name="trip-start" end-name="trip-end">
    <div data-xh-part="root">
      <span data-xh-part="label">旅行日期</span>
      <div data-xh-part="control">
        <!-- 文档序在前的这组认领起点，在后的认领终点；里面铺几段由 granularity 推 -->
        <div data-xh-part="segment-group"></div>
        <span data-xh-part="range-separator">-</span>
        <div data-xh-part="segment-group"></div>
        <button data-xh-part="clear-trigger"></button>
        <button data-xh-part="trigger"></button>
      </div>
      <!-- 两份表单出口：文档序对应起止两端 -->
      <input data-xh-part="hidden-input" />
      <input data-xh-part="hidden-input" />
      <div data-xh-part="positioner">
        <div data-xh-part="content">
        </div>
      </div>
    </div>
  </xh-date-range-picker>
</template>

<script type="module">
  const fragment = document.getElementById("date-range-picker-basic-template").content.cloneNode(true);
  const picker = fragment.querySelector("xh-date-range-picker");
  const groups = picker.querySelectorAll('[data-xh-part="segment-group"]');
  const content = picker.querySelector('[data-xh-part="content"]');

  function node(tag, part, text) {
    const el = document.createElement(tag);
    if (part) {
      el.dataset.xhPart = part;
    }
    if (text !== undefined) {
      el.textContent = text;
    }
    return el;
  }

  function pageTrigger(part, label) {
    const el = node("button", part);
    el.setAttribute("aria-label", label);
    return el;
  }

  function dayCell(value, text) {
    const cell = node("div", "cell");
    cell.setAttribute("value", value);
    cell.append(node("div", "cell-trigger", text));
    return cell;
  }

  // 一页一张日历：面板号写在标题与网格上，格子跟着所在网格走
  function panelOf(panel, last, weekDays) {
    const calendar = node("div", "calendar");
    const header = node("div", "header");
    // 往前只在最左那张、往后只在最右那张：翻页整窗一起走
    if (panel.index === 0) {
      header.append(pageTrigger("prev-trigger", "上一页"));
    }
    const heading = node("div", "heading", panel.headingLabel);
    heading.setAttribute("index", panel.index);
    header.append(heading);
    if (last) {
      header.append(pageTrigger("next-trigger", "下一页"));
    }

    const grid = node("div", "grid");
    grid.setAttribute("index", panel.index);
    // 日视图铺周行，粗粒度视图把格子直接铺进网格
    if (panel.weeks.length > 0) {
      const head = node("div", "grid-head");
      const headRow = node("div", "week-row");
      for (const day of weekDays) {
        const column = node("span", "week-day", day.label);
        column.setAttribute("value", day.value);
        headRow.append(column);
      }
      head.append(headRow);

      const body = node("div", "grid-body");
      for (const week of panel.weeks) {
        const row = node("div", "week-row");
        for (const day of week) {
          row.append(dayCell(day.start, day.day));
        }
        body.append(row);
      }
      grid.append(head, body);
    } else {
      for (const cell of panel.cells) {
        grid.append(dayCell(cell.start, cell.label));
      }
    }

    calendar.append(header, grid);
    return calendar;
  }

  // 已经画出来的是哪几页
  let painted = "";

  function paintPanels() {
    const panels = picker.panels;
    const signature = panels
      .map((panel) => `${panel.index}:${panel.startValue}:${panel.weeks.length}`)
      .join("|");
    // 换了页或钻了层才重画；同页内移动焦点时格子原样留着
    if (signature === painted) {
      return;
    }
    painted = signature;
    const weekDays = picker.weekDays;
    // 快捷选项列写在模板里、排在日历前面，重画只换日历那几张
    for (const old of content.querySelectorAll(':scope > [data-xh-part="calendar"]')) {
      old.remove();
    }
    content.append(
      ...panels.map((panel, index) => panelOf(panel, index === panels.length - 1, weekDays)),
    );
  }

  // 段位是空节点：显示什么由组件按当前值填。「/」与「周」是普通节点，写在段位旁边
  function paintSegments(group, segments) {
    const out = [];
    segments.forEach((segment, index) => {
      if (index > 0) {
        out.push(node("span", undefined, "/"));
      }
      out.push(node("span", "segment"));
      if (segment.type === "week") {
        out.push(node("span", undefined, "周"));
      }
    });
    group.replaceChildren(...out);
  }

  // 元素一连上就能读 panels / fieldSegments，接线排在这之后，节点赶得上
  document.getElementById("date-range-picker-basic-mount").append(fragment);
  paintSegments(groups[0], picker.fieldSegments);
  paintSegments(groups[1], picker.fieldEndSegments);
  paintPanels();

  picker.addEventListener("focused-value-change", paintPanels);
  picker.addEventListener("active-view-change", paintPanels);
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="date-range-picker"`：`root` · `label` · **`control`** · `segment-group` · `range-separator` · `trigger` · `clear-trigger` · `positioner` · **`content`** · `preset-group` · `preset` · **`calendar`**

## 示例

### 两页并排

起止常跨月时设置 visibleCount=2，两页一起翻

```vue
<script setup lang="ts">
import {
  XhDateRangePickerCalendar,
  XhDateRangePickerCell,
  XhDateRangePickerCellTrigger,
  XhDateRangePickerClearTrigger,
  XhDateRangePickerContent,
  XhDateRangePickerControl,
  XhDateRangePickerGrid,
  XhDateRangePickerGridBody,
  XhDateRangePickerGridHead,
  XhDateRangePickerHeader,
  XhDateRangePickerHeading,
  XhDateRangePickerLabel,
  XhDateRangePickerNextTrigger,
  XhDateRangePickerPositioner,
  XhDateRangePickerPrevTrigger,
  XhDateRangePickerRangeSeparator,
  XhDateRangePickerRoot,
  XhDateRangePickerSegment,
  XhDateRangePickerSegmentGroup,
  XhDateRangePickerTrigger,
  XhDateRangePickerWeekDay,
  XhDateRangePickerWeekRow,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const value = ref<string[]>([]);
const text = computed(() => (value.value.length === 2 ? `${value.value[0]} → ${value.value[1]}` : "（未选）"));
</script>

<template>
  <XhDateRangePickerRoot
    v-slot="{ panels, weekDays }"
    v-model:value="value"
    :visible-count="2"
    locale="zh-CN"
  >
    <XhDateRangePickerLabel>入住与退房</XhDateRangePickerLabel>
    <XhDateRangePickerControl>
      <!-- 组号定这组段位认领哪一端：0 起点、1 终点 -->
      <XhDateRangePickerSegmentGroup :index="0">
        <XhDateRangePickerSegment :index="0" />
        <span>/</span>
        <XhDateRangePickerSegment :index="1" />
        <span>/</span>
        <XhDateRangePickerSegment :index="2" />
      </XhDateRangePickerSegmentGroup>
      <XhDateRangePickerRangeSeparator />
      <XhDateRangePickerSegmentGroup :index="1">
        <XhDateRangePickerSegment :index="0" />
        <span>/</span>
        <XhDateRangePickerSegment :index="1" />
        <span>/</span>
        <XhDateRangePickerSegment :index="2" />
      </XhDateRangePickerSegmentGroup>
      <XhDateRangePickerClearTrigger />
      <XhDateRangePickerTrigger />
    </XhDateRangePickerControl>
    <XhDateRangePickerPositioner>
      <XhDateRangePickerContent>
        <!-- 面板号写在日历上，面板内的标题、网格与格子跟着它走 -->
        <XhDateRangePickerCalendar v-for="panel in panels" :key="panel.index" :index="panel.index">
          <XhDateRangePickerHeader>
            <!-- 往前只在最左那张、往后只在最右那张：整窗一起走 -->
            <XhDateRangePickerPrevTrigger v-if="panel.index === 0" aria-label="上一页" />
            <XhDateRangePickerHeading />
            <XhDateRangePickerNextTrigger v-if="panel.index === panels.length - 1" aria-label="下一页" />
          </XhDateRangePickerHeader>
          <XhDateRangePickerGrid>
            <template v-if="panel.weeks.length > 0">
              <XhDateRangePickerGridHead>
                <XhDateRangePickerWeekRow>
                  <XhDateRangePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
                </XhDateRangePickerWeekRow>
              </XhDateRangePickerGridHead>
              <XhDateRangePickerGridBody>
                <XhDateRangePickerWeekRow v-for="week in panel.weeks" :key="week[0].start">
                  <XhDateRangePickerCell v-for="day in week" :key="day.start" :value="day.start">
                    <XhDateRangePickerCellTrigger>{{ day.day }}</XhDateRangePickerCellTrigger>
                  </XhDateRangePickerCell>
                </XhDateRangePickerWeekRow>
              </XhDateRangePickerGridBody>
            </template>
            <XhDateRangePickerCell v-for="cell in panel.cells" v-else :key="cell.start" :value="cell.start">
              <XhDateRangePickerCellTrigger>{{ cell.label }}</XhDateRangePickerCellTrigger>
            </XhDateRangePickerCell>
          </XhDateRangePickerGrid>
        </XhDateRangePickerCalendar>
      </XhDateRangePickerContent>
    </XhDateRangePickerPositioner>
  </XhDateRangePickerRoot>
  <p style="margin-block: var(--xh-space-2) 0; font-size: var(--xh-text-secondary-size)">区间：{{ text }}</p>
</template>
```

```html
<div id="date-range-picker-two-panels-mount"></div>

<template id="date-range-picker-two-panels-template">
  <xh-date-range-picker locale="zh-CN" visible-count="2">
    <div data-xh-part="root">
      <span data-xh-part="label">入住与退房</span>
      <div data-xh-part="control">
        <!-- 文档序在前的这组认领起点，在后的认领终点；里面铺几段由 granularity 推 -->
        <div data-xh-part="segment-group"></div>
        <span data-xh-part="range-separator">-</span>
        <div data-xh-part="segment-group"></div>
        <button data-xh-part="clear-trigger"></button>
        <button data-xh-part="trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
        </div>
      </div>
    </div>
  </xh-date-range-picker>
</template>
<p
  id="date-range-picker-two-panels-text"
  style="margin-block: var(--xh-space-2) 0; font-size: var(--xh-text-secondary-size)"
>
  区间：（未选）
</p>

<script type="module">
  const fragment = document.getElementById("date-range-picker-two-panels-template").content.cloneNode(true);
  const picker = fragment.querySelector("xh-date-range-picker");
  const groups = picker.querySelectorAll('[data-xh-part="segment-group"]');
  const content = picker.querySelector('[data-xh-part="content"]');
  const text = document.getElementById("date-range-picker-two-panels-text");
  // 值只在两端都落定时才有两项；只填了终点时是 ['', end]
  picker.addEventListener("value-change", (event) => {
    const [start, end] = event.detail.value;
    text.textContent = `区间：${start && end ? `${start} → ${end}` : "（未选）"}`;
  });

  function node(tag, part, text) {
    const el = document.createElement(tag);
    if (part) {
      el.dataset.xhPart = part;
    }
    if (text !== undefined) {
      el.textContent = text;
    }
    return el;
  }

  function pageTrigger(part, label) {
    const el = node("button", part);
    el.setAttribute("aria-label", label);
    return el;
  }

  function dayCell(value, text) {
    const cell = node("div", "cell");
    cell.setAttribute("value", value);
    cell.append(node("div", "cell-trigger", text));
    return cell;
  }

  // 一页一张日历：面板号写在标题与网格上，格子跟着所在网格走
  function panelOf(panel, last, weekDays) {
    const calendar = node("div", "calendar");
    const header = node("div", "header");
    // 往前只在最左那张、往后只在最右那张：翻页整窗一起走
    if (panel.index === 0) {
      header.append(pageTrigger("prev-trigger", "上一页"));
    }
    const heading = node("div", "heading", panel.headingLabel);
    heading.setAttribute("index", panel.index);
    header.append(heading);
    if (last) {
      header.append(pageTrigger("next-trigger", "下一页"));
    }

    const grid = node("div", "grid");
    grid.setAttribute("index", panel.index);
    // 日视图铺周行，粗粒度视图把格子直接铺进网格
    if (panel.weeks.length > 0) {
      const head = node("div", "grid-head");
      const headRow = node("div", "week-row");
      for (const day of weekDays) {
        const column = node("span", "week-day", day.label);
        column.setAttribute("value", day.value);
        headRow.append(column);
      }
      head.append(headRow);

      const body = node("div", "grid-body");
      for (const week of panel.weeks) {
        const row = node("div", "week-row");
        for (const day of week) {
          row.append(dayCell(day.start, day.day));
        }
        body.append(row);
      }
      grid.append(head, body);
    } else {
      for (const cell of panel.cells) {
        grid.append(dayCell(cell.start, cell.label));
      }
    }

    calendar.append(header, grid);
    return calendar;
  }

  // 已经画出来的是哪几页
  let painted = "";

  function paintPanels() {
    const panels = picker.panels;
    const signature = panels
      .map((panel) => `${panel.index}:${panel.startValue}:${panel.weeks.length}`)
      .join("|");
    // 换了页或钻了层才重画；同页内移动焦点时格子原样留着
    if (signature === painted) {
      return;
    }
    painted = signature;
    const weekDays = picker.weekDays;
    // 快捷选项列写在模板里、排在日历前面，重画只换日历那几张
    for (const old of content.querySelectorAll(':scope > [data-xh-part="calendar"]')) {
      old.remove();
    }
    content.append(
      ...panels.map((panel, index) => panelOf(panel, index === panels.length - 1, weekDays)),
    );
  }

  // 段位是空节点：显示什么由组件按当前值填。「/」与「周」是普通节点，写在段位旁边
  function paintSegments(group, segments) {
    const out = [];
    segments.forEach((segment, index) => {
      if (index > 0) {
        out.push(node("span", undefined, "/"));
      }
      out.push(node("span", "segment"));
      if (segment.type === "week") {
        out.push(node("span", undefined, "周"));
      }
    });
    group.replaceChildren(...out);
  }

  // 元素一连上就能读 panels / fieldSegments，接线排在这之后，节点赶得上
  document.getElementById("date-range-picker-two-panels-mount").append(fragment);
  paintSegments(groups[0], picker.fieldSegments);
  paintSegments(groups[1], picker.fieldEndSegments);
  paintPanels();

  picker.addEventListener("focused-value-change", paintPanels);
  picker.addEventListener("active-view-change", paintPanels);
</script>
```

### 快捷选项

常用区间一键写入两端

```vue
<script setup lang="ts">
import { dateRangePickerPresetMonth, dateRangePickerPresetRange, dateRangePickerPresetYear } from "@xihan-ui/headless";
import {
  XhDateRangePickerCalendar,
  XhDateRangePickerCell,
  XhDateRangePickerCellTrigger,
  XhDateRangePickerClearTrigger,
  XhDateRangePickerContent,
  XhDateRangePickerControl,
  XhDateRangePickerGrid,
  XhDateRangePickerGridBody,
  XhDateRangePickerGridHead,
  XhDateRangePickerHeader,
  XhDateRangePickerHeading,
  XhDateRangePickerLabel,
  XhDateRangePickerNextTrigger,
  XhDateRangePickerPositioner,
  XhDateRangePickerPresetGroup,
  XhDateRangePickerPrevTrigger,
  XhDateRangePickerRangeSeparator,
  XhDateRangePickerRoot,
  XhDateRangePickerSegment,
  XhDateRangePickerSegmentGroup,
  XhDateRangePickerTrigger,
  XhDateRangePickerWeekDay,
  XhDateRangePickerWeekRow,
} from "@xihan-ui/vue";
import { computed } from "vue";

// 日子在自己的 computed 里算好再传：库不在渲染期算「今天」
const presets = computed(() => [
  { label: "近 7 天", value: dateRangePickerPresetRange(-6, 0) },
  { label: "近 30 天", value: dateRangePickerPresetRange(-29, 0) },
  { label: "本月", value: dateRangePickerPresetMonth(0) },
  { label: "上月", value: dateRangePickerPresetMonth(-1) },
  { label: "今年", value: dateRangePickerPresetYear(0) },
]);
</script>

<template>
  <XhDateRangePickerRoot
    v-slot="{ weeks, weekDays }"
    :presets="presets"
    locale="zh-CN"
  >
    <XhDateRangePickerLabel>统计区间</XhDateRangePickerLabel>
    <XhDateRangePickerControl>
      <!-- 组号定这组段位认领哪一端：0 起点、1 终点 -->
      <XhDateRangePickerSegmentGroup :index="0">
        <XhDateRangePickerSegment :index="0" />
        <span>/</span>
        <XhDateRangePickerSegment :index="1" />
        <span>/</span>
        <XhDateRangePickerSegment :index="2" />
      </XhDateRangePickerSegmentGroup>
      <XhDateRangePickerRangeSeparator />
      <XhDateRangePickerSegmentGroup :index="1">
        <XhDateRangePickerSegment :index="0" />
        <span>/</span>
        <XhDateRangePickerSegment :index="1" />
        <span>/</span>
        <XhDateRangePickerSegment :index="2" />
      </XhDateRangePickerSegmentGroup>
      <XhDateRangePickerClearTrigger />
      <XhDateRangePickerTrigger />
    </XhDateRangePickerControl>
    <XhDateRangePickerPositioner>
      <XhDateRangePickerContent>
        <!-- 不写默认插槽就按 presets 数据自动铺，产出的 DOM 与手写部件一致 -->
        <XhDateRangePickerPresetGroup />
        <XhDateRangePickerCalendar>
          <XhDateRangePickerHeader>
            <XhDateRangePickerPrevTrigger aria-label="上个月" />
            <XhDateRangePickerHeading />
            <XhDateRangePickerNextTrigger aria-label="下个月" />
          </XhDateRangePickerHeader>
          <XhDateRangePickerGrid>
            <XhDateRangePickerGridHead>
              <XhDateRangePickerWeekRow>
                <XhDateRangePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
              </XhDateRangePickerWeekRow>
            </XhDateRangePickerGridHead>
            <XhDateRangePickerGridBody>
              <XhDateRangePickerWeekRow v-for="week in weeks" :key="week[0].start">
                <XhDateRangePickerCell v-for="day in week" :key="day.start" :value="day.start">
                  <XhDateRangePickerCellTrigger>{{ day.day }}</XhDateRangePickerCellTrigger>
                </XhDateRangePickerCell>
              </XhDateRangePickerWeekRow>
            </XhDateRangePickerGridBody>
          </XhDateRangePickerGrid>
        </XhDateRangePickerCalendar>
      </XhDateRangePickerContent>
    </XhDateRangePickerPositioner>
  </XhDateRangePickerRoot>
</template>
```

```html
<div id="date-range-picker-shortcuts-mount"></div>

<template id="date-range-picker-shortcuts-template">
  <xh-date-range-picker locale="zh-CN">
    <div data-xh-part="root">
      <span data-xh-part="label">统计区间</span>
      <div data-xh-part="control">
        <!-- 文档序在前的这组认领起点，在后的认领终点；里面铺几段由 granularity 推 -->
        <div data-xh-part="segment-group"></div>
        <span data-xh-part="range-separator">-</span>
        <div data-xh-part="segment-group"></div>
        <button data-xh-part="clear-trigger"></button>
        <button data-xh-part="trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <!-- 快捷选项条目自报 value，与 presets 数据里的 value 逐字对上 -->
          <div data-xh-part="preset-group"></div>
        </div>
      </div>
    </div>
  </xh-date-range-picker>
</template>

<script type="module">
  const fragment = document.getElementById("date-range-picker-shortcuts-template").content.cloneNode(true);
  const picker = fragment.querySelector("xh-date-range-picker");
  const groups = picker.querySelectorAll('[data-xh-part="segment-group"]');
  const content = picker.querySelector('[data-xh-part="content"]');
  // 日子在自己这儿算好再传：库不在渲染期算「今天」。值用 ISO 8601 的区间写法把两端拼在一起
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const shift = (days) => new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + days));
  const monthStart = (offset) => new Date(Date.UTC(today.getFullYear(), today.getMonth() + offset, 1));
  const monthEnd = (offset) => new Date(Date.UTC(today.getFullYear(), today.getMonth() + offset + 1, 0));
  const presets = [
    { label: "近 7 天", value: `${iso(shift(-6))}/${iso(shift(0))}` },
    { label: "近 30 天", value: `${iso(shift(-29))}/${iso(shift(0))}` },
    { label: "本月", value: `${iso(monthStart(0))}/${iso(monthEnd(0))}` },
    { label: "上月", value: `${iso(monthStart(-1))}/${iso(monthEnd(-1))}` },
    { label: "今年", value: `${today.getFullYear()}-01-01/${today.getFullYear()}-12-31` },
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

  function node(tag, part, text) {
    const el = document.createElement(tag);
    if (part) {
      el.dataset.xhPart = part;
    }
    if (text !== undefined) {
      el.textContent = text;
    }
    return el;
  }

  function pageTrigger(part, label) {
    const el = node("button", part);
    el.setAttribute("aria-label", label);
    return el;
  }

  function dayCell(value, text) {
    const cell = node("div", "cell");
    cell.setAttribute("value", value);
    cell.append(node("div", "cell-trigger", text));
    return cell;
  }

  // 一页一张日历：面板号写在标题与网格上，格子跟着所在网格走
  function panelOf(panel, last, weekDays) {
    const calendar = node("div", "calendar");
    const header = node("div", "header");
    // 往前只在最左那张、往后只在最右那张：翻页整窗一起走
    if (panel.index === 0) {
      header.append(pageTrigger("prev-trigger", "上一页"));
    }
    const heading = node("div", "heading", panel.headingLabel);
    heading.setAttribute("index", panel.index);
    header.append(heading);
    if (last) {
      header.append(pageTrigger("next-trigger", "下一页"));
    }

    const grid = node("div", "grid");
    grid.setAttribute("index", panel.index);
    // 日视图铺周行，粗粒度视图把格子直接铺进网格
    if (panel.weeks.length > 0) {
      const head = node("div", "grid-head");
      const headRow = node("div", "week-row");
      for (const day of weekDays) {
        const column = node("span", "week-day", day.label);
        column.setAttribute("value", day.value);
        headRow.append(column);
      }
      head.append(headRow);

      const body = node("div", "grid-body");
      for (const week of panel.weeks) {
        const row = node("div", "week-row");
        for (const day of week) {
          row.append(dayCell(day.start, day.day));
        }
        body.append(row);
      }
      grid.append(head, body);
    } else {
      for (const cell of panel.cells) {
        grid.append(dayCell(cell.start, cell.label));
      }
    }

    calendar.append(header, grid);
    return calendar;
  }

  // 已经画出来的是哪几页
  let painted = "";

  function paintPanels() {
    const panels = picker.panels;
    const signature = panels
      .map((panel) => `${panel.index}:${panel.startValue}:${panel.weeks.length}`)
      .join("|");
    // 换了页或钻了层才重画；同页内移动焦点时格子原样留着
    if (signature === painted) {
      return;
    }
    painted = signature;
    const weekDays = picker.weekDays;
    // 快捷选项列写在模板里、排在日历前面，重画只换日历那几张
    for (const old of content.querySelectorAll(':scope > [data-xh-part="calendar"]')) {
      old.remove();
    }
    content.append(
      ...panels.map((panel, index) => panelOf(panel, index === panels.length - 1, weekDays)),
    );
  }

  // 段位是空节点：显示什么由组件按当前值填。「/」与「周」是普通节点，写在段位旁边
  function paintSegments(group, segments) {
    const out = [];
    segments.forEach((segment, index) => {
      if (index > 0) {
        out.push(node("span", undefined, "/"));
      }
      out.push(node("span", "segment"));
      if (segment.type === "week") {
        out.push(node("span", undefined, "周"));
      }
    });
    group.replaceChildren(...out);
  }

  // 元素一连上就能读 panels / fieldSegments，接线排在这之后，节点赶得上
  document.getElementById("date-range-picker-shortcuts-mount").append(fragment);
  paintSegments(groups[0], picker.fieldSegments);
  paintSegments(groups[1], picker.fieldEndSegments);
  paintPanels();

  picker.addEventListener("focused-value-change", paintPanels);
  picker.addEventListener("active-view-change", paintPanels);
</script>
```

### 不可用日期

周末不可选，区间允许跨过不可用的日期

```vue
<script setup lang="ts">
import {
  XhDateRangePickerCalendar,
  XhDateRangePickerCell,
  XhDateRangePickerCellTrigger,
  XhDateRangePickerClearTrigger,
  XhDateRangePickerContent,
  XhDateRangePickerControl,
  XhDateRangePickerGrid,
  XhDateRangePickerGridBody,
  XhDateRangePickerGridHead,
  XhDateRangePickerHeader,
  XhDateRangePickerHeading,
  XhDateRangePickerLabel,
  XhDateRangePickerNextTrigger,
  XhDateRangePickerPositioner,
  XhDateRangePickerPrevTrigger,
  XhDateRangePickerRangeSeparator,
  XhDateRangePickerRoot,
  XhDateRangePickerSegment,
  XhDateRangePickerSegmentGroup,
  XhDateRangePickerTrigger,
  XhDateRangePickerWeekDay,
  XhDateRangePickerWeekRow,
} from "@xihan-ui/vue";

// 周六、周日不可选；起点参数用不上，区间能不能跨过不可用日由 allowsNonContiguousRanges 决定
function isWeekend(value: string): boolean {
  const day = new Date(`${value}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}
</script>

<template>
  <XhDateRangePickerRoot
    v-slot="{ weeks, weekDays }"
    :is-date-unavailable="isWeekend"
    allows-non-contiguous-ranges
    locale="zh-CN"
  >
    <XhDateRangePickerLabel>工作日区间</XhDateRangePickerLabel>
    <XhDateRangePickerControl>
      <!-- 组号定这组段位认领哪一端：0 起点、1 终点 -->
      <XhDateRangePickerSegmentGroup :index="0">
        <XhDateRangePickerSegment :index="0" />
        <span>/</span>
        <XhDateRangePickerSegment :index="1" />
        <span>/</span>
        <XhDateRangePickerSegment :index="2" />
      </XhDateRangePickerSegmentGroup>
      <XhDateRangePickerRangeSeparator />
      <XhDateRangePickerSegmentGroup :index="1">
        <XhDateRangePickerSegment :index="0" />
        <span>/</span>
        <XhDateRangePickerSegment :index="1" />
        <span>/</span>
        <XhDateRangePickerSegment :index="2" />
      </XhDateRangePickerSegmentGroup>
      <XhDateRangePickerClearTrigger />
      <XhDateRangePickerTrigger />
    </XhDateRangePickerControl>
    <XhDateRangePickerPositioner>
      <XhDateRangePickerContent>
        <XhDateRangePickerCalendar>
          <XhDateRangePickerHeader>
            <XhDateRangePickerPrevTrigger aria-label="上个月" />
            <XhDateRangePickerHeading />
            <XhDateRangePickerNextTrigger aria-label="下个月" />
          </XhDateRangePickerHeader>
          <XhDateRangePickerGrid>
            <XhDateRangePickerGridHead>
              <XhDateRangePickerWeekRow>
                <XhDateRangePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
              </XhDateRangePickerWeekRow>
            </XhDateRangePickerGridHead>
            <XhDateRangePickerGridBody>
              <XhDateRangePickerWeekRow v-for="week in weeks" :key="week[0].start">
                <XhDateRangePickerCell v-for="day in week" :key="day.start" :value="day.start">
                  <XhDateRangePickerCellTrigger>{{ day.day }}</XhDateRangePickerCellTrigger>
                </XhDateRangePickerCell>
              </XhDateRangePickerWeekRow>
            </XhDateRangePickerGridBody>
          </XhDateRangePickerGrid>
        </XhDateRangePickerCalendar>
      </XhDateRangePickerContent>
    </XhDateRangePickerPositioner>
  </XhDateRangePickerRoot>
</template>
```

```html
<div id="date-range-picker-unavailable-mount"></div>

<template id="date-range-picker-unavailable-template">
  <xh-date-range-picker locale="zh-CN" allows-non-contiguous-ranges>
    <div data-xh-part="root">
      <span data-xh-part="label">工作日区间</span>
      <div data-xh-part="control">
        <!-- 文档序在前的这组认领起点，在后的认领终点；里面铺几段由 granularity 推 -->
        <div data-xh-part="segment-group"></div>
        <span data-xh-part="range-separator">-</span>
        <div data-xh-part="segment-group"></div>
        <button data-xh-part="clear-trigger"></button>
        <button data-xh-part="trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
        </div>
      </div>
    </div>
  </xh-date-range-picker>
</template>

<script type="module">
  const fragment = document.getElementById("date-range-picker-unavailable-template").content.cloneNode(true);
  const picker = fragment.querySelector("xh-date-range-picker");
  const groups = picker.querySelectorAll('[data-xh-part="segment-group"]');
  const content = picker.querySelector('[data-xh-part="content"]');
  // 判定函数只走 property：周六、周日不可选；区间能不能跨过不可用日由 allows-non-contiguous-ranges 决定
  picker.isDateUnavailable = (value) => {
    const day = new Date(`${value}T00:00:00Z`).getUTCDay();
    return day === 0 || day === 6;
  };

  function node(tag, part, text) {
    const el = document.createElement(tag);
    if (part) {
      el.dataset.xhPart = part;
    }
    if (text !== undefined) {
      el.textContent = text;
    }
    return el;
  }

  function pageTrigger(part, label) {
    const el = node("button", part);
    el.setAttribute("aria-label", label);
    return el;
  }

  function dayCell(value, text) {
    const cell = node("div", "cell");
    cell.setAttribute("value", value);
    cell.append(node("div", "cell-trigger", text));
    return cell;
  }

  // 一页一张日历：面板号写在标题与网格上，格子跟着所在网格走
  function panelOf(panel, last, weekDays) {
    const calendar = node("div", "calendar");
    const header = node("div", "header");
    // 往前只在最左那张、往后只在最右那张：翻页整窗一起走
    if (panel.index === 0) {
      header.append(pageTrigger("prev-trigger", "上一页"));
    }
    const heading = node("div", "heading", panel.headingLabel);
    heading.setAttribute("index", panel.index);
    header.append(heading);
    if (last) {
      header.append(pageTrigger("next-trigger", "下一页"));
    }

    const grid = node("div", "grid");
    grid.setAttribute("index", panel.index);
    // 日视图铺周行，粗粒度视图把格子直接铺进网格
    if (panel.weeks.length > 0) {
      const head = node("div", "grid-head");
      const headRow = node("div", "week-row");
      for (const day of weekDays) {
        const column = node("span", "week-day", day.label);
        column.setAttribute("value", day.value);
        headRow.append(column);
      }
      head.append(headRow);

      const body = node("div", "grid-body");
      for (const week of panel.weeks) {
        const row = node("div", "week-row");
        for (const day of week) {
          row.append(dayCell(day.start, day.day));
        }
        body.append(row);
      }
      grid.append(head, body);
    } else {
      for (const cell of panel.cells) {
        grid.append(dayCell(cell.start, cell.label));
      }
    }

    calendar.append(header, grid);
    return calendar;
  }

  // 已经画出来的是哪几页
  let painted = "";

  function paintPanels() {
    const panels = picker.panels;
    const signature = panels
      .map((panel) => `${panel.index}:${panel.startValue}:${panel.weeks.length}`)
      .join("|");
    // 换了页或钻了层才重画；同页内移动焦点时格子原样留着
    if (signature === painted) {
      return;
    }
    painted = signature;
    const weekDays = picker.weekDays;
    // 快捷选项列写在模板里、排在日历前面，重画只换日历那几张
    for (const old of content.querySelectorAll(':scope > [data-xh-part="calendar"]')) {
      old.remove();
    }
    content.append(
      ...panels.map((panel, index) => panelOf(panel, index === panels.length - 1, weekDays)),
    );
  }

  // 段位是空节点：显示什么由组件按当前值填。「/」与「周」是普通节点，写在段位旁边
  function paintSegments(group, segments) {
    const out = [];
    segments.forEach((segment, index) => {
      if (index > 0) {
        out.push(node("span", undefined, "/"));
      }
      out.push(node("span", "segment"));
      if (segment.type === "week") {
        out.push(node("span", undefined, "周"));
      }
    });
    group.replaceChildren(...out);
  }

  // 元素一连上就能读 panels / fieldSegments，接线排在这之后，节点赶得上
  document.getElementById("date-range-picker-unavailable-mount").append(fragment);
  paintSegments(groups[0], picker.fieldSegments);
  paintSegments(groups[1], picker.fieldEndSegments);
  paintPanels();

  picker.addEventListener("focused-value-change", paintPanels);
  picker.addEventListener("active-view-change", paintPanels);
</script>
```

### 周期区间

granularity 决定两组输入行铺设哪几段、浮层铺设哪一档格子

```vue
<script setup lang="ts">
import type { CalendarGranularity } from "@xihan-ui/headless";
import {
  XhDateRangePickerCalendar,
  XhDateRangePickerCell,
  XhDateRangePickerCellTrigger,
  XhDateRangePickerClearTrigger,
  XhDateRangePickerContent,
  XhDateRangePickerControl,
  XhDateRangePickerGrid,
  XhDateRangePickerGridBody,
  XhDateRangePickerGridHead,
  XhDateRangePickerHeader,
  XhDateRangePickerHeading,
  XhDateRangePickerLabel,
  XhDateRangePickerNextTrigger,
  XhDateRangePickerPositioner,
  XhDateRangePickerPrevTrigger,
  XhDateRangePickerRangeSeparator,
  XhDateRangePickerRoot,
  XhDateRangePickerSegment,
  XhDateRangePickerSegmentGroup,
  XhDateRangePickerTrigger,
  XhDateRangePickerWeekDay,
  XhDateRangePickerWeekRow,
} from "@xihan-ui/vue";

const kinds: { key: string; label: string; granularity: CalendarGranularity }[] = [
  { key: "week", label: "周报区间", granularity: "week" },
  { key: "month", label: "月报区间", granularity: "month" },
  { key: "quarter", label: "季报区间", granularity: "quarter" },
  { key: "year", label: "年报区间", granularity: "year" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-5)">
    <XhDateRangePickerRoot
      v-for="k in kinds"
      :key="k.key"
      v-slot="{ panels, weekDays, segments, endSegments }"
      :granularity="k.granularity"
      locale="zh-CN"
    >
      <XhDateRangePickerLabel>{{ k.label }}</XhDateRangePickerLabel>
      <XhDateRangePickerControl>
        <!-- 组号定这组段位认领哪一端：0 起点、1 终点 -->
        <template v-for="end in 2" :key="end">
          <XhDateRangePickerRangeSeparator v-if="end === 2" />
          <XhDateRangePickerSegmentGroup :index="end - 1">
            <!-- 铺哪几块由 granularity 推；分隔符是普通节点，作者写在段位旁边 -->
            <template v-for="(seg, i) in end === 1 ? segments : endSegments" :key="seg.type">
              <span v-if="i > 0">/</span>
              <XhDateRangePickerSegment :index="i" />
              <span v-if="seg.type === 'week'">周</span>
            </template>
          </XhDateRangePickerSegmentGroup>
        </template>
        <XhDateRangePickerClearTrigger />
        <XhDateRangePickerTrigger />
      </XhDateRangePickerControl>
      <XhDateRangePickerPositioner>
        <XhDateRangePickerContent>
          <!-- 面板号写在日历上，面板内的标题、网格与格子跟着它走 -->
          <XhDateRangePickerCalendar v-for="panel in panels" :key="panel.index" :index="panel.index">
            <XhDateRangePickerHeader>
              <!-- 往前只在最左那张、往后只在最右那张：整窗一起走 -->
              <XhDateRangePickerPrevTrigger v-if="panel.index === 0" aria-label="上一页" />
              <XhDateRangePickerHeading />
              <XhDateRangePickerNextTrigger v-if="panel.index === panels.length - 1" aria-label="下一页" />
            </XhDateRangePickerHeader>
            <XhDateRangePickerGrid>
              <template v-if="panel.weeks.length > 0">
                <XhDateRangePickerGridHead>
                  <XhDateRangePickerWeekRow>
                    <XhDateRangePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
                  </XhDateRangePickerWeekRow>
                </XhDateRangePickerGridHead>
                <XhDateRangePickerGridBody>
                  <XhDateRangePickerWeekRow v-for="week in panel.weeks" :key="week[0].start">
                    <XhDateRangePickerCell v-for="day in week" :key="day.start" :value="day.start">
                      <XhDateRangePickerCellTrigger>{{ day.day }}</XhDateRangePickerCellTrigger>
                    </XhDateRangePickerCell>
                  </XhDateRangePickerWeekRow>
                </XhDateRangePickerGridBody>
              </template>
              <XhDateRangePickerCell v-for="cell in panel.cells" v-else :key="cell.start" :value="cell.start">
                <XhDateRangePickerCellTrigger>{{ cell.label }}</XhDateRangePickerCellTrigger>
              </XhDateRangePickerCell>
            </XhDateRangePickerGrid>
          </XhDateRangePickerCalendar>
        </XhDateRangePickerContent>
      </XhDateRangePickerPositioner>
    </XhDateRangePickerRoot>
  </div>
</template>
```

```html
<div
  id="date-range-picker-granularity-mount"
  style="display: flex; flex-direction: column; gap: var(--xh-space-5)"
></div>

<template id="date-range-picker-granularity-template">
  <xh-date-range-picker locale="zh-CN">
    <div data-xh-part="root">
      <span data-xh-part="label"></span>
      <div data-xh-part="control">
        <!-- 文档序在前的这组认领起点，在后的认领终点；里面铺几段由 granularity 推 -->
        <div data-xh-part="segment-group"></div>
        <span data-xh-part="range-separator">-</span>
        <div data-xh-part="segment-group"></div>
        <button data-xh-part="clear-trigger"></button>
        <button data-xh-part="trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content"></div>
      </div>
    </div>
  </xh-date-range-picker>
</template>

<script type="module">
  const kinds = [
    { label: "周报区间", granularity: "week" },
    { label: "月报区间", granularity: "month" },
    { label: "季报区间", granularity: "quarter" },
    { label: "年报区间", granularity: "year" },
  ];

  const mount = document.getElementById("date-range-picker-granularity-mount");
  const template = document.getElementById("date-range-picker-granularity-template");

  function node(tag, part, text) {
    const el = document.createElement(tag);
    if (part) {
      el.dataset.xhPart = part;
    }
    if (text !== undefined) {
      el.textContent = text;
    }
    return el;
  }

  function pageTrigger(part, label) {
    const el = node("button", part);
    el.setAttribute("aria-label", label);
    return el;
  }

  function dayCell(value, text) {
    const cell = node("div", "cell");
    cell.setAttribute("value", value);
    cell.append(node("div", "cell-trigger", text));
    return cell;
  }

  // 一页一张日历：面板号写在标题与网格上，格子跟着所在网格走
  function panelOf(panel, last, weekDays) {
    const calendar = node("div", "calendar");
    const header = node("div", "header");
    // 往前只在最左那张、往后只在最右那张：翻页整窗一起走
    if (panel.index === 0) {
      header.append(pageTrigger("prev-trigger", "上一页"));
    }
    const heading = node("div", "heading", panel.headingLabel);
    heading.setAttribute("index", panel.index);
    header.append(heading);
    if (last) {
      header.append(pageTrigger("next-trigger", "下一页"));
    }

    const grid = node("div", "grid");
    grid.setAttribute("index", panel.index);
    // 日视图铺周行，粗粒度视图把格子直接铺进网格
    if (panel.weeks.length > 0) {
      const head = node("div", "grid-head");
      const headRow = node("div", "week-row");
      for (const day of weekDays) {
        const column = node("span", "week-day", day.label);
        column.setAttribute("value", day.value);
        headRow.append(column);
      }
      head.append(headRow);

      const body = node("div", "grid-body");
      for (const week of panel.weeks) {
        const row = node("div", "week-row");
        for (const day of week) {
          row.append(dayCell(day.start, day.day));
        }
        body.append(row);
      }
      grid.append(head, body);
    } else {
      for (const cell of panel.cells) {
        grid.append(dayCell(cell.start, cell.label));
      }
    }

    calendar.append(header, grid);
    return calendar;
  }

  for (const kind of kinds) {
    const fragment = template.content.cloneNode(true);
    const picker = fragment.querySelector("xh-date-range-picker");
    picker.setAttribute("granularity", kind.granularity);
    picker.querySelector('[data-xh-part="label"]').textContent = kind.label;

    const groups = picker.querySelectorAll('[data-xh-part="segment-group"]');
    const content = picker.querySelector('[data-xh-part="content"]');

    // 已经画出来的是哪几页
    let painted = "";

    function paintPanels() {
      const panels = picker.panels;
      const signature = panels
        .map((panel) => `${panel.index}:${panel.startValue}:${panel.weeks.length}`)
        .join("|");
      // 换了页或钻了层才重画；同页内移动焦点时格子原样留着
      if (signature === painted) {
        return;
      }
      painted = signature;
      const weekDays = picker.weekDays;
      content.replaceChildren(
        ...panels.map((panel, index) => panelOf(panel, index === panels.length - 1, weekDays)),
      );
    }

    // 段位是空节点：显示什么由组件按当前值填。「/」与「周」是普通节点，写在段位旁边
    function paintSegments(group, segments) {
      const out = [];
      segments.forEach((segment, index) => {
        if (index > 0) {
          out.push(node("span", undefined, "/"));
        }
        out.push(node("span", "segment"));
        if (segment.type === "week") {
          out.push(node("span", undefined, "周"));
        }
      });
      group.replaceChildren(...out);
    }

    // 元素一连上就能读 panels / fieldSegments，接线排在这之后，节点赶得上
    mount.append(fragment);
    paintSegments(groups[0], picker.fieldSegments);
    paintSegments(groups[1], picker.fieldEndSegments);
    paintPanels();

    picker.addEventListener("focused-value-change", paintPanels);
    picker.addEventListener("active-view-change", paintPanels);
  }
</script>
```

## 设计指引

### 何时使用

- 用户需要选择一段起止日期：报表区间、入住与退房、有效期。
- 需要先查看月份分布再确定起止，或直接键入两端。

### 何时不用

- 只选一天或几个不连续的日期时，使用[日期选择器](./date-picker)。
- 不需要输入行、只在页面上放一张日历选择区间时，使用[日历范围选择器](./calendar-range-picker)。
- 只需要时间段时，使用[时间范围选择器](./time-range-picker)。

### 特性

- 值始终为区间两端 `[start, end]`，按位存放：只填了终点时是 `['', 终点]`，受控回写按同一下标对应。
- 起止各一组段位，`range-separator` 隔在中间；方向键换段不跨组，`name` 与 `endName` 各自决定两份隐藏输入参不参与提交。
- 浮层内是[日历范围选择器](./calendar-range-picker)：先选起点再选终点，两端都落定后才写值并收起浮层；支持按住拖选与拖动已选区间的一端。
- `granularity` 支持 day / week / month / quarter / year，输入段、网格和周期边界一起切换。
- `min`、`max`、`isDateUnavailable`（第二个参数是当前起点）与 `allowsNonContiguousRanges` 一并转给日历。
- `presets` 提供“近 7 天”“本月”等整段快捷项，值使用 ISO 8601 的区间写法拼接两端。
- 终点早于起点、任一端越界或不可用时整个字段标为不合法，也可以用 `invalid` 显式声明。
- 输入值、展开状态和聚焦日期均可受控；点击输入行可以继续逐段键入，点击日历图标则把焦点送入日历。

### 组合

- 浮层内嵌[日历范围选择器](./calendar-range-picker)，翻月、层级切换、拖选与键盘导航由它负责。
- 输入行内嵌两组[日期字段](./date-field)的段位，逐段键入与加减由它负责。

### 最佳实践

- 使用明确的字段标签，两组段位各自报告“开始日期”“结束日期”。
- 起止段组之间必须渲染 `range-separator`，不依赖空白区分两端。
- 起止常跨月时显式传 `visibleCount="2"`，并排查看两页。
- 需要统一查询值时，读取 `api.periodValue` 得到周期首尾与回显键。
- 常用区间优先提供快捷项，日期在 computed / memo 中计算后再传入。

### 反模式

- 用两个日期选择器拼接一个区间：两端之间没有轨道、没有拖选，也不校验先后顺序。
- 未经说明就预先选好一段。
- 让浮层遮挡当前输入值。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-date-range-picker>` |
| Vue 组件 | `XhDateRangePickerCalendar` `XhDateRangePickerCell` `XhDateRangePickerCellTrigger` `XhDateRangePickerClearTrigger` `XhDateRangePickerContent` `XhDateRangePickerControl` `XhDateRangePickerGrid` `XhDateRangePickerGridBody` `XhDateRangePickerGridHead` `XhDateRangePickerHeader` `XhDateRangePickerHeading` `XhDateRangePickerHeadingMonthTrigger` `XhDateRangePickerHeadingYearTrigger` `XhDateRangePickerHiddenInput` `XhDateRangePickerLabel` `XhDateRangePickerNextTrigger` `XhDateRangePickerNextYearTrigger` `XhDateRangePickerPositioner` `XhDateRangePickerPreset` `XhDateRangePickerPresetGroup` `XhDateRangePickerPrevTrigger` `XhDateRangePickerPrevYearTrigger` `XhDateRangePickerRangeSeparator` `XhDateRangePickerRoot` `XhDateRangePickerSegment` `XhDateRangePickerSegmentGroup` `XhDateRangePickerTrigger` `XhDateRangePickerWeekDay` `XhDateRangePickerWeekNumber` `XhDateRangePickerWeekRow` |
| 组合式函数 | `useDateRangePicker` |
| 状态机 | `dateRangePickerMachine` |
| 皮肤 | `@xihan-ui/styles/date-range-picker.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string[]` |  | 区间两端，ISO 串。提供即受控：读取直取 prop，写入只发 onValueChange 不落内部值。 按位存放，空缺的一端为空串。 |
| `defaultValue` | `string[]` |  |  |
| `open` | `boolean` |  | 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `min` | `string` |  | 可选范围下界（含当天），ISO 串。日历与分段输入共用这一条。 |
| `max` | `string` |  | 可选范围上界（含当天），ISO 串。 |
| `locale` | `string` |  | 决定周首日、月份文案与段位先后（zh-CN 年月日、en-US 月日年）。 未提供时按宿主语言，宿主也没有时按 en-US。 |
| `timeZone` | `string` |  | 判定今天与格式化文案使用的时区，默认取宿主本地时区。 |
| `isDateUnavailable` | `(value: string, anchor: string \| null) => boolean` |  | 不可用判定，接收 ISO 串。界外与判定为真的日期同等处理。 第二个参数是区间选到一半时的起点，其余时候为 null。 |
| `allowsNonContiguousRanges` | `boolean` |  | 区间允许跨过不可用的日期，默认关闭；关闭时落下起点之后只能选到两侧最近的不可用日为止。 |
| `disabled` | `boolean` |  | 整个控件禁用：trigger 为原生 disabled，段位退出 Tab 序列，日历格子全部为 aria-disabled。 |
| `readOnly` | `boolean` |  | 只读：浮层照常展开、日历照常翻月浏览，但选中值不可修改。 |
| `invalid` | `boolean` |  | 校验失败：段位报告 aria-invalid，各角色节点带 data-invalid。 未提供时也会自行判定：任一端越界，或终点早于起点。 |
| `required` | `boolean` |  | 必填标注，写入每一段的 aria-required。 |
| `name` | `string` |  | 起点隐藏输入的表单字段名；提供后才带 name，ISO 串随表单一并提交。 |
| `endName` | `string` |  | 终点隐藏输入的表单字段名；未提供时终点不参与提交。 |
| `granularity` | `CalendarGranularity` |  | 选择粒度。输入行与周期网格都由它决定。 |
| `activeView` | `CalendarView` |  | 面板当前所在的层级。提供即受控；未提供时跟随 granularity，每次展开都回到目标粒度。 点击标题中的年 / 月会修改它。 |
| `segments` | `DateSegmentSet` |  | 输入行铺设的段。未提供时按 granularity 推导：按周为「2026-33」、按月为「2026-05」、 按季度为「2026-Q2」、按年为「2026」，按天则按 locale 排列年月日。 |
| `presets` | `DateRangePickerPreset[]` |  | 快捷选项（「近 7 天」「本月」等）。提供后浮层中多出一列，点击即整份写入两端。 日期需计算后传入：连接层每帧求值，把 `today()` 放进渲染期会跨零点得出两个结果。 不是恰好两端、落在 min / max 之外或被 isDateUnavailable 判定不可用的选项自动不可按下。 |
| `visibleCount` | `number` |  | 展示的连续日历面板数；默认 1。起止常跨月，并排两页时显式提供 2。 |
| `fixedWeeks` | `boolean` |  | 日历恒渲染六行，默认开启。关闭后网格按当月实际周数收缩，翻页时浮层高度随之变化。 |
| `defaultFocusedValue` | `string` |  | 初始聚焦日，ISO 串；同时决定展开时先落在哪一页。 未提供时回退为起点，再回退为今天。表单重置回到该值。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入行的描边与底色使用方式。默认 outline。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，输入行与浮层中的日历格一并换档。 |
| `placement` | `Placement` |  |  |
| `dir` | `Direction` |  | 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `translations` | `Partial<DateRangePickerTranslations>` |  |  |
| `closeOnSelect` | `boolean` |  | 选完即收起，默认 true。两端都落定才视为选完。 |
| `onValueChange` | `(details: DateRangePickerValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 |
| `onOpenChange` | `(details: DateRangePickerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onFocusedValueChange` | `(details: DateRangePickerFocusChangeDetails) => void` |  | 聚焦日变化（方向键、翻月、展开、段位输入都会发出）。 网格由外部渲染，不监听该事件时日历不会换月。 |
| `onActiveViewChange` | `(details: CalendarViewChangeDetails) => void` |  | 面板所在层级变化（点击标题向上、点击格子向下都会发出）；受控时是唯一出口。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `DateRangePickerValueChangeDetails` | 区间两端变化；detail 为 `{ value: string[] }`，只填终点时为 `['', end]` |
| `open-change` | `DateRangePickerOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `focused-value-change` | `DateRangePickerFocusChangeDetails` | 聚焦日变化（展示月可能随之变化）；detail 为 `{ focusedValue: string }`，作者据此重绘网格 |
| `active-view-change` | `CalendarViewChangeDetails` | 切换到另一层级（点击标题向上、点击格子向下）；detail 为 `{ activeView: 'day'\|'week'\|'month'\|'quarter'\|'year' }`，作者据此重绘网格 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDateRangePickerPreset` | `default` | — | 条目内容；未写时使用数据中的 label。 |
| `XhDateRangePickerPresetGroup` | `default` | `DateRangePickerPresetsSlotProps` | 自行铺设条目；未写时按 presets 数据自动铺设，两者产出的 DOM 一致。 |
| `XhDateRangePickerRoot` | `default` | `DateRangePickerRootSlotProps` |  |
| `XhDateRangePickerSegment` | `default` | `DateRangePickerSegmentSlotProps` |  |

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
| `calendar` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `VALUE.CLEAR` · `FOCUSED.SET` · `VIEW.SET` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`isOpenControlled` · `closesOnSelect` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `value` | `string[]` | 区间两端，ISO 串；按位存放，空缺的一端为空串。 |
| `start` | `string \| null` | 起点；未填时为 null。 |
| `end` | `string \| null` | 终点；未填时为 null。 |
| `periodValue` | `CalendarPeriodValue \| null` | 两端都落定时的规范化周期值；缺少一端时为 null。 |
| `focusedValue` | `string` | 生效聚焦日（三路收口后的结果），恒非空。日历展示哪个月由它决定。 |
| `granularity` | `CalendarGranularity` | 作者选择的粒度。 |
| `activeView` | `CalendarView` | 面板当前所在的层级。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` | 校验失败：作者标记的、任一端越界，或终点早于起点。 |
| `canClear` | `boolean` | 清空按钮当前是否可按。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[]) => void` |  |
| `clear` | `() => void` |  |
| `setActiveView` | `(next: CalendarView) => void` | 直接切换到某一层级。 |
| `presets` | `readonly DateRangePickerPresetState[]` | 快捷选项逐条的状态，数据顺序。未提供 presets 时为空数组。 |
| `calendar` | `CalendarRangePickerApi<T>` | 内嵌日历：选区间、翻月、键盘导航都在它身上。 |
| `field` | `DateRangePickerFieldApi<T>` | 起点分段输入。 |
| `fieldEnd` | `DateRangePickerFieldApi<T>` | 终点分段输入。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getSegmentGroupProps` | `(props?: DateRangePickerSegmentGroupProps) => T['element']` | role=group 的分段容器，段位挂在其中。index 选择起止两组，不传即起点。 |
| `getRangeSeparatorProps` | `() => T['element']` | 起止输入之间的视觉分隔。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getPresetGroupProps` | `() => T['element']` | 快捷选项列（role=listbox）；未提供 presets 时带 hidden。 |
| `getPresetProps` | `(props: DateRangePickerPresetProps) => T['element']` | 一条快捷选项（role=option）：点击把整段区间写入两端。 |
| `getCalendarProps` | `() => T['element']` | 内嵌日历的挂载点，同时充当日历的根节点。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/#kbd_label)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger, closed | 展开日历浮层，焦点落到当前聚焦日那一格 |
| `Enter` / `Space` | focus in trigger, open | 收起浮层，焦点回到 trigger |
| `Escape` | open | 收起浮层并把焦点还给展开前那个控件（通常是 trigger），两端不变；区间挑到一半时先撤掉起点 |
| `Tab` / `Shift+Tab` | open | 不拦按键：焦点按 Tab 序列自然离开，浮层随即收起且不抢回焦点 |
| `Enter` / `Space` | open, focus in grid | 先落起点再落终点（由日历完成）；closeOnSelect 时两端都落定才收起浮层 |
| `ArrowUp` / `ArrowDown` / `Home` / `End` | open, focus in 快捷选项列 | 在快捷选项之间移动焦点，到头回绕；不写值 |
| `Enter` / `Space` | open, focus in 某条快捷选项 | 把这条快捷选项的两端整份写进去；closeOnSelect 时收起浮层 |
| `Alt+ArrowDown` | focus in 某一段, closed, not disabled | 展开浮层并把焦点移入；触发按钮是可选部件，键盘入口不能只挂在它上面 |
| `Enter` | focus in 某一段, open | 收起浮层。段位里敲出来的值不触发「选完即收」（那时人还在打字），这是那条路的收口手势 |
| `Enter` / `Space` | held on trigger（not disabled）、clear-trigger（可清）或 preset（open, not disabled/readOnly, 该条可按） | 按住期间该部件投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，浮层收起时一并撤下。日历里的部件由 calendar-range-picker 自己投影 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `segment-group` | `aria-disabled` | 'true' \| 'false' |
| `segment-group` | `aria-label` | label.endDate \| label.startDate |
| `segment-group` | `role` | 'group' |
| `range-separator` | `aria-hidden` | 'true' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `trigger` | `aria-labelledby` | `label` 部件的 id |
| `clear-trigger` | `aria-label` | label.clearTrigger |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-labelledby` | `label` 部件的 id |
| `content` | `aria-modal` | 'false' |
| `content` | `role` | 'dialog' |
| `preset-group` | `aria-disabled` | 'true' \| 'false' |
| `preset-group` | `aria-label` | label.presets |
| `preset-group` | `aria-multiselectable` | 'false' |
| `preset-group` | `aria-orientation` | 'vertical' |
| `preset-group` | `role` | 'listbox' |
| `preset` | `aria-disabled` | 'true' \| 'false' |
| `preset` | `aria-selected` | 'true' \| 'false' |
| `preset` | `role` | 'option' |

## 样式参考

### 皮肤

`@xihan-ui/styles/date-range-picker.css` 使用 `[data-scope="date-range-picker"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
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
| `segment-group` | `data-complete` | ''（条件成立时才出现） |
| `segment-group` | `data-disabled` | ''（条件成立时才出现） |
| `segment-group` | `data-empty` | ''（条件成立时才出现） |
| `segment-group` | `data-index` | String(index) |
| `segment-group` | `data-invalid` | ''（条件成立时才出现） |
| `segment-group` | `data-out-of-range` | ''（条件成立时才出现） |
| `segment-group` | `data-readonly` | ''（条件成立时才出现） |
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
| `preset` | `data-value` | v |
| `preset` | `data-xh-collection-context` | 'overlay' |
| `preset` | `data-xh-collection-item` | '' |
| `preset` | `data-xh-collection-size` | props.size |
| `calendar` | `data-disabled` | ''（条件成立时才出现） |
| `calendar` | `data-readonly` | ''（条件成立时才出现） |
| `calendar` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-date-range-picker-action-bg` | `clear-trigger`<br>`trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | date-range-picker 的 clear-trigger、trigger 部件 background-color 覆盖槽。 |
| `--xh-date-range-picker-action-bg-active` | `clear-trigger`<br>`trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | date-range-picker 的 clear-trigger、trigger 部件 background-color 覆盖槽。 |
| `--xh-date-range-picker-action-bg-hover` | `clear-trigger`<br>`trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=open` | `--xh-_action-variant-bg-hover` | date-range-picker 的 clear-trigger、trigger 部件 background-color 覆盖槽。 |
| `--xh-date-range-picker-action-fg` | `clear-trigger`<br>`trigger` | `color` | `default` | `--xh-fg-muted` | date-range-picker 的 clear-trigger、trigger 部件 color 覆盖槽。 |
| `--xh-date-range-picker-action-fg-hover` | `clear-trigger`<br>`trigger` | `color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=open` | `--xh-fg-default` | date-range-picker 的 clear-trigger、trigger 部件 color 覆盖槽。 |
| `--xh-date-range-picker-action-font-size` | `clear-trigger`<br>`trigger` | `font-size` | `default` | `--xh-text-secondary-size` | date-range-picker 的 clear-trigger、trigger 部件 font-size 覆盖槽。 |
| `--xh-date-range-picker-action-radius` | `clear-trigger`<br>`trigger` | `border-radius` | `default` | `--xh-shape-inset` | date-range-picker 的 clear-trigger、trigger 部件 border-radius 覆盖槽。 |
| `--xh-date-range-picker-action-size` | `clear-trigger`<br>`trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=field-inset` | `--xh-_action-profile-visual-size` | date-range-picker 的 clear-trigger、trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
| `--xh-date-range-picker-calendar-gap` | `calendar` | `gap` | `default` | `--xh-space-2` | date-range-picker 的 calendar 部件 gap 覆盖槽。 |
| `--xh-date-range-picker-column-divider` | `preset-group` | `border-block-end`<br>`border-inline-end` | `@media (min-width: 768px)`<br>`default` | `--xh-material-frosted-separator` | date-range-picker 的 preset-group 部件 border-block-end、border-inline-end 覆盖槽。 |
| `--xh-date-range-picker-content-bg` | `content` | `background` | `default` | `--xh-bg-surface` | date-range-picker 的 content 部件 background 覆盖槽。 |
| `--xh-date-range-picker-content-border` | `content` | `border` | `default` | `--xh-border-default` | date-range-picker 的 content 部件 border 覆盖槽。 |
| `--xh-date-range-picker-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | date-range-picker 的 content 部件 color 覆盖槽。 |
| `--xh-date-range-picker-content-px` | `content` | `padding-inline` | `default` | `--xh-space-2` | date-range-picker 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-date-range-picker-content-py` | `content` | `padding-block` | `default` | `--xh-space-2` | date-range-picker 的 content 部件 padding-block 覆盖槽。 |
| `--xh-date-range-picker-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | date-range-picker 的 content 部件 border-radius 覆盖槽。 |
| `--xh-date-range-picker-content-shadow` | `content` | `box-shadow` | `default` | `--xh-elevation-floating` | date-range-picker 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-date-range-picker-control-bg` | `control` | `background-color` | `xh-field-chrome` | `--xh-_field-variant-bg-rest` | date-range-picker 的 control 部件 background-color 覆盖槽。 |
| `--xh-date-range-picker-control-bg-disabled` | `control` | `background-color` | `disabled`<br>`xh-field-chrome` | `--xh-_field-variant-bg-disabled` | date-range-picker 的 control 部件 background-color 覆盖槽。 |
| `--xh-date-range-picker-control-bg-hover` | `control` | `background-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-hover` | date-range-picker 的 control 部件 background-color 覆盖槽。 |
| `--xh-date-range-picker-control-bg-readonly` | `control` | `background-color` | `readonly`<br>`xh-field-chrome` | `--xh-_field-variant-bg-read-only` | date-range-picker 的 control 部件 background-color 覆盖槽。 |
| `--xh-date-range-picker-control-border` | `control` | `border` | `xh-field-chrome` | `--xh-_field-variant-border-rest` | date-range-picker 的 control 部件 border 覆盖槽。 |
| `--xh-date-range-picker-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])`<br>`xh-field-chrome` | `--xh-_field-variant-border-focus` | date-range-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-date-range-picker-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`loading`<br>`not([data-disabled])`<br>`not([data-invalid])`<br>`not([data-loading])`<br>`not([data-readonly])`<br>`readonly`<br>`xh-field-chrome` | `--xh-_field-variant-border-hover` | date-range-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-date-range-picker-control-border-invalid` | `control` | `border-color` | `invalid`<br>`xh-field-chrome` | `--xh-_field-variant-border-invalid` | date-range-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-date-range-picker-control-fg` | `control` | `color` | `xh-field-chrome` | `--xh-fg-default` | date-range-picker 的 control 部件 color 覆盖槽。 |
| `--xh-date-range-picker-control-gap` | `control`<br>`range-separator` | `gap`<br>`margin-inline` | `default`<br>`xh-field-chrome` | `--xh-_date-range-picker-gap` | date-range-picker 的 control、range-separator 部件 gap、margin-inline 覆盖槽。 |
| `--xh-date-range-picker-control-h` | `control` | `block-size`<br>`min-block-size` | `has([data-xh-field-input][data-xh-field-layout='multi-tag'])`<br>`has([data-xh-field-input][data-xh-field-layout='single-line'])`<br>`has([data-xh-field-input][data-xh-field-layout='textarea'])`<br>`xh-field-chrome`<br>`xh-field-input`<br>`xh-field-layout=multi-tag`<br>`xh-field-layout=single-line`<br>`xh-field-layout=textarea` | `--xh-_date-range-picker-control-h` | date-range-picker 的 control 部件 block-size、min-block-size 覆盖槽。 |
| `--xh-date-range-picker-control-min-w` | `control`<br>`root` | `min-inline-size` | `default`<br>`xh-field-chrome` | `--xh-control-min-w` | date-range-picker 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-date-range-picker-control-px` | `control` | `padding-inline` | `xh-field-chrome` | `--xh-_date-range-picker-control-px` | date-range-picker 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-date-range-picker-control-radius` | `control` | `border-radius` | `xh-field-chrome` | `--xh-shape-control` | date-range-picker 的 control 部件 border-radius 覆盖槽。 |
| `--xh-date-range-picker-control-shadow` | `control` | `box-shadow` | `xh-field-chrome` | `none` | date-range-picker 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-date-range-picker-control-w` | `root` | `inline-size` | `default` | `max-content` | date-range-picker 的 root 部件 inline-size 覆盖槽。 |
| `--xh-date-range-picker-font-size` | `segment-group` | `font-size` | `default` | `--xh-_date-range-picker-font-size` | date-range-picker 的 segment-group 部件 font-size 覆盖槽。 |
| `--xh-date-range-picker-gap` | `root` | `gap` | `default` | `--xh-space-1` | date-range-picker 的 root 部件 gap 覆盖槽。 |
| `--xh-date-range-picker-icon-size` | `control`<br>`positioner`<br>`root` | `--xh-icon-size` | `default`<br>`is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm`<br>`xh-field-chrome` | `--xh-_field-size-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | date-range-picker 的 control、positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-date-range-picker-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | date-range-picker 的 label 部件 color 覆盖槽。 |
| `--xh-date-range-picker-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | date-range-picker 的 label 部件 color 覆盖槽。 |
| `--xh-date-range-picker-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | date-range-picker 的 label 部件 font-size 覆盖槽。 |
| `--xh-date-range-picker-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | date-range-picker 的 label 部件 font-weight 覆盖槽。 |
| `--xh-date-range-picker-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | date-range-picker 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-date-range-picker-literal-fg` | `segment-group` | `color` | `not([data-scope])` | `--xh-fg-subtle` | date-range-picker 的 segment-group 部件 color 覆盖槽。 |
| `--xh-date-range-picker-max-h` | `content` | `max-block-size` | `default` | `--xh-viewport-h-lg` | date-range-picker 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-date-range-picker-panel-divider` | `calendar` | `border-block-start`<br>`border-inline-start` | `@media (min-width: 768px)`<br>`default` | `--xh-material-frosted-separator` | date-range-picker 的 calendar 部件 border-block-start、border-inline-start 覆盖槽。 |
| `--xh-date-range-picker-panel-gap` | `calendar`<br>`preset-group` | `padding-block-start`<br>`padding-inline-start` | `@media (min-width: 768px)`<br>`default` | `--xh-space-3` | date-range-picker 的 calendar、preset-group 部件 padding-block-start、padding-inline-start 覆盖槽。 |
| `--xh-date-range-picker-preset-bg-hover` | `preset` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle` | date-range-picker 的 preset 部件 background-color 覆盖槽。 |
| `--xh-date-range-picker-preset-bg-pressed` | `preset` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-bg-subtle-hover` | date-range-picker 的 preset 部件 background-color 覆盖槽。 |
| `--xh-date-range-picker-preset-check-fg` | `preset` | `background-color` | `default` | `--xh-_date-range-picker-check-fg` | date-range-picker 的 preset 部件 background-color 覆盖槽。 |
| `--xh-date-range-picker-preset-check-size` | `preset` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default` | `--xh-glyph-size-sm` | date-range-picker 的 preset 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-date-range-picker-preset-fg-disabled` | `preset` | `background-color`<br>`color` | `default`<br>`disabled` | `--xh-fg-disabled` | date-range-picker 的 preset 部件 background-color、color 覆盖槽。 |
| `--xh-date-range-picker-preset-fg-selected` | `preset` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=overlay` | `--xh-fg-default` | date-range-picker 的 preset 部件 color 覆盖槽。 |
| `--xh-date-range-picker-preset-group-gap` | `preset-group` | `gap` | `default` | `--xh-list-option-gap` | date-range-picker 的 preset-group 部件 gap 覆盖槽。 |
| `--xh-date-range-picker-preset-group-h` | `preset-group` | `max-block-size` | `default` | `--xh-viewport-h-lg` | date-range-picker 的 preset-group 部件 max-block-size 覆盖槽。 |
| `--xh-date-range-picker-preset-group-padding` | `preset-group` | `padding` | `default` | `--xh-space-1` | date-range-picker 的 preset-group 部件 padding 覆盖槽。 |
| `--xh-date-range-picker-preset-px` | `preset` | `inset-inline-end`<br>`padding-inline`<br>`padding-inline-end` | `default` | `--xh-space-3` | date-range-picker 的 preset 部件 inset-inline-end、padding-inline、padding-inline-end 覆盖槽。 |
| `--xh-date-range-picker-preset-py` | `preset` | `padding-block` | `default` | `--xh-space-1` | date-range-picker 的 preset 部件 padding-block 覆盖槽。 |
| `--xh-date-range-picker-preset-radius` | `preset` | `border-radius` | `default` | `--xh-shape-control` | date-range-picker 的 preset 部件 border-radius 覆盖槽。 |
| `--xh-date-range-picker-range-separator-fg` | `range-separator` | `color` | `default` | `--xh-fg-subtle` | date-range-picker 的 range-separator 部件 color 覆盖槽。 |
| `--xh-date-range-picker-range-separator-mx` | `range-separator` | `margin-inline` | `default` | `--xh-_date-range-picker-range-separator-mx` | date-range-picker 的 range-separator 部件 margin-inline 覆盖槽。 |
| `--xh-date-range-picker-range-separator-px` | `range-separator` | `margin-inline`<br>`padding-inline` | `default` | `--xh-space-1` | date-range-picker 的 range-separator 部件 margin-inline、padding-inline 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

共享关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`opacity` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤按视口分档：`min-width: 768px`。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
