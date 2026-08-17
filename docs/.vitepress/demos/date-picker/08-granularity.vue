<!-- 五种粒度 | 天 / 周 / 月 / 季度 / 年一套结构走完：view 只换网格与「一页是多久」，值恒是那段时间的第一天 -->
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

// 段位渲染几段由作者定：按年挑就只留年那一段，不必把用不上的段摆出来
const kinds = [
  { key: "day", label: "按天", view: "day" as CalendarView, week: false, segments: 3 },
  { key: "week", label: "按周", view: "day" as CalendarView, week: true, segments: 3 },
  { key: "month", label: "按月", view: "month" as CalendarView, week: false, segments: 2 },
  { key: "quarter", label: "按季度", view: "quarter" as CalendarView, week: false, segments: 2 },
  { key: "year", label: "按年", view: "year" as CalendarView, week: false, segments: 1 },
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
      v-slot="{ panels, weekDays }"
      v-model:value="values[k.key]"
      :view="k.view"
      :week-selection="k.week"
      :selection-mode="k.week ? 'range' : 'single'"
      locale="zh-CN"
    >
      <XhDatePickerLabel>{{ k.label }}</XhDatePickerLabel>
      <XhDatePickerControl>
        <XhDatePickerInput>
          <template v-for="i in k.segments" :key="i">
            <span v-if="i > 1">-</span>
            <XhDatePickerSegment :index="i - 1" />
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
              <XhDatePickerHeading :index="panel.index" />
              <XhDatePickerNextTrigger aria-label="下一页">›</XhDatePickerNextTrigger>
              <XhDatePickerNextYearTrigger aria-label="快进">»</XhDatePickerNextYearTrigger>
            </XhDatePickerHeader>
            <XhDatePickerGrid :index="panel.index">
              <!-- 日视图铺周行，粗粒度视图把格子直接铺进网格 -->
              <template v-if="k.view === 'day'">
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
