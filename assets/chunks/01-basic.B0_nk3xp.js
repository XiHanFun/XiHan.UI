const e=`<!-- 基础用法 | 输入或选择起止日期 -->
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
<\/script>

<template>
  <XhDateRangePickerRoot
    v-slot="{ weeks, weekDays }"
    locale="zh-CN"
    name="trip-start"
    end-name="trip-end"
    style="--xh-date-range-picker-control-min-w: calc(var(--xh-control-min-w) * 2 + var(--xh-control-h-md) * 2 + var(--xh-space-6))"
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
`;export{e as default};
