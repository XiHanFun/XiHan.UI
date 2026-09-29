const e=`<!-- 可约时段 | timeStep 让分列每 15 分钟一格；min / max 带时间段时首尾两天界外的时刻不可选，isTimeUnavailable 再按已选的日子收掉周末的下午 -->
<script setup lang="ts">
import type { TimeColumnUnit, TimeUnavailableContext } from "@xihan-ui/headless";
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerClearTrigger,
  XhDatePickerConfirmTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTimePanel,
  XhDatePickerTrigger,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string[]>(["2026-10-09T10:00"]);

// 周末只接上午：判定收到这份时间所属的日期，时列的值恒按 24 小时制给
function isTimeUnavailable(option: string, unit: TimeColumnUnit, context: TimeUnavailableContext): boolean {
  if (unit !== "hour" || context.date == null)
    return false;
  const day = new Date(\`\${context.date}T00:00:00Z\`).getUTCDay();
  return (day === 0 || day === 6) && Number(option) >= 12;
}

function literalBefore(type: string, index: number): string {
  if (index === 0)
    return "";
  if (type === "hour")
    return " ";
  if (type === "minute")
    return ":";
  return "/";
}
<\/script>

<template>
  <XhDatePickerRoot
    v-slot="{ weeks, weekDays, segments }"
    v-model:value="value"
    show-time
    locale="zh-CN"
    min="2026-10-09T09:00"
    max="2026-10-31T18:00"
    :time-step="{ minute: 15 }"
    :is-time-unavailable="isTimeUnavailable"
  >
    <XhDatePickerLabel>到店时间</XhDatePickerLabel>
    <XhDatePickerControl>
      <XhDatePickerSegmentGroup>
        <template v-for="(segment, index) in segments" :key="segment.type">
          <span v-if="index > 0">{{ literalBefore(segment.type, index) }}</span>
          <XhDatePickerSegment :index="index" />
        </template>
      </XhDatePickerSegmentGroup>
      <XhDatePickerClearTrigger />
      <XhDatePickerTrigger />
    </XhDatePickerControl>
    <XhDatePickerPositioner>
      <XhDatePickerContent>
        <div style="display: flex; align-items: stretch">
          <XhDatePickerCalendar>
            <XhDatePickerHeader>
              <XhDatePickerPrevTrigger aria-label="上个月" />
              <XhDatePickerHeading />
              <XhDatePickerNextTrigger aria-label="下个月" />
            </XhDatePickerHeader>
            <XhDatePickerGrid>
              <XhDatePickerGridHead>
                <XhDatePickerWeekRow>
                  <XhDatePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
                </XhDatePickerWeekRow>
              </XhDatePickerGridHead>
              <XhDatePickerGridBody>
                <XhDatePickerWeekRow v-for="week in weeks" :key="week[0].start">
                  <XhDatePickerCell v-for="day in week" :key="day.start" :value="day.start">
                    <XhDatePickerCellTrigger>{{ day.day }}</XhDatePickerCellTrigger>
                  </XhDatePickerCell>
                </XhDatePickerWeekRow>
              </XhDatePickerGridBody>
            </XhDatePickerGrid>
          </XhDatePickerCalendar>
          <!-- 界外与判为不可用的格留在列里、按不下去，列长不随所选的日子变 -->
          <XhDatePickerTimePanel />
        </div>
        <div style="display: flex; align-items: center; justify-content: flex-end; margin-block-start: var(--xh-space-2); margin-inline: calc(-1 * var(--xh-space-2)); margin-block-end: calc(-1 * var(--xh-space-2)); padding-block: var(--xh-space-1); padding-inline: var(--xh-space-2); border-block-start: var(--xh-stroke-thin) solid var(--xh-border-subtle)">
          <XhDatePickerConfirmTrigger>确定</XhDatePickerConfirmTrigger>
        </div>
      </XhDatePickerContent>
    </XhDatePickerPositioner>
  </XhDatePickerRoot>

  <span style="font-size: 13px">当前值：{{ value[0] ?? "（空）" }}</span>
</template>
`;export{e as default};
