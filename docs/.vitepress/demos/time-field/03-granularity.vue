<!-- 精度到秒 | granularity=second 让秒段显出来并参与值，空段按上下键从该段边界起步 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/vue";

const value = ref("");
</script>

<template>
  <XhTimeFieldRoot v-model:value="value" granularity="second">
    <XhTimeFieldLabel>定时</XhTimeFieldLabel>
    <XhTimeFieldControl>
      <XhTimeFieldSegmentGroup>
        <XhTimeFieldSegment segment="hour" />
        <span>:</span>
        <XhTimeFieldSegment segment="minute" />
        <span>:</span>
        <XhTimeFieldSegment segment="second" />
      </XhTimeFieldSegmentGroup>
    </XhTimeFieldControl>
  </XhTimeFieldRoot>

  <span style="font-size: 13px">当前值：{{ value || "（未填齐）" }}</span>
</template>
