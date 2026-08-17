<!-- 按月 / 季度 / 年挑 | view 只换网格与「一页是多久」；格子的值仍是那段时间的第一天，min/max 与区间逻辑原样复用 -->
<script setup lang="ts">
import type { CalendarView } from "@xihan-ui/headless";
import { ref } from "vue";
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerClearTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerInput,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
} from "@xihan-ui/vue";

const views: { view: CalendarView; label: string }[] = [
  { view: "month", label: "按月" },
  { view: "quarter", label: "按季度" },
  { view: "year", label: "按年" },
];
const values = ref<Record<string, string[]>>({ month: [], quarter: [], year: [] });
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
    <XhDatePickerRoot
      v-for="v in views"
      :key="v.view"
      v-slot="{ panels }"
      v-model:value="values[v.view]"
      :view="v.view"
      locale="zh-CN"
    >
      <XhDatePickerLabel>{{ v.label }}</XhDatePickerLabel>
      <XhDatePickerControl>
        <XhDatePickerInput>
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
              <XhDatePickerPrevTrigger aria-label="上一页">‹</XhDatePickerPrevTrigger>
              <XhDatePickerHeading :index="panel.index" />
              <XhDatePickerNextTrigger aria-label="下一页">›</XhDatePickerNextTrigger>
            </XhDatePickerHeader>
            <!-- 粗粒度视图没有周行那一层：格子直接铺进网格 -->
            <XhDatePickerGrid :index="panel.index">
              <XhDatePickerCell
                v-for="cell in panel.cells"
                :key="cell.value"
                :value="cell.value"
                :index="panel.index"
              >
                <XhDatePickerCellTrigger>{{ cell.label }}</XhDatePickerCellTrigger>
              </XhDatePickerCell>
            </XhDatePickerGrid>
          </XhDatePickerCalendar>
        </XhDatePickerContent>
      </XhDatePickerPositioner>
    </XhDatePickerRoot>
  </div>

  <p style="font-size: 13px">
    值一律是那段时间的第一天：{{ values.month[0] ?? "—" }} ·
    {{ values.quarter[0] ?? "—" }} · {{ values.year[0] ?? "—" }}
  </p>
</template>
