<script setup lang="ts">
import { XhDateFieldControl, XhDateFieldLabel, XhDateFieldRoot, XhDateFieldSegment, XhDateFieldSegmentGroup } from "@xihan-ui/vue";
</script>

<template>
  <XhDateFieldRoot locale="zh-CN" default-value="2026-09-15">
    <XhDateFieldLabel>截止日期</XhDateFieldLabel>
    <XhDateFieldControl>
      <XhDateFieldSegmentGroup>
        <XhDateFieldSegment :index="0" />
        <span>/</span>
        <XhDateFieldSegment :index="1" />
        <span>/</span>
        <XhDateFieldSegment :index="2" />
      </XhDateFieldSegmentGroup>
    </XhDateFieldControl>
  </XhDateFieldRoot>
</template>
