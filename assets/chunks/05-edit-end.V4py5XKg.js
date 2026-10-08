var e=`<!-- 只改终点 | activeIndex=1 时起点当锚：点在起点之后只改终点，点在起点之前从那一天重新开始挑 -->
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

const value = ref<string[]>(["2026-10-05", "2026-10-09"]);

// 起点留着，每点一下只改终点
const text = computed(() => (value.value.length === 2 ? \`\${value.value[0]} → \${value.value[1]}\` : "（未选）"));
<\/script>

<template>
  <XhCalendarRangePickerRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    :active-index="1"
    locale="zh-CN"
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
`;export{e as default};