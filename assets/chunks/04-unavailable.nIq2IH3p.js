const e=`<!-- 不可用日期 | 周末不可选，区间允许跨过不可用的日期 -->
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
  const day = new Date(\`\${value}T00:00:00Z\`).getUTCDay();
  return day === 0 || day === 6;
}
<\/script>

<template>
  <XhDateRangePickerRoot
    v-slot="{ weeks, weekDays }"
    :is-date-unavailable="isWeekend"
    allows-non-contiguous-ranges
    locale="zh-CN"
    style="--xh-date-range-picker-control-min-w: calc(var(--xh-control-min-w) * 2 + var(--xh-control-h-md) * 2 + var(--xh-space-6))"
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
`;export{e as default};
