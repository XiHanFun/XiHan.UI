<!-- 地区格式 | 根据 locale 调整日期顺序 -->
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 16px">
    <XhDateFieldRoot default-value="2026-07-28" locale="zh-CN">
      <XhDateFieldLabel>中文格式</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment :index="0" />
          <span>年</span>
          <XhDateFieldSegment :index="1" />
          <span>月</span>
          <XhDateFieldSegment :index="2" />
          <span>日</span>
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>

    <XhDateFieldRoot default-value="2026-07-28" locale="en-US">
      <XhDateFieldLabel>美国格式</XhDateFieldLabel>
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
  </div>
</template>
