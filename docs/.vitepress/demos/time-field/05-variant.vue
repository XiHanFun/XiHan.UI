<!-- 形态 | variant 只改分段框的底色与描边用法，分段结构与键盘行为都不变 -->
<script setup lang="ts">
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
</script>

<template>
  <div style="display: grid; gap: 16px; justify-items: start">
    <XhTimeFieldRoot v-for="v in variants" :key="v" :variant="v" default-value="09:30">
      <XhTimeFieldLabel>{{ v }}</XhTimeFieldLabel>
      <XhTimeFieldControl>
        <XhTimeFieldSegmentGroup>
          <XhTimeFieldSegment segment="hour" />
          <span>:</span>
          <XhTimeFieldSegment segment="minute" />
        </XhTimeFieldSegmentGroup>
      </XhTimeFieldControl>
    </XhTimeFieldRoot>
  </div>
</template>
