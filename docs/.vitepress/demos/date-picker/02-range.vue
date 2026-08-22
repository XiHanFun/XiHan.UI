<!-- 区间选择 | 五种粒度都能挑区间：默认并排两个连续页，翻页整窗一起走；« » 走大步 -->
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
  XhDatePickerSegmentGroup,
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
  if (v.length === 0) return "（未选）";
  if (v.length === 1) return `${v[0]}（另一端待定）`;
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
          <XhDatePickerCalendar v-for="panel in panels" :key="panel.index">
            <XhDatePickerHeader>
              <!-- 往前只在最左那张、往后只在最右那张：整窗一起走 -->
              <XhDatePickerPrevYearTrigger v-if="panel.index === 0" aria-label="快退">
                «
              </XhDatePickerPrevYearTrigger>
              <XhDatePickerPrevTrigger v-if="panel.index === 0" aria-label="上一页" />
              <XhDatePickerHeading :index="panel.index" />
              <XhDatePickerNextTrigger v-if="panel.index === panels.length - 1" aria-label="下一页" />
              <XhDatePickerNextYearTrigger
                v-if="panel.index === panels.length - 1"
                aria-label="快进"
              >
                »
              </XhDatePickerNextYearTrigger>
            </XhDatePickerHeader>
            <XhDatePickerGrid :index="panel.index">
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

      <span style="font-size: 13px">{{ text(values[k.key]) }}</span>
    </XhDatePickerRoot>
  </div>
</template>
