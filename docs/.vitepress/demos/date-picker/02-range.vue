<!-- 区间选择 | 默认并排两个连续月：起止常跨月，一个面板要来回翻页才挑得完。翻页整窗一起走一个月 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerClearTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerInput,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";

const value = ref<string[]>([]);

// 两组段位各自的读屏名字，区间模式下替掉指向 label 的那份
const translations = { startDate: "开始日期", endDate: "结束日期" };

const text = computed(() => {
  if (value.value.length === 0) return "（未选）";
  // 对外的值滤掉了空缺那一端，只剩一个值时不分起止
  if (value.value.length === 1) return `${value.value[0]}（另一端待定）`;
  return `${value.value[0]} → ${value.value[1]}`;
});
</script>

<template>
  <XhDatePickerRoot
    v-slot="{ panels, weekDays }"
    v-model:value="value"
    :translations="translations"
    locale="zh-CN"
    selection-mode="range"
  >
    <XhDatePickerLabel>起止日期</XhDatePickerLabel>
    <XhDatePickerControl>
      <!-- 组号定这组段位认领哪一端：0 起点、1 终点 -->
      <XhDatePickerInput :index="0">
        <XhDatePickerSegment :index="0" />
        <span>-</span>
        <XhDatePickerSegment :index="1" />
        <span>-</span>
        <XhDatePickerSegment :index="2" />
      </XhDatePickerInput>
      <!-- 装饰性分隔符，不进读屏 -->
      <span aria-hidden="true">→</span>
      <XhDatePickerInput :index="1">
        <XhDatePickerSegment :index="0" />
        <span>-</span>
        <XhDatePickerSegment :index="1" />
        <span>-</span>
        <XhDatePickerSegment :index="2" />
      </XhDatePickerInput>
      <XhDatePickerClearTrigger>✕</XhDatePickerClearTrigger>
    </XhDatePickerControl>
    <XhDatePickerPositioner>
      <XhDatePickerContent>
        <XhDatePickerCalendar v-for="panel in panels" :key="panel.index">
          <XhDatePickerHeader>
            <!-- 往前只在最左那张、往后只在最右那张：整窗一起走，两张各摆一套会让人以为能各翻各的 -->
            <XhDatePickerPrevTrigger v-if="panel.index === 0" aria-label="上个月">‹</XhDatePickerPrevTrigger>
            <XhDatePickerHeading :index="panel.index" />
            <XhDatePickerNextTrigger v-if="panel.index === panels.length - 1" aria-label="下个月">›</XhDatePickerNextTrigger>
          </XhDatePickerHeader>
          <XhDatePickerGrid :index="panel.index">
            <XhDatePickerGridHead>
              <XhDatePickerWeekRow>
                <XhDatePickerWeekDay
                  v-for="d in weekDays"
                  :key="d.value"
                  :value="d.value"
                />
              </XhDatePickerWeekRow>
            </XhDatePickerGridHead>
            <XhDatePickerGridBody>
              <XhDatePickerWeekRow v-for="week in panel.weeks" :key="week[0].value">
                <!-- index 必须给：同一天会同时出现在两个面板里，是不是本月要连着面板一起判 -->
                <XhDatePickerCell
                  v-for="day in week"
                  :key="day.value"
                  :value="day.value"
                  :index="panel.index"
                >
                  <XhDatePickerCellTrigger>{{ day.day }}</XhDatePickerCellTrigger>
                </XhDatePickerCell>
              </XhDatePickerWeekRow>
            </XhDatePickerGridBody>
          </XhDatePickerGrid>
        </XhDatePickerCalendar>
      </XhDatePickerContent>
    </XhDatePickerPositioner>
  </XhDatePickerRoot>

  <span style="font-size: 13px">已选区间：{{ text }}</span>
</template>
