<!-- 不可用的日期 | allows-non-contiguous-ranges 允许区间跨过周末，只是这些日期不铺设轨道；isDateUnavailable 可得到起点，据此限制区间长度 -->
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
