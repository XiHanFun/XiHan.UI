<!-- 精确到分 | granularity=minute 在年月日后面接出时、分两段，值随之带上 T 与时间位 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";

const value = ref<string | null>("2026-07-28T13:45");
</script>

<template>
  <XhDateFieldRoot v-model:value="value" locale="zh-CN" granularity="minute">
    <XhDateFieldLabel>发布时间</XhDateFieldLabel>
    <XhDateFieldControl>
      <XhDateFieldSegmentGroup>
        <!-- 段序仍由 locale 排：前三段是年月日，时分按精度追加在后面 -->
        <XhDateFieldSegment :index="0" />
        <span>年</span>
        <XhDateFieldSegment :index="1" />
        <span>月</span>
        <XhDateFieldSegment :index="2" />
        <span>日</span>
        <span>&nbsp;</span>
        <XhDateFieldSegment :index="3" />
        <span>:</span>
        <XhDateFieldSegment :index="4" />
      </XhDateFieldSegmentGroup>
    </XhDateFieldControl>
  </XhDateFieldRoot>

  <span style="font-size: 13px">当前值：{{ value ?? "（未填齐）" }}</span>
</template>
