const e=`<!-- 五种粒度 | 天 / 周 / 月 / 季度 / 年一套结构走完：输入行铺哪几段跟着 view 走，标题里的年与月可点，逐级钻上去 -->
<script setup lang="ts">
import type { CalendarView } from "@xihan-ui/headless";
import { ref } from "vue";
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
  XhDatePickerInput,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerNextYearTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerPrevYearTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerWeekDay,
  XhDatePickerWeekNumber,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";

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
<\/script>

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
        <XhDatePickerInput>
          <!-- 「-」与「周」是普通节点，与「年 / 月 / 日」一样由作者写在段位旁边 -->
          <template v-for="(seg, i) in segments" :key="seg.type">
            <span v-if="i > 0">-</span>
            <XhDatePickerSegment :index="i" />
            <span v-if="seg.type === 'week'">周</span>
          </template>
        </XhDatePickerInput>
        <XhDatePickerClearTrigger>✕</XhDatePickerClearTrigger>
      </XhDatePickerControl>
      <XhDatePickerPositioner>
        <XhDatePickerContent>
          <XhDatePickerCalendar v-for="panel in panels" :key="panel.index">
            <XhDatePickerHeader>
              <!-- « 与 » 走大步：日视图一年，粗粒度视图十页 -->
              <XhDatePickerPrevYearTrigger aria-label="快退">«</XhDatePickerPrevYearTrigger>
              <XhDatePickerPrevTrigger aria-label="上一页">‹</XhDatePickerPrevTrigger>
              <XhDatePickerHeading :index="panel.index">
                <!-- 年与月各是一个钮：点年进十年格、点月进月格；到顶那一截自动按不动，
                     没有的那一截自动收起 -->
                <XhDatePickerHeadingYearTrigger :index="panel.index" />
                <XhDatePickerHeadingMonthTrigger :index="panel.index" />
              </XhDatePickerHeading>
              <XhDatePickerNextTrigger aria-label="下一页">›</XhDatePickerNextTrigger>
              <XhDatePickerNextYearTrigger aria-label="快进">»</XhDatePickerNextYearTrigger>
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
`;export{e as default};
