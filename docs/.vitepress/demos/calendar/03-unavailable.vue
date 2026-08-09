<!-- 不可选的日子 | isDateUnavailable 与 min / max 都只挡落值不挡聚焦：方向键照样走得过去 -->
<script setup lang="ts">
import { ref } from "vue";
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

// 今天前后各七天是可选窗口
function shift(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

const min = shift(-7);
const max = shift(7);

// 周末判为不可用
function isWeekend(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const weekday = new Date(y, m - 1, d).getDay();
  return weekday === 0 || weekday === 6;
}
</script>

<template>
  <XhCalendarRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    :min="min"
    :max="max"
    :is-date-unavailable="isWeekend"
    locale="zh-CN"
    weekday-format="narrow"
    fixed-weeks
    style="max-inline-size: 280px"
  >
    <XhCalendarHeader>
      <XhCalendarPrevTrigger aria-label="上个月">‹</XhCalendarPrevTrigger>
      <XhCalendarHeading />
      <XhCalendarNextTrigger aria-label="下个月">›</XhCalendarNextTrigger>
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

  <span style="font-size: 13px">
    可选窗口 {{ min }} ~ {{ max }}，周末除外 · 选中：{{ value[0] ?? "（未选）" }}
  </span>
</template>
