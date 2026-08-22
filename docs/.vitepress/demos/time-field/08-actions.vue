<!-- 外部写值与清空 | 值由宿主持有，按钮直接写值；框内自带清空钮，有值才显形，点完焦点回到第一段 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhTimeFieldClearTrigger,
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
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
  <XhTimeFieldRoot
    v-slot="{ empty, outOfRange, setValue }"
    v-model:value="value"
    min="09:00"
    max="18:00"
  >
    <XhTimeFieldLabel>上门时间</XhTimeFieldLabel>
    <XhTimeFieldControl>
      <XhTimeFieldSegmentGroup>
        <XhTimeFieldSegment segment="hour" />
        <span>:</span>
        <XhTimeFieldSegment segment="minute" />
      </XhTimeFieldSegmentGroup>
      <!-- 一段都没填时这颗按钮收起 -->
      <XhTimeFieldClearTrigger />
    </XhTimeFieldControl>

    <div style="display: flex; gap: 8px">
      <XhButton size="sm" variant="outline" @click="setValue(now())">此刻</XhButton>
      <XhButton size="sm" variant="outline" @click="setValue('09:00')">
        开门时间
      </XhButton>
    </div>

    <span style="font-size: 13px">
      {{ empty ? "未填齐" : outOfRange ? "不在营业时段（09:00 – 18:00）" : "可上门" }}
    </span>
  </XhTimeFieldRoot>
</template>
