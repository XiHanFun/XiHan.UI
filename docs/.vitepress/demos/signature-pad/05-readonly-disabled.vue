<!-- 只读与禁用 | 只读画好的还看得见但改不动，禁用连清空按钮都按不动；两者都走原生 disabled，不是灰一层了事 -->
<script setup lang="ts">
import {
  XhSignaturePadClearTrigger,
  XhSignaturePadControl,
  XhSignaturePadGuide,
  XhSignaturePadLabel,
  XhSignaturePadRoot,
  XhSignaturePadSegment,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-inline-size: 22rem">
    <XhSignaturePadRoot read-only>
      <XhSignaturePadLabel>只读</XhSignaturePadLabel>
      <XhSignaturePadControl>
        <XhSignaturePadGuide />
        <XhSignaturePadSegment />
      </XhSignaturePadControl>
      <XhSignaturePadClearTrigger>清空</XhSignaturePadClearTrigger>
    </XhSignaturePadRoot>
    <XhSignaturePadRoot disabled>
      <XhSignaturePadLabel>禁用</XhSignaturePadLabel>
      <XhSignaturePadControl>
        <XhSignaturePadGuide />
        <XhSignaturePadSegment />
      </XhSignaturePadControl>
      <XhSignaturePadClearTrigger>清空</XhSignaturePadClearTrigger>
    </XhSignaturePadRoot>
  </div>
</template>
