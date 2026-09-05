<!-- 浮层里的操作按钮 | 列表下面这排按钮是作者自己的节点，键盘事件在它这一层收口，不再上交给列表 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
  XhTimePickerLabel,
  XhTimePickerItem,
  XhTimePickerPositioner,
  XhTimePickerRoot,
} from "@xihan-ui/vue";

const value = ref("");

// 此刻的时分，两位补零
function now() {
  const d = new Date();
  const h = `${d.getHours()}`.padStart(2, "0");
  const m = `${d.getMinutes()}`.padStart(2, "0");
  return `${h}:${m}`;
}
</script>

<template>
  <XhTimePickerRoot
    v-slot="{ canClear, setValue, clear, setOpen }"
    v-model:value="value"
    :step="15"
  >
    <XhTimePickerLabel>提交时刻</XhTimePickerLabel>
    <XhTimePickerControl>
      <XhTimePickerSegmentGroup>
        <XhTimePickerSegment segment="hour" />
        <span>:</span>
        <XhTimePickerSegment segment="minute" />
      </XhTimePickerSegmentGroup>
    </XhTimePickerControl>
    <XhTimePickerPositioner>
      <!-- 面板默认把列横排，改成竖排才放得下下面这一排按钮 -->
      <XhTimePickerContent style="flex-direction: column; gap: 8px">
        <div style="display: flex">
          <XhTimePickerColumn v-slot="{ options }" unit="hour">
            <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimePickerColumn>
          <XhTimePickerColumn v-slot="{ options }" unit="minute">
            <XhTimePickerItem v-for="o in options" :key="o" :value="o" />
          </XhTimePickerColumn>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px" @keydown.stop>
          <XhButton size="sm" variant="ghost" @click="setValue(now())">此刻</XhButton>
          <XhButton size="sm" variant="ghost" :disabled="!canClear" @click="clear()">
            清空
          </XhButton>
          <XhButton size="sm" @click="setOpen(false)">确定</XhButton>
        </div>
      </XhTimePickerContent>
    </XhTimePickerPositioner>
  </XhTimePickerRoot>

  <span style="font-size: 13px">当前值：{{ value || "（空）" }}</span>
</template>
