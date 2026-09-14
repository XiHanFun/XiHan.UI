<!-- 语气 | tone 只换圆环起始边那一段颜色，轨道留在中性描边上，转到哪儿才看得出来 -->
<script setup lang="ts">
import { XhSpinner } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <!-- 语气名写在旁边的普通文字上，转圈自身的可及名字仍是"加载中" -->
  <span
    v-for="t in tones"
    :key="t"
    style="display: inline-flex; align-items: center; gap: 6px"
  >
    <XhSpinner :tone="t" label="加载中" />
    <span style="font-size: 13px">{{ t }}</span>
  </span>
</template>
