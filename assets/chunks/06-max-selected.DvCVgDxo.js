const e=`<!-- 限定多选数量 | max-selected=3：选满后其余日子不可再加选，点掉一个即腾出名额 -->
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

const value = ref<string[]>(["2026-09-08", "2026-09-15"]);
<\/script>

<template>
  <XhCalendarPickerRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    default-focused-value="2026-09-13"
    locale="zh-CN"
    selection-mode="multiple"
    :max-selected="3"
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

  <span aria-live="polite" style="font-size: 13px">已选 {{ value.length }} / 3 天：{{ value.join("、") || "（无）" }}</span>
</template>
`;export{e as default};
