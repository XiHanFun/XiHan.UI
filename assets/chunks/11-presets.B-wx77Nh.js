const e=`<!-- 快捷选项 | presets 在列旁边多排一列，点一条整份写进值并收起；时刻在组件外算好再传 -->
<script setup lang="ts">
import { timePickerPresetNow } from "@xihan-ui/headless";
import {
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerInput,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerPresets,
  XhTimePickerRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const value = ref("");

// 时刻算一次就固定下来：connect 每帧都会跑一遍，把「此刻」放进渲染期会每帧算出新值
const presets = computed(() => [
  { label: "此刻", value: timePickerPresetNow() },
  { label: "上午 9 点", value: "09:00" },
  { label: "午休", value: "12:00" },
  { label: "下班", value: "18:00" },
]);
<\/script>

<template>
  <XhTimePickerRoot v-model:value="value" :presets="presets" :step="15">
    <XhTimePickerLabel>提交时刻</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerInput segment="hour" />
      <span>:</span>
      <XhTimePickerInput segment="minute" />
    </XhTimePickerControl>
    <XhTimePickerPositioner>
      <XhTimePickerContent>
        <!-- 不写默认插槽就按 presets 数据自动铺；这一列自己吃方向键，不与时分那两列抢 -->
        <XhTimePickerPresets />
        <XhTimePickerColumn v-slot="{ options }" unit="hour">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="minute">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span style="font-size: 13px">当前值：{{ value || "（空）" }}</span>
</template>
`;export{e as default};
