<!-- 宽度充满 | 按钮等分可用宽度 -->
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";
</script>

<template>
  <div style="inline-size: min(100%, 420px)">
    <XhButtonGroup full-width>
      <XhButton>上一页</XhButton>
      <XhButton>下一页</XhButton>
    </XhButtonGroup>
  </div>
</template>
