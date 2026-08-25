<!-- 语气与尺寸 | tone 决定用哪族颜色——角标现实里主要是未读红点与在线/离线点；size 换的是圆点直径、两位数时的最小宽度与字号 -->
<script setup lang="ts">
import { XhBadge, XhButton } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px">
    <div style="display: flex; align-items: center; gap: 24px">
      <XhBadge v-for="t in tones" :key="t" :count="9" :tone="t">
        <XhButton variant="outline">{{ t }}</XhButton>
      </XhBadge>
    </div>

    <div style="display: flex; align-items: center; gap: 24px">
      <XhBadge v-for="s in sizes" :key="s" :count="88" tone="danger" :size="s">
        <XhButton variant="outline">{{ s }}</XhButton>
      </XhBadge>
    </div>
  </div>
</template>
