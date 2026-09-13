<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 区间选择 | selection-mode=range：先落起点再落终点，也可以按住拖过去；两端都落定才写值，Escape 撤掉起点 -->
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
import { computed, ref } from "vue";

const value = ref<string[]>([]);

// 值只在两端都落定时更新；挑到一半的起点记在组件里
const text = computed(() => (value.value.length === 2 ? `${value.value[0]} → ${value.value[1]}` : "（未选）"));
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
        <XhCalendarWeekRow v-for="week in weeks" :key="week[0].start">
          <XhCalendarCell v-for="day in week" :key="day.start" :value="day.start">
            <XhCalendarCellTrigger>{{ day.day }}</XhCalendarCellTrigger>
          </XhCalendarCell>
        </XhCalendarWeekRow>
      </XhCalendarGridBody>
    </XhCalendarGrid>
  </XhCalendarRoot>

  <span style="font-size: 13px">区间：{{ text }}</span>
</template>
