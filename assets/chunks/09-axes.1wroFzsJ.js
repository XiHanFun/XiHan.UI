const e=`<!-- 三轴 | variant 决定描边与底怎么画、tone 决定用哪族颜色、size 换几何档；三者只落在 root，浮层里的日历一并跟着换 -->
<script setup lang="ts">
import type { ControlVariant, Size, Tone } from "@xihan-ui/kernel";
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

const variants: ControlVariant[] = ["outline", "subtle", "ghost"];
const tones: Tone[] = ["brand", "success", "danger"];
const sizes: Size[] = ["sm", "md", "lg"];
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <div
      v-for="(row, i) in [variants, tones, sizes]"
      :key="i"
      style="display: flex; flex-wrap: wrap; gap: 16px"
    >
      <XhDatePickerRoot
        v-for="v in row"
        :key="v"
        v-slot="{ weeks, weekDays }"
        :variant="i === 0 ? (v as ControlVariant) : undefined"
        :tone="i === 1 ? (v as Tone) : undefined"
        :size="i === 2 ? (v as Size) : undefined"
        locale="zh-CN"
      >
        <XhDatePickerLabel>{{ v }}</XhDatePickerLabel>
        <XhDatePickerControl>
          <XhDatePickerInput>
            <!-- 段位不写内容：显示什么由组件按当前值填 -->
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
            <XhDatePickerCalendar>
              <XhDatePickerHeader>
                <XhDatePickerPrevTrigger aria-label="上个月"
                  >‹</XhDatePickerPrevTrigger
                >
                <XhDatePickerHeading />
                <XhDatePickerNextTrigger aria-label="下个月"
                  >›</XhDatePickerNextTrigger
                >
              </XhDatePickerHeader>
              <XhDatePickerGrid>
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
                  <!-- v-for 必带 key：就地复用会让承载焦点的那一格换了身份 -->
                  <XhDatePickerWeekRow
                    v-for="week in weeks"
                    :key="week[0].value"
                  >
                    <XhDatePickerCell
                      v-for="day in week"
                      :key="day.value"
                      :value="day.value"
                    >
                      <XhDatePickerCellTrigger>{{
                        day.day
                      }}</XhDatePickerCellTrigger>
                    </XhDatePickerCell>
                  </XhDatePickerWeekRow>
                </XhDatePickerGridBody>
              </XhDatePickerGrid>
            </XhDatePickerCalendar>
          </XhDatePickerContent>
        </XhDatePickerPositioner>
      </XhDatePickerRoot>
    </div>
  </div>
</template>
`;export{e as default};
