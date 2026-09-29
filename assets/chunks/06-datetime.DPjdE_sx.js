const e=`<!-- 日期加时间 | showTime 让起止都带上时刻，defaultTime 在只点日期时补 00:00:00 与 23:59:59；起止同一天时终点早于起点的时刻不可选，由确认钮收口 -->
<script setup lang="ts">
import {
  XhDateRangePickerCalendar,
  XhDateRangePickerCell,
  XhDateRangePickerCellTrigger,
  XhDateRangePickerClearTrigger,
  XhDateRangePickerConfirmTrigger,
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
  XhDateRangePickerTimePanel,
  XhDateRangePickerTrigger,
  XhDateRangePickerWeekDay,
  XhDateRangePickerWeekRow,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const value = ref<string[]>([]);
// 两组时间列的名字与小标题
const translations = { startTime: "开始时间", endTime: "结束时间", hour: "时", minute: "分", second: "秒" };
const text = computed(() => (value.value[0] && value.value[1] ? \`\${value.value[0]} → \${value.value[1]}\` : "（未填齐）"));

function literalBefore(type: string, index: number): string {
  if (index === 0)
    return "";
  if (type === "hour")
    return " ";
  if (type === "minute" || type === "second")
    return ":";
  return "/";
}
<\/script>

<template>
  <XhDateRangePickerRoot
    v-slot="{ weeks, weekDays, segments, endSegments }"
    v-model:value="value"
    locale="zh-CN"
    show-time
    time-granularity="second"
    :default-time="['00:00:00', '23:59:59']"
    :translations="translations"
  >
    <XhDateRangePickerLabel>查询区间</XhDateRangePickerLabel>
    <XhDateRangePickerControl>
      <XhDateRangePickerSegmentGroup :index="0">
        <template v-for="(segment, index) in segments" :key="segment.type">
          <span v-if="index > 0">{{ literalBefore(segment.type, index) }}</span>
          <XhDateRangePickerSegment :index="index" />
        </template>
      </XhDateRangePickerSegmentGroup>
      <XhDateRangePickerRangeSeparator />
      <XhDateRangePickerSegmentGroup :index="1">
        <template v-for="(segment, index) in endSegments" :key="segment.type">
          <span v-if="index > 0">{{ literalBefore(segment.type, index) }}</span>
          <XhDateRangePickerSegment :index="index" />
        </template>
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
        <!-- 起止各一组时间列，组顶的小标题取 translations.startTime / endTime；每组按不下去的格留在列里 -->
        <XhDateRangePickerTimePanel />
        <XhDateRangePickerConfirmTrigger>确定</XhDateRangePickerConfirmTrigger>
      </XhDateRangePickerContent>
    </XhDateRangePickerPositioner>
  </XhDateRangePickerRoot>

  <span aria-live="polite" style="font-size: 13px">当前值：{{ text }}</span>
</template>
`;export{e as default};
