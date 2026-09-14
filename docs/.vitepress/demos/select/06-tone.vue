<!-- 语气 | 六种语气 -->
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhSelectRoot
      v-for="t in tones"
      :key="t"
      variant="outline"
      :tone="t"
      :collection="fruits"
      :default-value="['apple']"
      :label="t"
      placeholder="请选择"
    />
  </div>
</template>
