<!-- 形态、尺寸与状态 | variant 设置触发器外观，size 取小、中、大三档，disabled 禁止触发下载 -->
<script setup lang="ts">
import { DownloadIcon } from "@xihan-ui/icons";
import { XhDownloadTrigger, XhIcon } from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline", "ghost"] as const;
const labels = { solid: "实心", subtle: "浅色", outline: "线框", ghost: "幽灵" };
const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-4)">
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-2)">
      <XhDownloadTrigger
        v-for="variant in variants"
        :key="variant"
        data="XiHan.UI"
        file-name="xihan-ui.txt"
        :variant="variant"
      >
        <XhIcon :icon="DownloadIcon" /> {{ labels[variant] }}
      </XhDownloadTrigger>
    </div>
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-2)">
      <XhDownloadTrigger
        v-for="size in sizes"
        :key="size"
        data="XiHan.UI"
        file-name="xihan-ui.txt"
        :size="size"
      >
        <XhIcon :icon="DownloadIcon" /> 下载文件
      </XhDownloadTrigger>
    </div>
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-2)">
      <XhDownloadTrigger disabled data="XiHan.UI" file-name="xihan-ui.txt">
        <XhIcon :icon="DownloadIcon" /> 下载文件
      </XhDownloadTrigger>
    </div>
  </div>
</template>
