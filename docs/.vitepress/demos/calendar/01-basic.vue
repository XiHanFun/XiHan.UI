<!-- 基础用法 | 网格由作者照插槽里的 weeks / weekDays 自己渲染，组件一个节点都不替你生成 -->
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

// 选中值恒为数组，单选时长度不超过 1
const value = ref<string[]>([]);
</script>

<template>
  <XhCalendarRoot
    v-slot="{ weeks, weekDays }"
    v-model:value="value"
    locale="zh-CN"
    fixed-weeks
    style="max-inline-size: 280px"
  >
    <XhCalendarHeader>
      <!-- 箭头字符念不出「上个月」，可及名字得自己给 -->
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
        <!-- 格子按日期做 key：翻月时前后两月共有的那几天原地复用，指针底下那一格不被抽走 -->
        <XhCalendarWeekRow v-for="week in weeks" :key="week[0].value">
          <XhCalendarCell v-for="day in week" :key="day.value" :value="day.value">
            <XhCalendarCellTrigger>{{ day.day }}</XhCalendarCellTrigger>
          </XhCalendarCell>
        </XhCalendarWeekRow>
      </XhCalendarGridBody>
    </XhCalendarGrid>
  </XhCalendarRoot>

  <span style="font-size: 13px">选中：{{ value[0] ?? "（未选）" }}</span>
</template>
