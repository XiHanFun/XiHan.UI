const e=`<!-- 多选成标签 | selectionMode="multiple" 时各列拼出的是草稿，按「添加」收进值、浮层不收，可以接着添；选中的时刻在输入行里排成标签，点叉或在展开钮上按退格摘掉 -->
<script setup lang="ts">
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerConfirmTrigger,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerHiddenInput,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerTagList,
  XhTimePickerTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string[]>(["09:00", "14:30"]);
<\/script>

<template>
  <XhTimePickerRoot
    v-model:value="value"
    name="reminders"
    selection-mode="multiple"
    :time-step="{ minute: 15 }"
  >
    <XhTimePickerLabel>提醒时刻</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerTagList />
      <XhTimePickerClearTrigger />
      <XhTimePickerTrigger />
    </XhTimePickerControl>
    <XhTimePickerHiddenInput />
    <XhTimePickerPositioner>
      <XhTimePickerContent>
        <XhTimePickerColumn v-slot="{ options }" unit="hour">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <XhTimePickerColumn v-slot="{ options }" unit="minute">
          <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
        </XhTimePickerColumn>
        <XhTimePickerConfirmTrigger>添加</XhTimePickerConfirmTrigger>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span aria-live="polite" style="font-size: 13px">
    当前值：{{ value.join("、") || "（空）" }}
  </span>
</template>
`;export{e as default};
