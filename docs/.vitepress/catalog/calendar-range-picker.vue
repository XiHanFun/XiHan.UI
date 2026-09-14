<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 提供 calendar-range-picker 相关实现。 -->

<script setup lang="ts">
import {
  XhCalendarRangePickerCell,
  XhCalendarRangePickerCellTrigger,
  XhCalendarRangePickerGrid,
  XhCalendarRangePickerGridBody,
  XhCalendarRangePickerGridHead,
  XhCalendarRangePickerHeader,
  XhCalendarRangePickerHeading,
  XhCalendarRangePickerRoot,
  XhCalendarRangePickerWeekDay,
  XhCalendarRangePickerWeekRow,
} from "@xihan-ui/vue";
</script>

<template>
  <XhCalendarRangePickerRoot
    v-slot="{ weeks, weekDays }"
    :default-value="['2026-09-15', '2026-09-19']"
    default-focused-value="2026-09-13"
    locale="zh-CN"
    weekday-format="narrow"
    style="max-inline-size: 220px; font-size: 12px"
  >
    <XhCalendarRangePickerHeader>
      <XhCalendarRangePickerHeading />
    </XhCalendarRangePickerHeader>
    <XhCalendarRangePickerGrid>
      <XhCalendarRangePickerGridHead>
        <XhCalendarRangePickerWeekRow>
          <XhCalendarRangePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
        </XhCalendarRangePickerWeekRow>
      </XhCalendarRangePickerGridHead>
      <XhCalendarRangePickerGridBody>
        <XhCalendarRangePickerWeekRow v-for="week in weeks.slice(0, 3)" :key="week[0].start">
          <XhCalendarRangePickerCell v-for="day in week" :key="day.start" :value="day.start">
            <XhCalendarRangePickerCellTrigger>{{ day.day }}</XhCalendarRangePickerCellTrigger>
          </XhCalendarRangePickerCell>
        </XhCalendarRangePickerWeekRow>
      </XhCalendarRangePickerGridBody>
    </XhCalendarRangePickerGrid>
  </XhCalendarRangePickerRoot>
</template>
