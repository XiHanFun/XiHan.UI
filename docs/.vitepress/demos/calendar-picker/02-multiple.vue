<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 多选 | selection-mode=multiple：点一下加进去，再点一下摘掉，集合按日期升序 -->
<script setup lang="ts">
import {
  XhCalendarPickerCell,
  XhCalendarPickerCellTrigger,
  XhCalendarPickerGrid,
  XhCalendarPickerGridBody,
  XhCalendarPickerGridHead,
  XhCalendarPickerHeader,
  XhCalendarPickerHeading,
  XhCalendarPickerNextTrigger,
  XhCalendarPickerPrevTrigger,
  XhCalendarPickerRoot,
  XhCalendarPickerWeekDay,
  XhCalendarPickerWeekRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string[]>(["2026-09-08", "2026-09-15", "2026-09-22"]);
</script>

<template>
  <XhCalendarPickerRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    default-focused-value="2026-09-13"
    locale="zh-CN"
    selection-mode="multiple"
    fixed-weeks
    style="max-inline-size: 280px"
  >
    <XhCalendarPickerHeader>
      <XhCalendarPickerPrevTrigger aria-label="上个月" />
      <XhCalendarPickerHeading />
      <XhCalendarPickerNextTrigger aria-label="下个月" />
    </XhCalendarPickerHeader>
    <XhCalendarPickerGrid>
      <XhCalendarPickerGridHead>
        <XhCalendarPickerWeekRow>
          <XhCalendarPickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
        </XhCalendarPickerWeekRow>
      </XhCalendarPickerGridHead>
      <XhCalendarPickerGridBody>
        <XhCalendarPickerWeekRow v-for="week in weeks" :key="week[0].start">
          <XhCalendarPickerCell v-for="day in week" :key="day.start" :value="day.start">
            <XhCalendarPickerCellTrigger>{{ day.day }}</XhCalendarPickerCellTrigger>
          </XhCalendarPickerCell>
        </XhCalendarPickerWeekRow>
      </XhCalendarPickerGridBody>
    </XhCalendarPickerGrid>
  </XhCalendarPickerRoot>

  <span style="font-size: 13px">已选 {{ value.length }} 天：{{ value.join("、") || "（无）" }}</span>
</template>
