<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 提供 calendar-picker 相关实现。 -->

<script setup lang="ts">
import {
  XhCalendarPickerCell,
  XhCalendarPickerCellTrigger,
  XhCalendarPickerGrid,
  XhCalendarPickerGridBody,
  XhCalendarPickerGridHead,
  XhCalendarPickerHeader,
  XhCalendarPickerHeading,
  XhCalendarPickerRoot,
  XhCalendarPickerWeekDay,
  XhCalendarPickerWeekRow,
} from "@xihan-ui/vue";
</script>

<template>
  <XhCalendarPickerRoot
    v-slot="{ weeks, weekDays }"
    default-value="2026-09-18"
    default-focused-value="2026-09-13"
    locale="zh-CN"
    weekday-format="narrow"
    style="max-inline-size: 220px; font-size: 12px"
  >
    <XhCalendarPickerHeader>
      <XhCalendarPickerHeading />
    </XhCalendarPickerHeader>
    <XhCalendarPickerGrid>
      <XhCalendarPickerGridHead>
        <XhCalendarPickerWeekRow>
          <XhCalendarPickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
        </XhCalendarPickerWeekRow>
      </XhCalendarPickerGridHead>
      <XhCalendarPickerGridBody>
        <XhCalendarPickerWeekRow v-for="week in weeks.slice(0, 3)" :key="week[0].start">
          <XhCalendarPickerCell v-for="day in week" :key="day.start" :value="day.start">
            <XhCalendarPickerCellTrigger>{{ day.day }}</XhCalendarPickerCellTrigger>
          </XhCalendarPickerCell>
        </XhCalendarPickerWeekRow>
      </XhCalendarPickerGridBody>
    </XhCalendarPickerGrid>
  </XhCalendarPickerRoot>
</template>
