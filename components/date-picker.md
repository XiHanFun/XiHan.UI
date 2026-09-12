来源：https://ui.docs.xihanfun.com/components/date-picker

# DatePicker `日期选择器`

带日历浮层的日期录入：输入框可以打字，浮层里可以挑。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/date-picker" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/date-picker.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/date-picker" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/date-picker" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/date-picker.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

点输入行任意处即展开，不必再去点小箭头；段位与日历写的是同一个值，改哪边另一边当场跟着改口

```vue
<script setup lang="ts">
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerClearTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerHiddenInput,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string[]>([]);
</script>

<template>
  <XhDatePickerRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    locale="zh-CN"
    name="due"
  >
    <XhDatePickerLabel>交付日期</XhDatePickerLabel>
    <XhDatePickerControl>
      <XhDatePickerSegmentGroup>
        <!-- 段位不写内容：显示什么由组件按当前值填 -->
        <XhDatePickerSegment :index="0" />
        <span>-</span>
        <XhDatePickerSegment :index="1" />
        <span>-</span>
        <XhDatePickerSegment :index="2" />
      </XhDatePickerSegmentGroup>
      <XhDatePickerClearTrigger />
    </XhDatePickerControl>
    <!-- 表单出口：随表单提交的是 ISO 串 -->
    <XhDatePickerHiddenInput />
    <XhDatePickerPositioner>
      <XhDatePickerContent>
        <XhDatePickerCalendar>
          <XhDatePickerHeader>
            <XhDatePickerPrevTrigger aria-label="上个月" />
            <XhDatePickerHeading />
            <XhDatePickerNextTrigger aria-label="下个月" />
          </XhDatePickerHeader>
          <XhDatePickerGrid>
            <XhDatePickerGridHead>
              <XhDatePickerWeekRow>
                <XhDatePickerWeekDay
                  v-for="d in weekDays"
                  :key="d.value"
                  :value="d.value"
                />
              </XhDatePickerWeekRow>
            </XhDatePickerGridHead>
            <XhDatePickerGridBody>
              <!-- v-for 必带 key：就地复用会让承载焦点的那一格换了身份 -->
              <XhDatePickerWeekRow v-for="week in weeks" :key="week[0].value">
                <XhDatePickerCell
                  v-for="day in week"
                  :key="day.value"
                  :value="day.value"
                >
                  <XhDatePickerCellTrigger>{{ day.day }}</XhDatePickerCellTrigger>
                </XhDatePickerCell>
              </XhDatePickerWeekRow>
            </XhDatePickerGridBody>
          </XhDatePickerGrid>
        </XhDatePickerCalendar>
      </XhDatePickerContent>
    </XhDatePickerPositioner>
  </XhDatePickerRoot>

  <span style="font-size: 13px">当前值：{{ value[0] ?? "（未选）" }}</span>
</template>
```

```html
<div id="date-picker-basic-mount"></div>

<!-- 结构先收在模板里：网格由作者渲染，格子填好了才入页 -->
<template id="date-picker-basic-template">
  <xh-date-picker locale="zh-CN" name="due">
    <div data-xh-part="root">
      <span data-xh-part="label">交付日期</span>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <!-- 段位不写内容：显示什么由组件按当前值填 -->
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
        </div>
        <button data-xh-part="clear-trigger"></button>
      </div>
      <!-- 表单出口：随表单提交的是 ISO 串 -->
      <input data-xh-part="hidden-input" />
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="calendar">
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
        </div>
      </div>
    </div>
  </xh-date-picker>
</template>

<script type="module">
  const fragment = document
    .getElementById("date-picker-basic-template")
    .content.cloneNode(true);
  const picker = fragment.querySelector("xh-date-picker");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector(
    '[data-xh-part="grid-head"] [data-xh-part="week-row"]',
  );
  const body = fragment.querySelector('[data-xh-part="grid-body"]');

  // 已经画出来的是哪个月
  let month = "";

  // 表头七列只跟 locale 走，画一次就够
  function paintHead() {
    head.replaceChildren(
      ...picker.weekDays.map((day) => {
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
    const first = picker.weeks[0][0].value;
    if (first === month) {
      return;
    }
    month = first;
    heading.textContent = picker.headingLabel;
    body.replaceChildren(
      ...picker.weeks.map((week) => {
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
  document.getElementById("date-picker-basic-mount").append(fragment);
  paintHead();
  paintBody();

  picker.addEventListener("focused-value-change", paintBody);
</script>
```

## 示例

### 区间选择

五种粒度都能挑区间：两端跨页才并排两页，同一页放得下就一页；翻页整窗一起走，大步翻那对钮一次跨一年或十页

```vue
<script setup lang="ts">
import type { CalendarView } from "@xihan-ui/headless";
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerClearTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerNextYearTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerPrevYearTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerWeekDay,
  XhDatePickerWeekNumber,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

const kinds = [
  { key: "day", label: "按天", view: "day" as CalendarView, week: false },
  { key: "week", label: "按周", view: "day" as CalendarView, week: true },
  { key: "month", label: "按月", view: "month" as CalendarView, week: false },
  { key: "quarter", label: "按季度", view: "quarter" as CalendarView, week: false },
  { key: "year", label: "按年", view: "year" as CalendarView, week: false },
];

const values = ref<Record<string, string[]>>({
  day: [],
  week: [],
  month: [],
  quarter: [],
  year: [],
});

// 两组段位各自的读屏名字，区间模式下替掉指向 label 的那份
const translations = { startDate: "开始", endDate: "结束" };

function text(v: string[]): string {
  if (v.length === 0)
    return "（未选）";
  if (v.length === 1)
    return `${v[0]}（另一端待定）`;
  return `${v[0]} → ${v[1]}`;
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <XhDatePickerRoot
      v-for="k in kinds"
      :key="k.key"
      v-slot="{ panels, weekDays, segments, endSegments }"
      v-model:value="values[k.key]"
      :translations="translations"
      :view="k.view"
      :week-selection="k.week"
      selection-mode="range"
      locale="zh-CN"
    >
      <XhDatePickerLabel>{{ k.label }}</XhDatePickerLabel>
      <XhDatePickerControl>
        <!-- 组号定这组段位认领哪一端：0 起点、1 终点 -->
        <XhDatePickerSegmentGroup v-for="end in 2" :key="end" :index="end - 1">
          <!-- 铺哪几块由 view 推；「-」与「周」是普通节点，作者写在段位旁边 -->
          <template v-for="(seg, i) in end === 1 ? segments : endSegments" :key="seg.type">
            <span v-if="i > 0">-</span>
            <XhDatePickerSegment :index="i" />
            <span v-if="seg.type === 'week'">周</span>
          </template>
        </XhDatePickerSegmentGroup>
        <XhDatePickerClearTrigger />
      </XhDatePickerControl>
      <XhDatePickerPositioner>
        <XhDatePickerContent>
          <!-- 面板号写在日历上，面板内的标题、网格与格子跟着它走 -->
          <XhDatePickerCalendar v-for="panel in panels" :key="panel.index" :index="panel.index">
            <XhDatePickerHeader>
              <!-- 往前只在最左那张、往后只在最右那张：整窗一起走 -->
              <XhDatePickerPrevYearTrigger v-if="panel.index === 0" aria-label="快退" />
              <XhDatePickerPrevTrigger v-if="panel.index === 0" aria-label="上一页" />
              <XhDatePickerHeading />
              <XhDatePickerNextTrigger v-if="panel.index === panels.length - 1" aria-label="下一页" />
              <XhDatePickerNextYearTrigger v-if="panel.index === panels.length - 1" aria-label="快进" />
            </XhDatePickerHeader>
            <XhDatePickerGrid>
              <template v-if="panel.weeks.length > 0">
                <XhDatePickerGridHead>
                  <XhDatePickerWeekRow>
                    <!-- 周选时行首多一列周序号，表头也得空出这一格 -->
                    <XhDatePickerWeekNumber v-if="k.week" value="" />
                    <XhDatePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
                  </XhDatePickerWeekRow>
                </XhDatePickerGridHead>
                <XhDatePickerGridBody>
                  <XhDatePickerWeekRow v-for="week in panel.weeks" :key="week[0].value">
                    <!-- 周序号：挑的是第几周，光看日期看不出来。列宽与文字归皮肤管 -->
                    <XhDatePickerWeekNumber v-if="k.week" :value="week[0].value" />
                    <!-- index 必须给：同一天会同时出现在两个面板里 -->
                    <XhDatePickerCell
                      v-for="day in week"
                      :key="day.value"
                      :value="day.value"
                    >
                      <XhDatePickerCellTrigger>{{ day.day }}</XhDatePickerCellTrigger>
                    </XhDatePickerCell>
                  </XhDatePickerWeekRow>
                </XhDatePickerGridBody>
              </template>
              <XhDatePickerCell
                v-for="cell in panel.cells"
                v-else
                :key="cell.value"
                :value="cell.value"
              >
                <XhDatePickerCellTrigger>{{ cell.label }}</XhDatePickerCellTrigger>
              </XhDatePickerCell>
            </XhDatePickerGrid>
          </XhDatePickerCalendar>
        </XhDatePickerContent>
      </XhDatePickerPositioner>

      <span style="font-size: 13px">{{ text(values[k.key]) }}</span>
    </XhDatePickerRoot>
  </div>
</template>
```

```html
<div
  id="date-picker-range-mount"
  style="display: flex; flex-direction: column; gap: 20px"
></div>

<!-- 壳先收在模板里：段位与面板都由作者照取数口铺，铺好了才入页 -->
<template id="date-picker-range-template">
  <xh-date-picker selection-mode="range" locale="zh-CN">
    <div data-xh-part="root">
      <span data-xh-part="label"></span>
      <div data-xh-part="control">
        <!-- 文档序在前的这组认领起点，在后的认领终点；里面铺几段由 view 推 -->
        <div data-xh-part="segment-group"></div>
        <div data-xh-part="segment-group"></div>
        <button data-xh-part="clear-trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content"></div>
      </div>
      <span class="date-picker-range-text" style="font-size: 13px">（未选）</span>
    </div>
  </xh-date-picker>
</template>

<script type="module">
  const kinds = [
    { label: "按天", view: "day", week: false },
    { label: "按周", view: "day", week: true },
    { label: "按月", view: "month", week: false },
    { label: "按季度", view: "quarter", week: false },
    { label: "按年", view: "year", week: false },
  ];

  // 两组段位各自的读屏名字，区间模式下替掉指向 label 的那份
  const translations = { startDate: "开始", endDate: "结束" };

  const mount = document.getElementById("date-picker-range-mount");
  const template = document.getElementById("date-picker-range-template");

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

  // 周序号：挑的是第几周，光看日期看不出来。身份取行首那天，文字由元素填
  function weekNumber(value) {
    const el = node("span", "week-number");
    el.setAttribute("value", value);
    return el;
  }

  function dayCell(value, text) {
    const cell = node("div", "cell");
    cell.setAttribute("value", value);
    cell.append(node("div", "cell-trigger", text));
    return cell;
  }

  // 一页一张日历：面板号写在标题与网格上，格子跟着所在网格走
  function panelOf(panel, last, kind, weekDays) {
    const calendar = node("div", "calendar");
    const header = node("div", "header");
    // 往前只在最左那张、往后只在最右那张：翻页整窗一起走
    if (panel.index === 0) {
      header.append(
        pageTrigger("prev-year-trigger", "快退"),
        pageTrigger("prev-trigger", "上一页"),
      );
    }
    const heading = node("div", "heading", panel.headingLabel);
    heading.setAttribute("index", panel.index);
    header.append(heading);
    if (last) {
      header.append(
        pageTrigger("next-trigger", "下一页"),
        pageTrigger("next-year-trigger", "快进"),
      );
    }

    const grid = node("div", "grid");
    grid.setAttribute("index", panel.index);
    // 日视图铺周行，粗粒度视图把格子直接铺进网格
    if (panel.weeks.length > 0) {
      const head = node("div", "grid-head");
      const headRow = node("div", "week-row");
      // 周选时行首多一列周序号，表头也得空出这一格
      if (kind.week) {
        headRow.append(weekNumber(""));
      }
      for (const day of weekDays) {
        const column = node("span", "week-day", day.label);
        column.setAttribute("value", day.value);
        headRow.append(column);
      }
      head.append(headRow);

      const body = node("div", "grid-body");
      for (const week of panel.weeks) {
        const row = node("div", "week-row");
        if (kind.week) {
          row.append(weekNumber(week[0].value));
        }
        for (const day of week) {
          row.append(dayCell(day.value, day.day));
        }
        body.append(row);
      }
      grid.append(head, body);
    } else {
      for (const cell of panel.cells) {
        grid.append(dayCell(cell.value, cell.label));
      }
    }

    calendar.append(header, grid);
    return calendar;
  }

  function readoutText(value) {
    if (value.length === 0) {
      return "（未选）";
    }
    if (value.length === 1) {
      return `${value[0]}（另一端待定）`;
    }
    return `${value[0]} → ${value[1]}`;
  }

  for (const kind of kinds) {
    const fragment = template.content.cloneNode(true);
    const picker = fragment.querySelector("xh-date-picker");
    picker.setAttribute("view", kind.view);
    if (kind.week) {
      picker.setAttribute("week-selection", "");
    }
    picker.querySelector('[data-xh-part="label"]').textContent = kind.label;
    picker.translations = translations;

    const groups = picker.querySelectorAll('[data-xh-part="segment-group"]');
    const content = picker.querySelector('[data-xh-part="content"]');
    const readout = picker.querySelector(".date-picker-range-text");

    // 已经画出来的是哪几页
    let painted = "";

    function paintPanels() {
      const panels = picker.panels;
      const signature = panels
        .map((panel) => `${panel.index}:${panel.startValue}:${panel.weeks.length}`)
        .join("|");
      // 换了页、钻了层或并排页数变了才重画；同页内移动焦点时格子原样留着
      if (signature === painted) {
        return;
      }
      painted = signature;
      const weekDays = picker.weekDays;
      content.replaceChildren(
        ...panels.map((panel, index) =>
          panelOf(panel, index === panels.length - 1, kind, weekDays),
        ),
      );
    }

    // 段位是空节点：显示什么由组件按当前值填。「-」与「周」是普通节点，写在段位旁边
    function paintSegments(group, segments) {
      const out = [];
      segments.forEach((segment, index) => {
        if (index > 0) {
          out.push(node("span", undefined, "-"));
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
    picker.addEventListener("value-change", (event) => {
      readout.textContent = readoutText(event.detail.value);
      // 两端落在不同页时并排两页，页数跟着值走
      paintPanels();
    });
  }
</script>
```

### 不可选的日子

周末由 isDateUnavailable 判不可用：方向键仍走得过去，只是落不了值

```vue
<script setup lang="ts">
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerClearTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string[]>([]);

function isWeekend(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const weekday = new Date(y, m - 1, d).getDay();
  return weekday === 0 || weekday === 6;
}
</script>

<template>
  <XhDatePickerRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    :is-date-unavailable="isWeekend"
    locale="zh-CN"
  >
    <XhDatePickerLabel>工作日</XhDatePickerLabel>
    <XhDatePickerControl>
      <XhDatePickerSegmentGroup>
        <XhDatePickerSegment :index="0" />
        <span>-</span>
        <XhDatePickerSegment :index="1" />
        <span>-</span>
        <XhDatePickerSegment :index="2" />
      </XhDatePickerSegmentGroup>
      <XhDatePickerClearTrigger />
    </XhDatePickerControl>
    <XhDatePickerPositioner>
      <XhDatePickerContent>
        <XhDatePickerCalendar>
          <XhDatePickerHeader>
            <XhDatePickerPrevTrigger aria-label="上个月" />
            <XhDatePickerHeading />
            <XhDatePickerNextTrigger aria-label="下个月" />
          </XhDatePickerHeader>
          <XhDatePickerGrid>
            <XhDatePickerGridHead>
              <XhDatePickerWeekRow>
                <XhDatePickerWeekDay
                  v-for="d in weekDays"
                  :key="d.value"
                  :value="d.value"
                />
              </XhDatePickerWeekRow>
            </XhDatePickerGridHead>
            <XhDatePickerGridBody>
              <XhDatePickerWeekRow v-for="week in weeks" :key="week[0].value">
                <XhDatePickerCell
                  v-for="day in week"
                  :key="day.value"
                  :value="day.value"
                >
                  <XhDatePickerCellTrigger>{{ day.day }}</XhDatePickerCellTrigger>
                </XhDatePickerCell>
              </XhDatePickerWeekRow>
            </XhDatePickerGridBody>
          </XhDatePickerGrid>
        </XhDatePickerCalendar>
      </XhDatePickerContent>
    </XhDatePickerPositioner>
  </XhDatePickerRoot>

  <span style="font-size: 13px">当前值：{{ value[0] ?? "（未选）" }}</span>
</template>
```

```html
<div id="date-picker-unavailable-mount"></div>
<span style="font-size: 13px">
  当前值：<span id="date-picker-unavailable-value">（未选）</span>
</span>

<template id="date-picker-unavailable-template">
  <xh-date-picker locale="zh-CN">
    <div data-xh-part="root">
      <span data-xh-part="label">工作日</span>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
        </div>
        <button data-xh-part="clear-trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="calendar">
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
        </div>
      </div>
    </div>
  </xh-date-picker>
</template>

<script type="module">
  const fragment = document
    .getElementById("date-picker-unavailable-template")
    .content.cloneNode(true);
  const picker = fragment.querySelector("xh-date-picker");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector(
    '[data-xh-part="grid-head"] [data-xh-part="week-row"]',
  );
  const body = fragment.querySelector('[data-xh-part="grid-body"]');
  const readout = document.getElementById("date-picker-unavailable-value");

  let month = "";

  function paintHead() {
    head.replaceChildren(
      ...picker.weekDays.map((day) => {
        const cell = document.createElement("span");
        cell.dataset.xhPart = "week-day";
        cell.setAttribute("value", day.value);
        cell.textContent = day.label;
        return cell;
      }),
    );
  }

  function paintBody() {
    const first = picker.weeks[0][0].value;
    if (first === month) {
      return;
    }
    month = first;
    heading.textContent = picker.headingLabel;
    body.replaceChildren(
      ...picker.weeks.map((week) => {
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

  function isWeekend(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    const weekday = new Date(y, m - 1, d).getDay();
    return weekday === 0 || weekday === 6;
  }

  document.getElementById("date-picker-unavailable-mount").append(fragment);
  // 判定函数是函数，只走属性
  picker.isDateUnavailable = isWeekend;
  paintHead();
  paintBody();

  picker.addEventListener("focused-value-change", paintBody);
  picker.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
</script>
```

### 禁用 / 只读 / 校验失败

禁用整条退出 Tab 序，只读仍能展开翻月只是落不了值，invalid 只改标注

```vue
<script setup lang="ts">
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";

const states = [
  { label: "禁用", disabled: true, readOnly: false, invalid: false },
  { label: "只读", disabled: false, readOnly: true, invalid: false },
  { label: "校验失败", disabled: false, readOnly: false, invalid: true },
];
</script>

<template>
  <div style="display: grid; gap: 16px; justify-items: start">
    <XhDatePickerRoot
      v-for="s in states"
      :key="s.label"
      v-slot="{ weeks, weekDays }"
      :disabled="s.disabled"
      :read-only="s.readOnly"
      :invalid="s.invalid"
      default-value="2026-07-28"
      locale="zh-CN"
    >
      <XhDatePickerLabel>{{ s.label }}</XhDatePickerLabel>
      <XhDatePickerControl>
        <XhDatePickerSegmentGroup>
          <XhDatePickerSegment :index="0" />
          <span>-</span>
          <XhDatePickerSegment :index="1" />
          <span>-</span>
          <XhDatePickerSegment :index="2" />
        </XhDatePickerSegmentGroup>
      </XhDatePickerControl>
      <XhDatePickerPositioner>
        <XhDatePickerContent>
          <XhDatePickerCalendar>
            <XhDatePickerHeader>
              <XhDatePickerPrevTrigger aria-label="上个月" />
              <XhDatePickerHeading />
              <XhDatePickerNextTrigger aria-label="下个月" />
            </XhDatePickerHeader>
            <XhDatePickerGrid>
              <XhDatePickerGridHead>
                <XhDatePickerWeekRow>
                  <XhDatePickerWeekDay
                    v-for="d in weekDays"
                    :key="d.value"
                    :value="d.value"
                  />
                </XhDatePickerWeekRow>
              </XhDatePickerGridHead>
              <XhDatePickerGridBody>
                <XhDatePickerWeekRow v-for="week in weeks" :key="week[0].value">
                  <XhDatePickerCell
                    v-for="day in week"
                    :key="day.value"
                    :value="day.value"
                  >
                    <XhDatePickerCellTrigger>{{ day.day }}</XhDatePickerCellTrigger>
                  </XhDatePickerCell>
                </XhDatePickerWeekRow>
              </XhDatePickerGridBody>
            </XhDatePickerGrid>
          </XhDatePickerCalendar>
        </XhDatePickerContent>
      </XhDatePickerPositioner>
    </XhDatePickerRoot>
  </div>
</template>
```

```html
<div
  id="date-picker-state-mount"
  style="display: grid; gap: 16px; justify-items: start"
></div>

<template id="date-picker-state-template">
  <xh-date-picker locale="zh-CN" default-value="2026-07-28">
    <div data-xh-part="root">
      <span data-xh-part="label"></span>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
        </div>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="calendar">
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
        </div>
      </div>
    </div>
  </xh-date-picker>
</template>

<script type="module">
  const mount = document.getElementById("date-picker-state-mount");
  const template = document.getElementById("date-picker-state-template");

  const states = [
    { label: "禁用", attribute: "disabled" },
    { label: "只读", attribute: "read-only" },
    { label: "校验失败", attribute: "invalid" },
  ];

  // 一张网格的画法：表头画一次，格子换了月才重画
  function painter(picker, heading, head, body) {
    let month = "";
    head.replaceChildren(
      ...picker.weekDays.map((day) => {
        const cell = document.createElement("span");
        cell.dataset.xhPart = "week-day";
        cell.setAttribute("value", day.value);
        cell.textContent = day.label;
        return cell;
      }),
    );
    return function paint() {
      const first = picker.weeks[0][0].value;
      if (first === month) {
        return;
      }
      month = first;
      heading.textContent = picker.headingLabel;
      body.replaceChildren(
        ...picker.weeks.map((week) => {
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
    };
  }

  for (const state of states) {
    const fragment = template.content.cloneNode(true);
    const picker = fragment.querySelector("xh-date-picker");
    // 属性在入页前写好：状态在建机器那一刻就得在
    picker.setAttribute(state.attribute, "");
    fragment.querySelector('[data-xh-part="label"]').textContent = state.label;
    const heading = fragment.querySelector('[data-xh-part="heading"]');
    const head = fragment.querySelector(
      '[data-xh-part="grid-head"] [data-xh-part="week-row"]',
    );
    const body = fragment.querySelector('[data-xh-part="grid-body"]');

    mount.append(fragment);
    const paint = painter(picker, heading, head, body);
    paint();
    picker.addEventListener("focused-value-change", paint);
  }
</script>
```

### 快捷选项

presets 在浮层里排出一列，点一条整份写进去并收起；日子在组件外算好再传

```vue
<script setup lang="ts">
import { datePickerPresetDay } from "@xihan-ui/headless";
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerClearTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPresetGroup,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const value = ref<string[]>([]);

// 日子在 computed 里算一次。connect 每帧都会跑一遍，把 today() 放进渲染期会跨零点算出两个答案。
// 区间用 datePickerPresetRange(-6, 0) 这类算出 '起/止' 一个串，两端一次落定
const presets = computed(() => [
  { label: "今天", value: datePickerPresetDay(0) },
  { label: "明天", value: datePickerPresetDay(1) },
  { label: "一周后", value: datePickerPresetDay(7) },
]);
</script>

<template>
  <XhDatePickerRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    :presets="presets"
    locale="zh-CN"
  >
    <XhDatePickerLabel>提醒日期</XhDatePickerLabel>
    <XhDatePickerControl>
      <XhDatePickerSegmentGroup>
        <XhDatePickerSegment :index="0" />
        <span>-</span>
        <XhDatePickerSegment :index="1" />
        <span>-</span>
        <XhDatePickerSegment :index="2" />
      </XhDatePickerSegmentGroup>
      <XhDatePickerClearTrigger />
    </XhDatePickerControl>
    <XhDatePickerPositioner>
      <XhDatePickerContent>
        <!-- 不写默认插槽就按 presets 数据自动铺，产出的 DOM 与手写部件一致 -->
        <XhDatePickerPresetGroup />
        <XhDatePickerCalendar>
          <XhDatePickerHeader>
            <XhDatePickerPrevTrigger aria-label="上个月" />
            <XhDatePickerHeading />
            <XhDatePickerNextTrigger aria-label="下个月" />
          </XhDatePickerHeader>
          <XhDatePickerGrid>
            <XhDatePickerGridHead>
              <XhDatePickerWeekRow>
                <XhDatePickerWeekDay
                  v-for="d in weekDays"
                  :key="d.value"
                  :value="d.value"
                />
              </XhDatePickerWeekRow>
            </XhDatePickerGridHead>
            <XhDatePickerGridBody>
              <XhDatePickerWeekRow v-for="week in weeks" :key="week[0].value">
                <XhDatePickerCell
                  v-for="day in week"
                  :key="day.value"
                  :value="day.value"
                >
                  <XhDatePickerCellTrigger>{{ day.day }}</XhDatePickerCellTrigger>
                </XhDatePickerCell>
              </XhDatePickerWeekRow>
            </XhDatePickerGridBody>
          </XhDatePickerGrid>
        </XhDatePickerCalendar>
      </XhDatePickerContent>
    </XhDatePickerPositioner>
  </XhDatePickerRoot>

  <span style="font-size: 13px">当前值：{{ value[0] ?? "（未选）" }}</span>
</template>
```

```html
<div id="date-picker-shortcuts-mount"></div>
<span style="font-size: 13px">
  当前值：<span id="date-picker-shortcuts-value">（未选）</span>
</span>

<template id="date-picker-shortcuts-template">
  <xh-date-picker locale="zh-CN">
    <div data-xh-part="root">
      <span data-xh-part="label">提醒日期</span>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
        </div>
        <button data-xh-part="clear-trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="preset-group"></div>
          <div data-xh-part="calendar">
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
        </div>
      </div>
    </div>
  </xh-date-picker>
</template>

<script type="module">
  const fragment = document
    .getElementById("date-picker-shortcuts-template")
    .content.cloneNode(true);
  const picker = fragment.querySelector("xh-date-picker");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector(
    '[data-xh-part="grid-head"] [data-xh-part="week-row"]',
  );
  const body = fragment.querySelector('[data-xh-part="grid-body"]');
  const list = fragment.querySelector('[data-xh-part="preset-group"]');
  const readout = document.getElementById("date-picker-shortcuts-value");

  let month = "";

  function paintHead() {
    head.replaceChildren(
      ...picker.weekDays.map((day) => {
        const cell = document.createElement("span");
        cell.dataset.xhPart = "week-day";
        cell.setAttribute("value", day.value);
        cell.textContent = day.label;
        return cell;
      }),
    );
  }

  function paintBody() {
    const first = picker.weeks[0][0].value;
    if (first === month) {
      return;
    }
    month = first;
    heading.textContent = picker.headingLabel;
    body.replaceChildren(
      ...picker.weeks.map((week) => {
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

  // 示例台不能 import 包，这里把 datePickerPresetDay 做的事等价地写一遍；
  // 真实项目里从 @xihan-ui/headless 引它，还有 -Range / -Month / -Year 三个
  function shift(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  }

  // 日子算一次就固定下来，组件只认已经算好的字面值
  const presets = [
    { label: "今天", value: shift(0) },
    { label: "明天", value: shift(1) },
    { label: "一周后", value: shift(7) },
  ];

  // 条目由作者铺，身份写在 value 属性上；元素只负责把行为打上去
  list.replaceChildren(
    ...presets.map((preset) => {
      const item = document.createElement("div");
      item.dataset.xhPart = "preset";
      item.setAttribute("value", preset.value);
      item.textContent = preset.label;
      return item;
    }),
  );
  picker.presets = presets;

  // 值与展开态都由这段脚本持有：组件只发意图，写回才算数
  function setValue(value) {
    picker.value = value;
    readout.textContent = value[0] ?? "（未选）";
  }

  function setOpen(open) {
    picker.open = open;
  }

  document.getElementById("date-picker-shortcuts-mount").append(fragment);
  setValue([]);
  setOpen(false);
  paintHead();
  paintBody();

  picker.addEventListener("focused-value-change", paintBody);
  picker.addEventListener("value-change", (event) => setValue(event.detail.value));
  picker.addEventListener("open-change", (event) => setOpen(event.detail.open));
</script>
```

### 受控展开与事件

open 交给宿主持有，值、展开、聚焦日三条变化各自播报

```vue
<script setup lang="ts">
import {
  XhButton,
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string[]>([]);
const open = ref(false);
const focused = ref("");

function onFocusedValueChange(details: { focusedValue: string }) {
  focused.value = details.focusedValue;
}
</script>

<template>
  <XhDatePickerRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    v-model:open="open"
    locale="zh-CN"
    @focused-value-change="onFocusedValueChange"
  >
    <XhDatePickerLabel>排期</XhDatePickerLabel>
    <XhDatePickerControl>
      <XhDatePickerSegmentGroup>
        <XhDatePickerSegment :index="0" />
        <span>-</span>
        <XhDatePickerSegment :index="1" />
        <span>-</span>
        <XhDatePickerSegment :index="2" />
      </XhDatePickerSegmentGroup>
    </XhDatePickerControl>
    <XhDatePickerPositioner>
      <XhDatePickerContent>
        <XhDatePickerCalendar>
          <XhDatePickerHeader>
            <XhDatePickerPrevTrigger aria-label="上个月" />
            <XhDatePickerHeading />
            <XhDatePickerNextTrigger aria-label="下个月" />
          </XhDatePickerHeader>
          <XhDatePickerGrid>
            <XhDatePickerGridHead>
              <XhDatePickerWeekRow>
                <XhDatePickerWeekDay
                  v-for="d in weekDays"
                  :key="d.value"
                  :value="d.value"
                />
              </XhDatePickerWeekRow>
            </XhDatePickerGridHead>
            <XhDatePickerGridBody>
              <XhDatePickerWeekRow v-for="week in weeks" :key="week[0].value">
                <XhDatePickerCell
                  v-for="day in week"
                  :key="day.value"
                  :value="day.value"
                >
                  <XhDatePickerCellTrigger>{{ day.day }}</XhDatePickerCellTrigger>
                </XhDatePickerCell>
              </XhDatePickerWeekRow>
            </XhDatePickerGridBody>
          </XhDatePickerGrid>
        </XhDatePickerCalendar>
      </XhDatePickerContent>
    </XhDatePickerPositioner>
  </XhDatePickerRoot>

  <!-- 展开态由外面这颗按钮也能改 -->
  <XhButton size="sm" variant="outline" @click="open = !open">
    {{ open ? "收起" : "展开" }}
  </XhButton>

  <span style="font-size: 13px">
    值：{{ value[0] ?? "（未选）" }} · 聚焦日：{{ focused || "（还没动过）" }}
  </span>
</template>
```

```html
<div id="date-picker-events-mount"></div>

<!-- 展开态由外面这颗按钮也能改 -->
<xh-button id="date-picker-events-toggle" size="sm" variant="outline">
  <button data-xh-part="root">展开</button>
</xh-button>

<span style="font-size: 13px">
  值：<span id="date-picker-events-value">（未选）</span> · 聚焦日：<span
    id="date-picker-events-focused"
    >（还没动过）</span
  >
</span>

<template id="date-picker-events-template">
  <xh-date-picker locale="zh-CN">
    <div data-xh-part="root">
      <span data-xh-part="label">排期</span>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
        </div>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="calendar">
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
        </div>
      </div>
    </div>
  </xh-date-picker>
</template>

<script type="module">
  const fragment = document
    .getElementById("date-picker-events-template")
    .content.cloneNode(true);
  const picker = fragment.querySelector("xh-date-picker");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector(
    '[data-xh-part="grid-head"] [data-xh-part="week-row"]',
  );
  const body = fragment.querySelector('[data-xh-part="grid-body"]');

  const toggle = document
    .getElementById("date-picker-events-toggle")
    .querySelector('[data-xh-part="root"]');
  const valueOut = document.getElementById("date-picker-events-value");
  const focusedOut = document.getElementById("date-picker-events-focused");

  let month = "";

  function paintHead() {
    head.replaceChildren(
      ...picker.weekDays.map((day) => {
        const cell = document.createElement("span");
        cell.dataset.xhPart = "week-day";
        cell.setAttribute("value", day.value);
        cell.textContent = day.label;
        return cell;
      }),
    );
  }

  function paintBody() {
    const first = picker.weeks[0][0].value;
    if (first === month) {
      return;
    }
    month = first;
    heading.textContent = picker.headingLabel;
    body.replaceChildren(
      ...picker.weeks.map((week) => {
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

  // 展开态由这段脚本持有：组件只发意图，写回它才真的展开
  function setOpen(open) {
    picker.open = open;
    toggle.textContent = open ? "收起" : "展开";
  }

  document.getElementById("date-picker-events-mount").append(fragment);
  setOpen(false);
  paintHead();
  paintBody();

  toggle.addEventListener("click", () => setOpen(!picker.open));
  picker.addEventListener("open-change", (event) => setOpen(event.detail.open));
  picker.addEventListener("value-change", (event) => {
    valueOut.textContent = event.detail.value[0] ?? "（未选）";
  });
  picker.addEventListener("focused-value-change", (event) => {
    focusedOut.textContent = event.detail.focusedValue;
    paintBody();
  });
</script>
```

### 日期加时间

show-time 让值升格为一体化 datetime：日历右侧多出时/分两列，选完日子不收起、时间列点选写值、确认钮收口

```vue
<script setup lang="ts">
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerConfirmTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTimePanel,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

const stamp = ref<string[]>([]);
</script>

<template>
  <XhDatePickerRoot v-slot="{ weeks, weekDays }" v-model:value="stamp" show-time locale="zh-CN">
    <XhDatePickerLabel>会议开始</XhDatePickerLabel>
    <XhDatePickerControl>
      <XhDatePickerSegmentGroup>
        <XhDatePickerSegment :index="0" />
        <span>-</span>
        <XhDatePickerSegment :index="1" />
        <span>-</span>
        <XhDatePickerSegment :index="2" />
      </XhDatePickerSegmentGroup>
    </XhDatePickerControl>
    <XhDatePickerPositioner>
      <XhDatePickerContent>
        <div style="display: flex; align-items: stretch">
          <XhDatePickerCalendar>
            <XhDatePickerHeader>
              <XhDatePickerPrevTrigger aria-label="上个月" />
              <XhDatePickerHeading />
              <XhDatePickerNextTrigger aria-label="下个月" />
            </XhDatePickerHeader>
            <XhDatePickerGrid>
              <XhDatePickerGridHead>
                <XhDatePickerWeekRow>
                  <XhDatePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
                </XhDatePickerWeekRow>
              </XhDatePickerGridHead>
              <XhDatePickerGridBody>
                <XhDatePickerWeekRow v-for="week in weeks" :key="week[0].value">
                  <XhDatePickerCell v-for="day in week" :key="day.value" :value="day.value">
                    <XhDatePickerCellTrigger>{{ day.day }}</XhDatePickerCellTrigger>
                  </XhDatePickerCell>
                </XhDatePickerWeekRow>
              </XhDatePickerGridBody>
            </XhDatePickerGrid>
          </XhDatePickerCalendar>
          <XhDatePickerTimePanel />
        </div>
        <div style="display: flex; justify-content: flex-end; margin-block-start: 8px">
          <XhDatePickerConfirmTrigger>确定</XhDatePickerConfirmTrigger>
        </div>
      </XhDatePickerContent>
    </XhDatePickerPositioner>
  </XhDatePickerRoot>
  <p>已选：{{ stamp[0] ?? "（未选）" }}</p>
</template>
```

```html
<div id="date-picker-datetime-mount"></div>
<p>已选：<span id="date-picker-datetime-value">（未选）</span></p>

<template id="date-picker-datetime-template">
  <xh-date-picker locale="zh-CN" show-time>
    <div data-xh-part="root">
      <span data-xh-part="label">会议开始</span>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
        </div>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div style="display: flex; align-items: stretch">
            <div data-xh-part="calendar">
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
            <!-- 时间列由作者铺：列自报 unit，选项自报两位补零的 value -->
            <div data-xh-part="time-column" unit="hour"></div>
            <div data-xh-part="time-column" unit="minute"></div>
          </div>
          <div style="display: flex; justify-content: flex-end; margin-block-start: 8px">
            <button data-xh-part="confirm-trigger">确定</button>
          </div>
        </div>
      </div>
    </div>
  </xh-date-picker>
</template>

<script type="module">
  const fragment = document
    .getElementById("date-picker-datetime-template")
    .content.cloneNode(true);
  const picker = fragment.querySelector("xh-date-picker");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector(
    '[data-xh-part="grid-head"] [data-xh-part="week-row"]',
  );
  const body = fragment.querySelector('[data-xh-part="grid-body"]');
  const readout = document.getElementById("date-picker-datetime-value");

  let month = "";

  function paintHead() {
    head.replaceChildren(
      ...picker.weekDays.map((day) => {
        const cell = document.createElement("span");
        cell.dataset.xhPart = "week-day";
        cell.setAttribute("value", day.value);
        cell.textContent = day.label;
        return cell;
      }),
    );
  }

  function paintBody() {
    const first = picker.weeks[0][0].value;
    if (first === month) {
      return;
    }
    month = first;
    heading.textContent = picker.headingLabel;
    body.replaceChildren(
      ...picker.weeks.map((week) => {
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

  // 时列 24 项、分列 60 项，缺省精度到分
  function paintTimeColumn(unit, count) {
    const column = fragment.querySelector(
      `[data-xh-part="time-column"][unit="${unit}"]`,
    );
    const options = [];
    for (let i = 0; i < count; i++) {
      const value = `${i}`.padStart(2, "0");
      const item = document.createElement("div");
      item.dataset.xhPart = "time-item";
      item.setAttribute("value", value);
      item.textContent = value;
      options.push(item);
    }
    column.replaceChildren(...options);
  }

  // 时间列先填好再入页，接线那一刻选项已经在了
  paintTimeColumn("hour", 24);
  paintTimeColumn("minute", 60);

  document.getElementById("date-picker-datetime-mount").append(fragment);
  paintHead();
  paintBody();

  picker.addEventListener("focused-value-change", paintBody);
  picker.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
</script>
```

### 五种粒度

天 / 周 / 月 / 季度 / 年一套结构走完：输入行铺哪几段跟着 view 走，标题里的年与月可点，逐级钻上去

```vue
<script setup lang="ts">
import type { CalendarView } from "@xihan-ui/headless";
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerClearTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerHeadingMonthTrigger,
  XhDatePickerHeadingYearTrigger,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerNextYearTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerPrevYearTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerWeekDay,
  XhDatePickerWeekNumber,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 段位不必再手数几段：铺哪几块由 view 推出来，作者照 segments 铺就是
const kinds = [
  { key: "day", label: "按天", view: "day" as CalendarView, week: false },
  { key: "week", label: "按周", view: "day" as CalendarView, week: true },
  { key: "month", label: "按月", view: "month" as CalendarView, week: false },
  { key: "quarter", label: "按季度", view: "quarter" as CalendarView, week: false },
  { key: "year", label: "按年", view: "year" as CalendarView, week: false },
];

const values = ref<Record<string, string[]>>({
  day: [],
  week: [],
  month: [],
  quarter: [],
  year: [],
});
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
    <XhDatePickerRoot
      v-for="k in kinds"
      :key="k.key"
      v-slot="{ panels, weekDays, segments }"
      v-model:value="values[k.key]"
      :view="k.view"
      :week-selection="k.week"
      :selection-mode="k.week ? 'range' : 'single'"
      locale="zh-CN"
    >
      <XhDatePickerLabel>{{ k.label }}</XhDatePickerLabel>
      <XhDatePickerControl>
        <XhDatePickerSegmentGroup>
          <!-- 「-」与「周」是普通节点，与「年 / 月 / 日」一样由作者写在段位旁边 -->
          <template v-for="(seg, i) in segments" :key="seg.type">
            <span v-if="i > 0">-</span>
            <XhDatePickerSegment :index="i" />
            <span v-if="seg.type === 'week'">周</span>
          </template>
        </XhDatePickerSegmentGroup>
        <XhDatePickerClearTrigger />
      </XhDatePickerControl>
      <XhDatePickerPositioner>
        <XhDatePickerContent>
          <XhDatePickerCalendar v-for="panel in panels" :key="panel.index">
            <XhDatePickerHeader>
              <!-- 大步翻那对钮：日视图一年，粗粒度视图十页 -->
              <XhDatePickerPrevYearTrigger aria-label="快退" />
              <XhDatePickerPrevTrigger aria-label="上一页" />
              <XhDatePickerHeading :index="panel.index">
                <!-- 年与月各是一个钮：点年进十年格、点月进月格；到顶那一截自动按不动，
                     没有的那一截自动收起 -->
                <XhDatePickerHeadingYearTrigger :index="panel.index" />
                <XhDatePickerHeadingMonthTrigger :index="panel.index" />
              </XhDatePickerHeading>
              <XhDatePickerNextTrigger aria-label="下一页" />
              <XhDatePickerNextYearTrigger aria-label="快进" />
            </XhDatePickerHeader>
            <XhDatePickerGrid :index="panel.index">
              <!-- 日视图铺周行，粗粒度视图把格子直接铺进网格。钻上去之后铺的也是格子，
                   所以这里看 panel.weeks 有没有东西，不看 view -->
              <template v-if="panel.weeks.length > 0">
                <XhDatePickerGridHead>
                  <XhDatePickerWeekRow>
                    <!-- 周选时行首多一列周序号，表头也得空出这一格 -->
                    <XhDatePickerWeekNumber v-if="k.week" value="" />
                    <XhDatePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
                  </XhDatePickerWeekRow>
                </XhDatePickerGridHead>
                <XhDatePickerGridBody>
                  <XhDatePickerWeekRow v-for="week in panel.weeks" :key="week[0].value">
                    <!-- 周序号：挑的是第几周，光看日期看不出来。列宽与文字归皮肤管 -->
                    <XhDatePickerWeekNumber v-if="k.week" :value="week[0].value" />
                    <XhDatePickerCell
                      v-for="day in week"
                      :key="day.value"
                      :value="day.value"
                      :index="panel.index"
                    >
                      <XhDatePickerCellTrigger>{{ day.day }}</XhDatePickerCellTrigger>
                    </XhDatePickerCell>
                  </XhDatePickerWeekRow>
                </XhDatePickerGridBody>
              </template>
              <XhDatePickerCell
                v-for="cell in panel.cells"
                v-else
                :key="cell.value"
                :value="cell.value"
                :index="panel.index"
              >
                <XhDatePickerCellTrigger>{{ cell.label }}</XhDatePickerCellTrigger>
              </XhDatePickerCell>
            </XhDatePickerGrid>
          </XhDatePickerCalendar>
        </XhDatePickerContent>
      </XhDatePickerPositioner>
    </XhDatePickerRoot>
  </div>

  <p style="font-size: 13px">
    <span v-for="k in kinds" :key="k.key" style="margin-inline-end: 12px">
      {{ k.label }}：{{ values[k.key].join(" → ") || "—" }}
    </span>
  </p>
</template>
```

```html
<div
  id="date-picker-granularity-mount"
  style="display: flex; flex-wrap: wrap; gap: 24px"
></div>
<p id="date-picker-granularity-readout" style="font-size: 13px"></p>

<!-- 壳先收在模板里：段位与网格都由作者照取数口铺，铺好了才入页 -->
<template id="date-picker-granularity-template">
  <xh-date-picker locale="zh-CN">
    <div data-xh-part="root">
      <span data-xh-part="label"></span>
      <div data-xh-part="control">
        <div data-xh-part="segment-group"></div>
        <button data-xh-part="clear-trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="calendar">
            <div data-xh-part="header">
              <!-- 大步翻那对钮：日视图一年，粗粒度视图十页 -->
              <button data-xh-part="prev-year-trigger" aria-label="快退"></button>
              <button data-xh-part="prev-trigger" aria-label="上一页"></button>
              <div data-xh-part="heading">
                <!-- 年与月各是一个钮：点年进十年格、点月进月格；文字由元素填，
                     到顶那一截自动按不动，没有的那一截自动收起 -->
                <button data-xh-part="heading-year-trigger"></button>
                <button data-xh-part="heading-month-trigger"></button>
              </div>
              <button data-xh-part="next-trigger" aria-label="下一页"></button>
              <button data-xh-part="next-year-trigger" aria-label="快进"></button>
            </div>
            <div data-xh-part="grid"></div>
          </div>
        </div>
      </div>
    </div>
  </xh-date-picker>
</template>

<script type="module">
  const kinds = [
    { key: "day", label: "按天", view: "day", week: false },
    { key: "week", label: "按周", view: "day", week: true },
    { key: "month", label: "按月", view: "month", week: false },
    { key: "quarter", label: "按季度", view: "quarter", week: false },
    { key: "year", label: "按年", view: "year", week: false },
  ];

  const mount = document.getElementById("date-picker-granularity-mount");
  const template = document.getElementById("date-picker-granularity-template");
  const readout = document.getElementById("date-picker-granularity-readout");

  // 各粒度各自挑到了什么，一起印在下面
  const values = new Map(kinds.map((kind) => [kind.key, []]));

  function paintReadout() {
    readout.replaceChildren(
      ...kinds.map((kind) => {
        const item = document.createElement("span");
        item.style.marginInlineEnd = "12px";
        item.textContent = `${kind.label}：${values.get(kind.key).join(" → ") || "—"}`;
        return item;
      }),
    );
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

  // 周序号：挑的是第几周，光看日期看不出来。身份取行首那天，文字由元素填
  function weekNumber(value) {
    const el = node("span", "week-number");
    el.setAttribute("value", value);
    return el;
  }

  function dayCell(value, text) {
    const cell = node("div", "cell");
    cell.setAttribute("value", value);
    cell.append(node("div", "cell-trigger", text));
    return cell;
  }

  for (const kind of kinds) {
    const fragment = template.content.cloneNode(true);
    const picker = fragment.querySelector("xh-date-picker");
    picker.setAttribute("view", kind.view);
    picker.setAttribute("selection-mode", kind.week ? "range" : "single");
    if (kind.week) {
      picker.setAttribute("week-selection", "");
    }
    picker.querySelector('[data-xh-part="label"]').textContent = kind.label;

    const group = picker.querySelector('[data-xh-part="segment-group"]');
    const grid = picker.querySelector('[data-xh-part="grid"]');

    // 已经画出来的是哪一页
    let painted = "";

    function paintGrid() {
      const panel = picker.panels[0];
      if (!panel) {
        return;
      }
      const signature = `${panel.startValue}:${panel.weeks.length}`;
      // 换了页或钻了层才重画；同页内移动焦点时格子原样留着
      if (signature === painted) {
        return;
      }
      painted = signature;

      // 日视图铺周行，粗粒度视图把格子直接铺进网格。钻上去之后铺的也是格子，
      // 所以这里看 panel.weeks 有没有东西，不看 view
      if (panel.weeks.length === 0) {
        grid.replaceChildren(
          ...panel.cells.map((cell) => dayCell(cell.value, cell.label)),
        );
        return;
      }

      const head = node("div", "grid-head");
      const headRow = node("div", "week-row");
      // 周选时行首多一列周序号，表头也得空出这一格
      if (kind.week) {
        headRow.append(weekNumber(""));
      }
      for (const day of picker.weekDays) {
        const column = node("span", "week-day", day.label);
        column.setAttribute("value", day.value);
        headRow.append(column);
      }
      head.append(headRow);

      const body = node("div", "grid-body");
      for (const week of panel.weeks) {
        const row = node("div", "week-row");
        if (kind.week) {
          row.append(weekNumber(week[0].value));
        }
        for (const day of week) {
          row.append(dayCell(day.value, day.day));
        }
        body.append(row);
      }
      grid.replaceChildren(head, body);
    }

    // 段位不必手数几段：铺哪几块由 view 推出来，照 fieldSegments 铺就是。
    // 段位是空节点，显示什么由组件按当前值填；「-」与「周」是普通节点，写在段位旁边
    function paintSegments() {
      const out = [];
      picker.fieldSegments.forEach((segment, index) => {
        if (index > 0) {
          out.push(node("span", undefined, "-"));
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
    paintSegments();
    paintGrid();

    picker.addEventListener("focused-value-change", paintGrid);
    picker.addEventListener("active-view-change", paintGrid);
    picker.addEventListener("value-change", (event) => {
      values.set(kind.key, event.detail.value);
      paintReadout();
    });
  }

  paintReadout();
</script>
```

### 三轴

variant 决定描边与底怎么画、tone 决定用哪族颜色、size 换几何档；三者只落在 root，浮层里的日历一并跟着换

```vue
<script setup lang="ts">
import type { ControlVariant, Size, Tone } from "@xihan-ui/core";
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerClearTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";

const variants: ControlVariant[] = ["outline", "subtle", "ghost"];
const tones: Tone[] = ["brand", "success", "danger"];
const sizes: Size[] = ["sm", "md", "lg"];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <div
      v-for="(row, i) in [variants, tones, sizes]"
      :key="i"
      style="display: flex; flex-wrap: wrap; gap: 16px"
    >
      <XhDatePickerRoot
        v-for="v in row"
        :key="v"
        v-slot="{ weeks, weekDays }"
        :variant="i === 0 ? (v as ControlVariant) : undefined"
        :tone="i === 1 ? (v as Tone) : undefined"
        :size="i === 2 ? (v as Size) : undefined"
        locale="zh-CN"
      >
        <XhDatePickerLabel>{{ v }}</XhDatePickerLabel>
        <XhDatePickerControl>
          <XhDatePickerSegmentGroup>
            <!-- 段位不写内容：显示什么由组件按当前值填 -->
            <XhDatePickerSegment :index="0" />
            <span>-</span>
            <XhDatePickerSegment :index="1" />
            <span>-</span>
            <XhDatePickerSegment :index="2" />
          </XhDatePickerSegmentGroup>
          <XhDatePickerClearTrigger />
        </XhDatePickerControl>
        <XhDatePickerPositioner>
          <XhDatePickerContent>
            <XhDatePickerCalendar>
              <XhDatePickerHeader>
                <XhDatePickerPrevTrigger aria-label="上个月" />
                <XhDatePickerHeading />
                <XhDatePickerNextTrigger aria-label="下个月" />
              </XhDatePickerHeader>
              <XhDatePickerGrid>
                <XhDatePickerGridHead>
                  <XhDatePickerWeekRow>
                    <XhDatePickerWeekDay
                      v-for="d in weekDays"
                      :key="d.value"
                      :value="d.value"
                    />
                  </XhDatePickerWeekRow>
                </XhDatePickerGridHead>
                <XhDatePickerGridBody>
                  <!-- v-for 必带 key：就地复用会让承载焦点的那一格换了身份 -->
                  <XhDatePickerWeekRow
                    v-for="week in weeks"
                    :key="week[0].value"
                  >
                    <XhDatePickerCell
                      v-for="day in week"
                      :key="day.value"
                      :value="day.value"
                    >
                      <XhDatePickerCellTrigger>
                        {{
                          day.day
                        }}
                      </XhDatePickerCellTrigger>
                    </XhDatePickerCell>
                  </XhDatePickerWeekRow>
                </XhDatePickerGridBody>
              </XhDatePickerGrid>
            </XhDatePickerCalendar>
          </XhDatePickerContent>
        </XhDatePickerPositioner>
      </XhDatePickerRoot>
    </div>
  </div>
</template>
```

```html
<div
  id="date-picker-axes-mount"
  style="display: flex; flex-direction: column; gap: 20px"
></div>

<template id="date-picker-axes-template">
  <xh-date-picker locale="zh-CN">
    <div data-xh-part="root">
      <span data-xh-part="label"></span>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <!-- 段位不写内容：显示什么由组件按当前值填 -->
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
        </div>
        <button data-xh-part="clear-trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="calendar">
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
        </div>
      </div>
    </div>
  </xh-date-picker>
</template>

<script type="module">
  const mount = document.getElementById("date-picker-axes-mount");
  const template = document.getElementById("date-picker-axes-template");

  const rows = [
    { axis: "variant", values: ["outline", "subtle", "ghost"] },
    { axis: "tone", values: ["brand", "success", "danger"] },
    { axis: "size", values: ["sm", "md", "lg"] },
  ];

  // 一张网格的画法：表头画一次，格子换了月才重画
  function painter(picker, heading, head, body) {
    let month = "";
    head.replaceChildren(
      ...picker.weekDays.map((day) => {
        const cell = document.createElement("span");
        cell.dataset.xhPart = "week-day";
        cell.setAttribute("value", day.value);
        cell.textContent = day.label;
        return cell;
      }),
    );
    return function paint() {
      const first = picker.weeks[0][0].value;
      if (first === month) {
        return;
      }
      month = first;
      heading.textContent = picker.headingLabel;
      body.replaceChildren(
        ...picker.weeks.map((week) => {
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
    };
  }

  for (const row of rows) {
    const line = document.createElement("div");
    line.style.cssText = "display: flex; flex-wrap: wrap; gap: 16px";
    mount.append(line);

    for (const value of row.values) {
      const fragment = template.content.cloneNode(true);
      const picker = fragment.querySelector("xh-date-picker");
      picker.setAttribute(row.axis, value);
      fragment.querySelector('[data-xh-part="label"]').textContent = value;
      const heading = fragment.querySelector('[data-xh-part="heading"]');
      const head = fragment.querySelector(
        '[data-xh-part="grid-head"] [data-xh-part="week-row"]',
      );
      const body = fragment.querySelector('[data-xh-part="grid-body"]');

      line.append(fragment);
      const paint = painter(picker, heading, head, body);
      paint();
      picker.addEventListener("focused-value-change", paint);
    }
  }
</script>
```

### 可选的触发钮

点输入行本来就展开，这个按钮不是必需的；要它是因为它才带 aria-haspopup / aria-expanded

```vue
<script setup lang="ts">
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerClearTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTrigger,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string[]>([]);
</script>

<template>
  <XhDatePickerRoot v-slot="{ weeks, weekDays }" v-model:value="value" locale="zh-CN">
    <XhDatePickerLabel>交付日期</XhDatePickerLabel>
    <XhDatePickerControl>
      <XhDatePickerSegmentGroup>
        <XhDatePickerSegment :index="0" />
        <span>-</span>
        <XhDatePickerSegment :index="1" />
        <span>-</span>
        <XhDatePickerSegment :index="2" />
      </XhDatePickerSegmentGroup>
      <XhDatePickerClearTrigger />
      <!-- 写上它多一个明写的入口；不写也照样能展开——点输入行即可，
           键盘则在段上按 Alt+ArrowDown -->
      <XhDatePickerTrigger aria-label="展开日历" />
    </XhDatePickerControl>
    <XhDatePickerPositioner>
      <XhDatePickerContent>
        <XhDatePickerCalendar>
          <XhDatePickerHeader>
            <XhDatePickerPrevTrigger aria-label="上个月" />
            <XhDatePickerHeading />
            <XhDatePickerNextTrigger aria-label="下个月" />
          </XhDatePickerHeader>
          <XhDatePickerGrid>
            <XhDatePickerGridHead>
              <XhDatePickerWeekRow>
                <XhDatePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
              </XhDatePickerWeekRow>
            </XhDatePickerGridHead>
            <XhDatePickerGridBody>
              <XhDatePickerWeekRow v-for="week in weeks" :key="week[0].value">
                <XhDatePickerCell v-for="day in week" :key="day.value" :value="day.value">
                  <XhDatePickerCellTrigger>{{ day.day }}</XhDatePickerCellTrigger>
                </XhDatePickerCell>
              </XhDatePickerWeekRow>
            </XhDatePickerGridBody>
          </XhDatePickerGrid>
        </XhDatePickerCalendar>
      </XhDatePickerContent>
    </XhDatePickerPositioner>
  </XhDatePickerRoot>

  <span style="font-size: 13px">当前值：{{ value[0] ?? "（未选）" }}</span>
</template>
```

```html
<div id="date-picker-trigger-mount"></div>
<span style="font-size: 13px">
  当前值：<span id="date-picker-trigger-value">（未选）</span>
</span>

<template id="date-picker-trigger-template">
  <xh-date-picker locale="zh-CN">
    <div data-xh-part="root">
      <span data-xh-part="label">交付日期</span>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
        </div>
        <button data-xh-part="clear-trigger"></button>
        <!-- 写上它多一个明写的入口；不写也照样能展开——点输入行即可，
             键盘则在段上按 Alt+ArrowDown -->
        <button data-xh-part="trigger" aria-label="展开日历"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="calendar">
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
        </div>
      </div>
    </div>
  </xh-date-picker>
</template>

<script type="module">
  const fragment = document
    .getElementById("date-picker-trigger-template")
    .content.cloneNode(true);
  const picker = fragment.querySelector("xh-date-picker");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector(
    '[data-xh-part="grid-head"] [data-xh-part="week-row"]',
  );
  const body = fragment.querySelector('[data-xh-part="grid-body"]');
  const readout = document.getElementById("date-picker-trigger-value");

  let month = "";

  function paintHead() {
    head.replaceChildren(
      ...picker.weekDays.map((day) => {
        const cell = document.createElement("span");
        cell.dataset.xhPart = "week-day";
        cell.setAttribute("value", day.value);
        cell.textContent = day.label;
        return cell;
      }),
    );
  }

  function paintBody() {
    const first = picker.weeks[0][0].value;
    if (first === month) {
      return;
    }
    month = first;
    heading.textContent = picker.headingLabel;
    body.replaceChildren(
      ...picker.weeks.map((week) => {
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

  document.getElementById("date-picker-trigger-mount").append(fragment);
  paintHead();
  paintBody();

  picker.addEventListener("focused-value-change", paintBody);
  picker.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
</script>
```

## 设计指引

### 何时使用

- 用户需要看着日历判断（星期几、离今天多远、区间有多长）。
- 需要选区间，或需要日期加时间。

### 何时不用

- 用户已经知道确切日期且只想打字：用[日期输入](./date-field)。
- 只要时间：用[时间选择器](./time-picker)。

### 特性

- 五种粒度（周 / 月 / 季度 / 年 / 日）走同一套结构。
- `selectionMode` 支持单选与区间；区间的两端各有自己的 `name`。
- `isDateUnavailable` 逐日判断可选性。
- `presets` 在浮层里排出一列快捷选项（今天 / 近 7 天 / 本月），点一下整份写进去。
- 快捷项与 `showTime` 的时 / 分 / 秒选项统一由逻辑末端对号表示持久选值；正文保持普通颜色和字重，
  悬停与键盘焦点才铺中性底。日期格、范围连片和预览仍由内嵌 Calendar 的独立状态表达。
- 时间数字两侧保留等宽标记轨，数字保持在整行数学中心；RTL 只把对号翻到另一侧，不移动数字。
  手机复合面板在 comfortable 密度使用 12px 小标记（compact 随同一令牌收至 10px），以容下日历与
  时 / 分两列；平板起恢复 16px。作者槽仍可显式覆盖。
- 禁用态同步压低正文与对号，并停止 hover 反馈；forced-colors 下对号改用系统前景色，禁用标记使用
  `GrayText`，与公共选中轮廓形成两条独立通道。
- `closeOnSelect` 决定选完就关还是等确认。
- 输入框保持实体表面，日历浮层采用统一磨砂材质、细顶光与分隔线；内嵌 Calendar 和时间列共用外层表面。
- 浮层按实际弹出方向短距离淡入淡出，不缩放日期和文字；手机双月历堆叠、时间列与确认按钮布局在退场中保持稳定。
- 减弱动效、增强对比度沿用主题设置，键盘关闭后归还打开前的焦点。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-date-picker>` |
| Vue 组件 | `XhDatePickerCalendar` `XhDatePickerCell` `XhDatePickerCellTrigger` `XhDatePickerClearTrigger` `XhDatePickerConfirmTrigger` `XhDatePickerContent` `XhDatePickerControl` `XhDatePickerGrid` `XhDatePickerGridBody` `XhDatePickerGridHead` `XhDatePickerHeader` `XhDatePickerHeading` `XhDatePickerHeadingMonthTrigger` `XhDatePickerHeadingYearTrigger` `XhDatePickerHiddenInput` `XhDatePickerLabel` `XhDatePickerNextTrigger` `XhDatePickerNextYearTrigger` `XhDatePickerPositioner` `XhDatePickerPreset` `XhDatePickerPresetGroup` `XhDatePickerPrevTrigger` `XhDatePickerPrevYearTrigger` `XhDatePickerRoot` `XhDatePickerSegment` `XhDatePickerSegmentGroup` `XhDatePickerTimePanel` `XhDatePickerTrigger` `XhDatePickerWeekDay` `XhDatePickerWeekNumber` `XhDatePickerWeekRow` |
| 组合式函数 | `useDatePicker` |
| 状态机 | `datePickerMachine` |
| 皮肤 | `@xihan-ui/styles/date-picker.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="date-picker"`：`root` · `label` · **`control`** · `segment-group` · `trigger` · `clear-trigger` · `positioner` · **`content`** · `preset-group` · `preset` · **`calendar`** · `time-column` · `time-item` · `confirm-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| string[]` |  | 选中值，ISO 串。给定即受控：读直取 prop，写只发 onValueChange 不落内部值。 单选可写裸串，内部一律归一成数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `min` | `string` |  | 可选范围下界（含当天），ISO 串。日历与分段输入共用这一条。 |
| `max` | `string` |  | 可选范围上界（含当天），ISO 串。 |
| `locale` | `string` |  | 决定周首日、月份文案与段位先后（zh-CN 年月日、en-US 月日年）。 不给按宿主语言，宿主也没有时按 en-US。 |
| `timeZone` | `string` |  | 判定「今天」与格式化文案用的时区，默认取宿主本地时区。 |
| `selectionMode` | `CalendarSelectionMode` |  | 选择模式，默认 single；区间模式下两端都落定才算选完。 |
| `isDateUnavailable` | `(value: string) => boolean` |  | 不可用判定，收 ISO 串。界外与它判真的日子同等对待。 |
| `disabled` | `boolean` |  | 整个控件禁用：trigger 转原生 disabled，段位退出 Tab 序，日历格子全转 aria-disabled。 |
| `readOnly` | `boolean` |  | 只读：浮层照常展开、日历照常翻月浏览，但选中值改不动。 |
| `invalid` | `boolean` |  | 校验失败：段位报 aria-invalid，各角色节点带 data-invalid。 |
| `required` | `boolean` |  | 必填标注，落到每一段的 aria-required 上。 |
| `name` | `string` |  | 表单字段名；给了隐藏输入才带 name，ISO 串随表单一并提交。区间模式下是起点那一份。 |
| `endName` | `string` |  | 区间终点那份隐藏输入的表单字段名；不给即终点不参与提交。 |
| `view` | `CalendarView` |  | 挑的粒度：天（默认）、月、季度、年。格子的值仍是 ISO 日期串 （那段时间的第一天），min/max 与区间逻辑因此原样复用。 输入行铺哪几段也跟着它走（按季度挑就出「2026-Q2」），要另铺见 segments。 |
| `activeView` | `CalendarView` |  | 面板此刻钻到了哪一层。给定即受控；缺省跟着 view，每次展开都回到 view 那一档。 点标题里的年 / 月会改它。 没有配套的 defaultActiveView：面板每次展开都会重置这一档，非受控初值没有生效的时刻， 发出去也观察不到任何效果。要改初始层级请用 view。 |
| `segments` | `DateSegmentSet` |  | 输入行铺哪几段。不给就按 view 推：按月挑出「2026-05」、按季度出「2026-Q2」、 按年出「2026」、周选出「2026-33」，按天挑则按 locale 排年月日。 |
| `weekSelection` | `boolean` |  | 周选：点任意一天选中它所在的整周。只在 view=day 且区间模式下生效。 |
| `presets` | `DatePickerPreset[]` |  | 快捷选项（「今天」「近 7 天」这类）。给了就在浮层里多出一列，点一下整份写进选中值。 日子要算好再传：连接层每帧求值，把 `today()` 放进渲染期会跨零点算出两个答案。 与 selectionMode 不配（单选给了区间）、落在 min/max 之外或被 isDateUnavailable 判掉的那条 自动按不下去；showTime 下写进去的日期带上此刻已挑的时间。 |
| `visibleCount` | `number` |  | 并排展示几个连续月。单选恒 1；区间按已选的两端定：同一页里放得下就 1，跨页才 2。 还只落了一端时按 2 算——另一端常在下一页，一张面板得来回翻。 |
| `fixedWeeks` | `boolean` |  | 日历恒渲染六行，默认开。关掉后网格按当月实际周数收，翻页时浮层高度会跟着变。 |
| `defaultFocusedValue` | `string` |  | 初始聚焦日，ISO 串；它同时决定展开时先落在哪一页。 不给就退回首个选中值，再退回今天。表单重置回到这一份。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入行的描边与底色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，输入行与浮层里的日历格一并换档。 |
| `placement` | `Placement` |  |  |
| `dir` | `Direction` |  | 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `translations` | `Partial<DatePickerTranslations>` |  |  |
| `closeOnSelect` | `boolean` |  | 选完即收起，默认 true。区间模式下要两端都落定才算选完。 |
| `showTime` | `boolean` |  | 一体化时间：值升格为 'YYYY-MM-DDTHH:mm[:ss]'，面板里多出时间列， 选完日子不收起、由确认按钮收口。只在单选模式下生效。 |
| `timeGranularity` | `DatePickerTimeGranularity` |  | showTime 的时间段精度，默认 minute。 |
| `onValueChange` | `(details: DatePickerValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onOpenChange` | `(details: DatePickerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onFocusedValueChange` | `(details: DatePickerFocusChangeDetails) => void` |  | 聚焦日变化（方向键、翻月、展开、段位输入都会发）。 网格由外部渲染，不监听这条日历不会换月。 |
| `onActiveViewChange` | `(details: CalendarViewChangeDetails) => void` |  | 面板钻到了哪一层（点标题钻上、点格子钻下都会发）；受控时是唯一出口。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `DatePickerValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `open-change` | `DatePickerOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `focused-value-change` | `DatePickerFocusChangeDetails` | 聚焦日变化（意味着展示月可能换了）；detail 为 `{ focusedValue: string }`，作者据此重画网格 |
| `active-view-change` | `CalendarViewChangeDetails` | 钻到了另一层（点标题钻上、点格子钻下）；detail 为 `{ activeView: 'day'\|'month'\|'quarter'\|'year' }`，作者据此重画网格 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDatePickerPreset` | `default` | — | 条目内容；不写就用数据里的 label。 |
| `XhDatePickerPresetGroup` | `default` | `DatePickerPresetsSlotProps` | 自己铺条目；不写就按 presets 数据自动铺，两者产出的 DOM 一致。 |
| `XhDatePickerRoot` | `default` | `DatePickerRootSlotProps` |  |
| `XhDatePickerSegment` | `default` | `DatePickerSegmentSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `preset` | 'checked' \| 'unchecked' |
| `calendar` | 'open' \| 'closed' |
| `time-item` | 'checked' \| 'unchecked' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `VALUE.SET` · `VALUE.CLEAR` · `FOCUSED.SET` · `VIEW.SET` · `FORM.RESET`

**判据**：`isOpenControlled` · `closesOnSelect`

## connect API

`useDatePicker` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `value` | `string[]` | 选中集合，ISO 串；形状不随模式变。 区间模式下按位存放，空缺的那一端是空串。 |
| `valueAsString` | `string \| null` | 首个选中值（跳过空缺的那一端）；无选中时为 null。 |
| `selectionMode` | `CalendarSelectionMode` |  |
| `focusedValue` | `string` | 生效聚焦日（三路收口后的结果），恒非空。日历展示哪个月由它决定。 |
| `view` | `CalendarView` | 作者要挑的粒度。 |
| `activeView` | `CalendarView` | 面板此刻钻到了哪一层。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `canClear` | `boolean` | 清空按钮此刻可不可按。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[]) => void` |  |
| `clear` | `() => void` |  |
| `setActiveView` | `(next: CalendarView) => void` | 直接钻到某一层。 |
| `presets` | `readonly DatePickerPresetState[]` | 快捷选项逐条的样子，数据顺序。没给 presets 时为空数组。 |
| `showTime` | `boolean` | showTime 生效（开了且是单选模式）。 |
| `timeColumns` | `readonly TimePickerColumn<DatePickerTimeUnit>[]` | 时间列（时/分[/秒]）；没开 showTime 时为空数组。 |
| `timeValue` | `string \| null` | 当前时间段（'HH:mm[:ss]'）；还没有值时为 null。 |
| `calendar` | `CalendarApi<T>` | 内嵌日历：选日期、翻月、键盘导航都在它身上。 |
| `field` | `DatePickerFieldApi<T>` | 内嵌分段输入，区间模式下是起点那一组。 |
| `fieldEnd` | `DatePickerFieldApi<T> \| null` | 终点那组分段输入；非区间模式为 null。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getSegmentGroupProps` | `(props?: DatePickerSegmentGroupProps) => T['element']` | role=group 的分段容器，段位挂在它里面。区间模式下 index 选起止两组，不传即起点。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getPresetGroupProps` | `() => T['element']` | 快捷选项列（role=listbox）；没给 presets 时带 hidden。 |
| `getPresetProps` | `(props: DatePickerPresetProps) => T['element']` | 一条快捷选项（role=option）：点按把整份日期写进选中值。 |
| `getCalendarProps` | `() => T['element']` | 内嵌日历的挂载点，同时充当日历的根节点。 |
| `getTimeColumnProps` | `(props: DatePickerTimeColumnProps) => T['element']` | 时间列容器（时/分[/秒]各一列）；没开 showTime 时带 hidden。 |
| `getTimeItemProps` | `(props: DatePickerTimeItemProps) => T['element']` | 时间选项：点按把该单位写进值（没有日期时以聚焦日为日期段起值）。 |
| `getConfirmTriggerProps` | `() => T['button']` | 确认按钮：showTime 的收口；没开 showTime 时带 hidden。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/#kbd_label)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger, closed | 展开日历浮层，焦点落到当前聚焦日那一格 |
| `Enter` / `Space` | focus in trigger, open | 收起浮层，焦点回到 trigger |
| `Escape` | open | 收起浮层并把焦点还给展开前那个控件（通常是 trigger），选中值不变 |
| `Tab` / `Shift+Tab` | open | 不拦按键：焦点按 Tab 序列自然离开，浮层随即收起且不抢回焦点 |
| `Enter` / `Space` | open, focus in grid | 选中聚焦日（由日历完成）；closeOnSelect 时收起浮层——区间要两端都落定才算选完 |
| `ArrowUp` / `ArrowDown` / `Home` / `End` | open, focus in 快捷选项列 | 在快捷选项之间移动焦点，到头回绕；不写值 |
| `Enter` / `Space` | open, focus in 某条快捷选项 | 把这条快捷选项整份写进选中值；closeOnSelect 时收起浮层 |
| `Alt+ArrowDown` | focus in 某一段, closed, not disabled | 展开浮层并把焦点送进去；触发钮是可选部件，键盘那条入口不能只挂在它身上 |
| `Enter` | focus in 某一段, open | 收起浮层。段位里敲出来的值不触发「选完即收」（那时人还在打字），这是那条路的收口手势 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `segment-group` | `aria-disabled` | 'true' \| 'false' |
| `segment-group` | `aria-label` | label.endDate \| label.startDate \| undefined |
| `segment-group` | `aria-labelledby` | undefined \| `label` 部件的 id |
| `segment-group` | `role` | 'group' |
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
| `time-column` | `aria-disabled` | 'true' \| 'false' |
| `time-column` | `aria-label` | label[unit] |
| `time-column` | `aria-multiselectable` | 'false' |
| `time-column` | `aria-orientation` | 'vertical' |
| `time-column` | `role` | 'listbox' |
| `time-item` | `aria-selected` | 'true' \| 'false' |
| `time-item` | `role` | 'option' |

## 样式

默认皮肤 `@xihan-ui/styles/date-picker.css` 按部件选择：`[data-scope="date-picker"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

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
| `segment-group` | `data-complete` | ''（条件成立时才出现） |
| `segment-group` | `data-disabled` | ''（条件成立时才出现） |
| `segment-group` | `data-empty` | ''（条件成立时才出现） |
| `segment-group` | `data-index` | String(index) |
| `segment-group` | `data-invalid` | ''（条件成立时才出现） |
| `segment-group` | `data-out-of-range` | ''（条件成立时才出现） |
| `segment-group` | `data-readonly` | ''（条件成立时才出现） |
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
| `preset` | `data-disabled` | ''（条件成立时才出现） |
| `preset` | `data-state` | 'checked' \| 'unchecked' |
| `preset` | `data-value` | v |
| `calendar` | `data-disabled` | ''（条件成立时才出现） |
| `calendar` | `data-readonly` | ''（条件成立时才出现） |
| `calendar` | `data-state` | 'open' \| 'closed' |
| `time-column` | `data-unit` | live[at]!.getAttribute('data-unit') as DatePickerTime… |
| `time-item` | `data-state` | 'checked' \| 'unchecked' |
| `time-item` | `data-unit` | live[at]!.getAttribute('data-unit') as DatePickerTime… |
| `time-item` | `data-value` | v |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-date-picker-action-bg` | `clear-trigger`<br>`trigger` | `background` | `default`<br>`disabled` | `transparent` | date-picker 的 clear-trigger、trigger 部件 background 覆盖槽。 |
| `--xh-date-picker-action-bg-active` | `clear-trigger`<br>`trigger` | `background` | `active`<br>`not(:disabled)`<br>`state=open` | `--xh-bg-subtle-active` | date-picker 的 clear-trigger、trigger 部件 background 覆盖槽。 |
| `--xh-date-picker-action-bg-hover` | `clear-trigger`<br>`trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | date-picker 的 clear-trigger、trigger 部件 background 覆盖槽。 |
| `--xh-date-picker-action-fg` | `clear-trigger`<br>`trigger` | `color` | `default` | `--xh-fg-muted` | date-picker 的 clear-trigger、trigger 部件 color 覆盖槽。 |
| `--xh-date-picker-action-fg-hover` | `clear-trigger`<br>`trigger` | `color` | `hover`<br>`not(:disabled)`<br>`state=open` | `--xh-fg-default` | date-picker 的 clear-trigger、trigger 部件 color 覆盖槽。 |
| `--xh-date-picker-action-font-size` | `clear-trigger`<br>`trigger` | `font-size` | `default` | `--xh-text-secondary-size` | date-picker 的 clear-trigger、trigger 部件 font-size 覆盖槽。 |
| `--xh-date-picker-action-radius` | `clear-trigger`<br>`trigger` | `border-radius` | `default` | `--xh-shape-control` | date-picker 的 clear-trigger、trigger 部件 border-radius 覆盖槽。 |
| `--xh-date-picker-action-size` | `clear-trigger`<br>`trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | date-picker 的 clear-trigger、trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-date-picker-calendar-gap` | `calendar` | `gap` | `default` | `--xh-space-3` | date-picker 的 calendar 部件 gap 覆盖槽。 |
| `--xh-date-picker-column-divider` | `preset-group`<br>`time-column` | `border-block-end`<br>`border-inline-end`<br>`border-inline-start` | `@media (min-width: 768px)`<br>`default` | `--xh-material-frosted-separator` | date-picker 的 preset-group、time-column 部件 border-block-end、border-inline-end、border-inline-start 覆盖槽。 |
| `--xh-date-picker-confirm-trigger-bg` | `confirm-trigger` | `background` | `default` | `--xh-_date-picker-accent` | date-picker 的 confirm-trigger 部件 background 覆盖槽。 |
| `--xh-date-picker-confirm-trigger-bg-active` | `confirm-trigger` | `background` | `active` | `--xh-_date-picker-accent-active` | date-picker 的 confirm-trigger 部件 background 覆盖槽。 |
| `--xh-date-picker-confirm-trigger-bg-hover` | `confirm-trigger` | `background` | `hover` | `--xh-_date-picker-accent-hover` | date-picker 的 confirm-trigger 部件 background 覆盖槽。 |
| `--xh-date-picker-confirm-trigger-fg` | `confirm-trigger` | `color` | `default` | `--xh-_date-picker-accent-fg` | date-picker 的 confirm-trigger 部件 color 覆盖槽。 |
| `--xh-date-picker-confirm-trigger-h` | `confirm-trigger` | `block-size` | `default` | `--xh-control-h-sm` | date-picker 的 confirm-trigger 部件 block-size 覆盖槽。 |
| `--xh-date-picker-confirm-trigger-px` | `confirm-trigger` | `padding-inline` | `default` | `--xh-control-px-sm` | date-picker 的 confirm-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-date-picker-confirm-trigger-radius` | `confirm-trigger` | `border-radius` | `default` | `--xh-shape-control` | date-picker 的 confirm-trigger 部件 border-radius 覆盖槽。 |
| `--xh-date-picker-confirm-trigger-shadow` | `confirm-trigger` | `box-shadow` | `default` | `--xh-_date-picker-confirm-highlight` | date-picker 的 confirm-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-date-picker-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | date-picker 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-date-picker-content-bg` | `content` | `background` | `default` | `--xh-material-frosted-bg` | date-picker 的 content 部件 background 覆盖槽。 |
| `--xh-date-picker-content-border` | `content` | `border` | `default` | `--xh-material-frosted-border` | date-picker 的 content 部件 border 覆盖槽。 |
| `--xh-date-picker-content-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | date-picker 的 content 部件 color 覆盖槽。 |
| `--xh-date-picker-content-highlight` | `content` | `background` | `default` | `--xh-material-frosted-highlight` | date-picker 的 content 部件 background 覆盖槽。 |
| `--xh-date-picker-content-px` | `content` | `padding-inline` | `default` | `--xh-space-3` | date-picker 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-date-picker-content-py` | `content` | `padding-block` | `default` | `--xh-space-3` | date-picker 的 content 部件 padding-block 覆盖槽。 |
| `--xh-date-picker-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | date-picker 的 content 部件 border-radius 覆盖槽。 |
| `--xh-date-picker-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | date-picker 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-date-picker-control-bg` | `control` | `background` | `default` | `--xh-_date-picker-control-bg` | date-picker 的 control 部件 background 覆盖槽。 |
| `--xh-date-picker-control-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` | date-picker 的 control 部件 background 覆盖槽。 |
| `--xh-date-picker-control-bg-hover` | `control` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly` | `--xh-_date-picker-control-bg-hover` | date-picker 的 control 部件 background 覆盖槽。 |
| `--xh-date-picker-control-bg-readonly` | `control` | `background` | `readonly` | `--xh-bg-subtle` | date-picker 的 control 部件 background 覆盖槽。 |
| `--xh-date-picker-control-border` | `control` | `border` | `default` | `--xh-_date-picker-control-border` | date-picker 的 control 部件 border 覆盖槽。 |
| `--xh-date-picker-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])` | `--xh-_tone` | date-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-date-picker-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid])` | `--xh-_date-picker-control-border-hover` | date-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-date-picker-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` | date-picker 的 control 部件 border-color 覆盖槽。 |
| `--xh-date-picker-control-fg` | `control` | `color` | `default` | `--xh-fg-default` | date-picker 的 control 部件 color 覆盖槽。 |
| `--xh-date-picker-control-gap` | `control` | `gap` | `default` | `--xh-_date-picker-gap` | date-picker 的 control 部件 gap 覆盖槽。 |
| `--xh-date-picker-control-h` | `control` | `block-size` | `default` | `--xh-_date-picker-control-h` | date-picker 的 control 部件 block-size 覆盖槽。 |
| `--xh-date-picker-control-min-w` | `control`<br>`root` | `min-inline-size` | `default` | `--xh-control-min-w` | date-picker 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-date-picker-control-px` | `control` | `padding-inline` | `default` | `--xh-_date-picker-control-px` | date-picker 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-date-picker-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | date-picker 的 control 部件 border-radius 覆盖槽。 |
| `--xh-date-picker-control-shadow` | `control` | `box-shadow` | `default` | `--xh-_date-picker-control-shadow` | date-picker 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-date-picker-font-size` | `segment-group` | `font-size` | `default` | `--xh-_date-picker-font-size` | date-picker 的 segment-group 部件 font-size 覆盖槽。 |
| `--xh-date-picker-gap` | `root` | `gap` | `default` | `--xh-space-1` | date-picker 的 root 部件 gap 覆盖槽。 |
| `--xh-date-picker-icon-size` | `positioner`<br>`root` | `--xh-icon-size` | `default`<br>`is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | date-picker 的 positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-date-picker-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | date-picker 的 label 部件 color 覆盖槽。 |
| `--xh-date-picker-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | date-picker 的 label 部件 color 覆盖槽。 |
| `--xh-date-picker-label-font-size` | `label` | `font-size` | `default` | `--xh-_date-picker-label-font-size` | date-picker 的 label 部件 font-size 覆盖槽。 |
| `--xh-date-picker-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | date-picker 的 label 部件 font-weight 覆盖槽。 |
| `--xh-date-picker-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | date-picker 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-date-picker-max-h` | `content` | `max-block-size` | `default` | `--xh-viewport-h-lg` | date-picker 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-date-picker-panel-divider` | `calendar` | `border-block-start`<br>`border-inline-start` | `@media (min-width: 768px)`<br>`default` | `--xh-material-frosted-separator` | date-picker 的 calendar 部件 border-block-start、border-inline-start 覆盖槽。 |
| `--xh-date-picker-panel-gap` | `calendar`<br>`preset-group` | `padding-block-start`<br>`padding-inline-start` | `@media (min-width: 768px)`<br>`default` | `--xh-space-3` | date-picker 的 calendar、preset-group 部件 padding-block-start、padding-inline-start 覆盖槽。 |
| `--xh-date-picker-preset-bg-hover` | `preset` | `background` | `disabled`<br>`is(:hover, :focus-visible)`<br>`not([data-disabled])` | `--xh-bg-subtle` | date-picker 的 preset 部件 background 覆盖槽。 |
| `--xh-date-picker-preset-check-fg` | `preset` | `background-color` | `default` | `--xh-_date-picker-check-fg` | date-picker 的 preset 部件 background-color 覆盖槽。 |
| `--xh-date-picker-preset-check-size` | `preset` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default` | `--xh-glyph-size-sm` | date-picker 的 preset 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-date-picker-preset-fg-disabled` | `preset` | `background-color`<br>`color` | `disabled` | `--xh-fg-disabled` | date-picker 的 preset 部件 background-color、color 覆盖槽。 |
| `--xh-date-picker-preset-fg-selected` | `preset` | `color` | `state=checked` | `inherit` | date-picker 的 preset 部件 color 覆盖槽。 |
| `--xh-date-picker-preset-group-gap` | `preset-group` | `gap` | `default` | `--xh-list-option-gap` | date-picker 的 preset-group 部件 gap 覆盖槽。 |
| `--xh-date-picker-preset-group-h` | `preset-group` | `max-block-size` | `default` | `--xh-viewport-h-lg` | date-picker 的 preset-group 部件 max-block-size 覆盖槽。 |
| `--xh-date-picker-preset-group-padding` | `preset-group` | `padding` | `default` | `--xh-space-1` | date-picker 的 preset-group 部件 padding 覆盖槽。 |
| `--xh-date-picker-preset-px` | `preset` | `inset-inline-end`<br>`padding-inline`<br>`padding-inline-end` | `default` | `--xh-space-3` | date-picker 的 preset 部件 inset-inline-end、padding-inline、padding-inline-end 覆盖槽。 |
| `--xh-date-picker-preset-py` | `preset` | `padding-block` | `default` | `--xh-space-1` | date-picker 的 preset 部件 padding-block 覆盖槽。 |
| `--xh-date-picker-preset-radius` | `preset` | `border-radius` | `default` | `--xh-shape-control` | date-picker 的 preset 部件 border-radius 覆盖槽。 |
| `--xh-date-picker-time-column-gap` | `time-column` | `gap` | `default` | `--xh-list-option-gap` | date-picker 的 time-column 部件 gap 覆盖槽。 |
| `--xh-date-picker-time-column-h` | `time-column` | `block-size` | `default` | `--xh-viewport-h-sm` | date-picker 的 time-column 部件 block-size 覆盖槽。 |
| `--xh-date-picker-time-column-padding` | `time-column` | `padding` | `default` | `--xh-space-1` | date-picker 的 time-column 部件 padding 覆盖槽。 |
| `--xh-date-picker-time-item-bg-hover` | `time-column`<br>`time-item` | `background` | `is(:hover, :focus-visible)`<br>`not([aria-disabled='true'])` | `--xh-bg-subtle` | date-picker 的 time-column、time-item 部件 background 覆盖槽。 |
| `--xh-date-picker-time-item-check-fg` | `time-item` | `background-color` | `default` | `--xh-_date-picker-check-fg` | date-picker 的 time-item 部件 background-color 覆盖槽。 |
| `--xh-date-picker-time-item-check-size` | `time-item` | `block-size`<br>`inline-size`<br>`inset-inline-end`<br>`padding-inline` | `default` | `--xh-_date-picker-time-item-check-size` | date-picker 的 time-item 部件 block-size、inline-size、inset-inline-end、padding-inline 覆盖槽。 |
| `--xh-date-picker-time-item-fg-selected` | `time-item` | `color` | `state=checked` | `inherit` | date-picker 的 time-item 部件 color 覆盖槽。 |
| `--xh-date-picker-time-item-px` | `time-item` | `inset-inline-end`<br>`padding-inline` | `default` | `--xh-space-3` | date-picker 的 time-item 部件 inset-inline-end、padding-inline 覆盖槽。 |
| `--xh-date-picker-time-item-py` | `time-item` | `padding-block` | `default` | `--xh-space-1` | date-picker 的 time-item 部件 padding-block 覆盖槽。 |
| `--xh-date-picker-time-item-radius` | `time-item` | `border-radius` | `default` | `--xh-shape-control` | date-picker 的 time-item 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `color` · `opacity` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤按视口分档：`min-width: 768px` · `width < 768px`。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[表单字段](./field)。

## 最佳实践

- 区间选择要显示已选天数，用户在挑的往往是"多长"而不是"哪两天"。
- 不可选的日子要给出原因（已约满、超出范围），只置灰用户会反复点。
- 自定义快捷项或时间项时，用 `--xh-date-picker-*-check-size` / `*-check-fg` 调整末端对号；不要重新
  给持久选中铺品牌底，否则会与悬停、焦点以及 Calendar 的日期范围视觉混为一层。

## 反模式

- 默认值是今天却不告诉用户这是默认——他会以为自己已经选过了。
- 浮层一打开就盖住输入框，用户看不见自己输了什么。
