const e=`<!-- 基础用法 | 选择日期 -->
<script setup lang="ts">
import {
  XhCalendarCell,
  XhCalendarCellTrigger,
  XhCalendarGrid,
  XhCalendarGridBody,
  XhCalendarGridHead,
  XhCalendarHeader,
  XhCalendarHeading,
  XhCalendarNextTrigger,
  XhCalendarPrevTrigger,
  XhCalendarRoot,
  XhCalendarWeekDay,
  XhCalendarWeekRow,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhCalendarRoot
    v-slot="{ weeks, weekDays }"
    :default-value="['2026-09-18']"
    default-focused-value="2026-09-13"
    locale="zh-CN"
    fixed-weeks
  >
    <XhCalendarHeader>
      <XhCalendarPrevTrigger aria-label="上个月" />
      <XhCalendarHeading />
      <XhCalendarNextTrigger aria-label="下个月" />
    </XhCalendarHeader>
    <XhCalendarGrid>
      <XhCalendarGridHead>
        <XhCalendarWeekRow>
          <XhCalendarWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
        </XhCalendarWeekRow>
      </XhCalendarGridHead>
      <XhCalendarGridBody>
        <XhCalendarWeekRow v-for="week in weeks" :key="week[0].value">
          <XhCalendarCell v-for="day in week" :key="day.value" :value="day.value">
            <XhCalendarCellTrigger>{{ day.day }}</XhCalendarCellTrigger>
          </XhCalendarCell>
        </XhCalendarWeekRow>
      </XhCalendarGridBody>
    </XhCalendarGrid>
  </XhCalendarRoot>
</template>
`;export{e as default};
