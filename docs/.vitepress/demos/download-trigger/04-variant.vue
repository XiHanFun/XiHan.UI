<!-- 变体 | 设置触发器外观 -->
<script setup lang="ts">
import { DownloadIcon } from "@xihan-ui/icons";
import { XhDownloadTrigger, XhIcon } from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline", "ghost"] as const;
const labels = { solid: "实心", subtle: "浅色", outline: "线框", ghost: "幽灵" };
</script>

<template>
  <XhDownloadTrigger
    v-for="variant in variants"
    :key="variant"
    data="XiHan.UI"
    file-name="xihan-ui.txt"
    :variant="variant"
  >
    <XhIcon :icon="DownloadIcon" /> {{ labels[variant] }}
  </XhDownloadTrigger>
</template>
