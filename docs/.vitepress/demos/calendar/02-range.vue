<!-- 区间选择 | selection-mode=range：第一下落起点、第二下落终点，中间铺一条连续底色 -->
<script setup lang="ts">
import { computed, ref } from "vue";
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

const value = ref<string[]>([]);

// 挑到一半时集合里只有起点一个值
const text = computed(() => {
  if (value.value.length === 0) return "（未选）";
  if (value.value.length === 1) return `${value.value[0]} → 待定`;
  return `${value.value[0]} → ${value.value[1]}`;
});
</script>

<template>
  <XhCalendarRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    locale="zh-CN"
    selection-mode="range"
    fixed-weeks
    style="max-inline-size: 280px"
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

  <span style="font-size: 13px">区间：{{ text }}</span>
</template>
