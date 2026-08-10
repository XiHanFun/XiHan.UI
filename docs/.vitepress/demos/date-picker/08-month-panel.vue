<!-- 按月选择 | 浮层里换成年份翻页加十二个月，点完写值并收起；输入行只留年、月两段 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerInput,
  XhDatePickerLabel,
  XhDatePickerPositioner,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerTrigger,
} from "@xihan-ui/vue";

const value = ref<string[]>([]);
const year = ref(new Date().getFullYear());

// 写进值的是该月首日，段位上的日那一段不渲染
function firstDay(month: number) {
  return `${year.value}-${`${month}`.padStart(2, "0")}-01`;
}
</script>

<template>
  <XhDatePickerRoot v-slot="{ setValue, setOpen }" v-model:value="value" locale="zh-CN">
    <XhDatePickerLabel>结算月份</XhDatePickerLabel>
    <XhDatePickerControl>
      <XhDatePickerInput>
        <XhDatePickerSegment :index="0" />
        <span>年</span>
        <XhDatePickerSegment :index="1" />
        <span>月</span>
      </XhDatePickerInput>
      <XhDatePickerTrigger>▾</XhDatePickerTrigger>
    </XhDatePickerControl>
    <XhDatePickerPositioner>
      <XhDatePickerContent>
        <div style="display: flex; align-items: center; justify-content: space-between">
          <XhButton size="sm" variant="ghost" aria-label="上一年" @click="year -= 1">
            ‹
          </XhButton>
          <span style="font-size: 13px">{{ year }} 年</span>
          <XhButton size="sm" variant="ghost" aria-label="下一年" @click="year += 1">
            ›
          </XhButton>
        </div>

        <!-- 写值走根插槽给的 setValue，收起走 setOpen -->
        <div
          style="
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-block-start: 12px;
          "
        >
          <XhButton
            v-for="m in 12"
            :key="m"
            size="sm"
            :variant="value[0] === firstDay(m) ? 'solid' : 'ghost'"
            @click="
              setValue([firstDay(m)]);
              setOpen(false);
            "
          >
            {{ m }} 月
          </XhButton>
        </div>
      </XhDatePickerContent>
    </XhDatePickerPositioner>
  </XhDatePickerRoot>

  <span style="font-size: 13px">当前值：{{ value[0] ?? "（未选）" }}</span>
</template>
