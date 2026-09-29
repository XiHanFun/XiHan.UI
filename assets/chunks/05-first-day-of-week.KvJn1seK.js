const e=`<!-- 周首日 | firstDayOfWeek 单独改周首日：locale 仍是 en-US，月份与星期名照旧是英文，表头与每一行改从星期一排起 -->
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
<\/script>

<template>
  <XhCalendarPickerRoot
    v-slot="{ weeks, weekDays }"
    :default-value="['2026-09-18']"
    default-focused-value="2026-09-13"
    locale="en-US"
    :first-day-of-week="1"
    fixed-weeks
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
</template>
`;export{e as default};
