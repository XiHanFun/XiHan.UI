<!-- 语气 | tone 换淡底与回退字的配色族；不写 tone 就是中性缺省，直径与字号都不受影响 -->
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";

const tones = [
  { value: "brand", label: "曦" },
  { value: "neutral", label: "中" },
  { value: "success", label: "成" },
  { value: "warning", label: "警" },
  { value: "danger", label: "危" },
  { value: "info", label: "信" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px">
    <!-- 不写 tone 的那一枚：中性缺省 -->
    <XhAvatarRoot>
      <XhAvatarImage />
      <XhAvatarFallback>XH</XhAvatarFallback>
    </XhAvatarRoot>

    <XhAvatarRoot v-for="tone in tones" :key="tone.value" :tone="tone.value">
      <XhAvatarImage />
      <XhAvatarFallback>{{ tone.label }}</XhAvatarFallback>
    </XhAvatarRoot>
  </div>
</template>
