<!-- 按周挑 | granularity=week：一行一个整周，值是两端那两周的周首日；月、季度与年同理 -->
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

// 值只在两端都落定时更新；挑到一半的起点记在组件里
const text = computed(() => (value.value.length === 2 ? `${value.value[0]} → ${value.value[1]}` : "（未选）"));
</script>

<template>
  <XhCalendarRangePickerRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    locale="zh-CN"
    granularity="week"
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

  <span style="font-size: 13px">周区间：{{ text }}</span>
</template>
