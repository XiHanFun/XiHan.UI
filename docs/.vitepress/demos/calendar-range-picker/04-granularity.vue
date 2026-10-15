<!-- 按周选择 | granularity=week：rows 已按行切好，周视图一行一个整周，每行写一个 week-row；值是两端两周的周首日；月、季度与年同理 -->
<script setup lang="ts">
import {
  XhCalendarRangePickerCell,
  XhCalendarRangePickerCellTrigger,
  XhCalendarRangePickerGrid,
  XhCalendarRangePickerHeader,
  XhCalendarRangePickerHeading,
  XhCalendarRangePickerNextTrigger,
  XhCalendarRangePickerPrevTrigger,
  XhCalendarRangePickerRoot,
  XhCalendarRangePickerWeekRow,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const value = ref<string[]>([]);

// 值只在两端都落定时更新；挑到一半的起点记在组件里
const text = computed(() => (value.value.length === 2 ? `${value.value[0]} → ${value.value[1]}` : "（未选）"));
</script>

<template>
  <XhCalendarRangePickerRoot
    v-slot="{ rows }"
    v-model:value="value"
    locale="zh-CN"
    granularity="week"
    style="max-inline-size: 280px"
  >
    <XhCalendarRangePickerHeader>
      <XhCalendarRangePickerPrevTrigger aria-label="上个月" />
      <XhCalendarRangePickerHeading />
      <XhCalendarRangePickerNextTrigger aria-label="下个月" />
    </XhCalendarRangePickerHeader>
    <!-- 周期格按行收进 week-row：grid 底下得是行，格子落在行里 -->
    <XhCalendarRangePickerGrid>
      <XhCalendarRangePickerWeekRow v-for="row in rows" :key="row[0].key">
        <XhCalendarRangePickerCell v-for="period in row" :key="period.key" :value="period.start">
          <XhCalendarRangePickerCellTrigger>{{ period.label }}</XhCalendarRangePickerCellTrigger>
        </XhCalendarRangePickerCell>
      </XhCalendarRangePickerWeekRow>
    </XhCalendarRangePickerGrid>
  </XhCalendarRangePickerRoot>

  <span style="font-size: 13px">周区间：{{ text }}</span>
</template>
