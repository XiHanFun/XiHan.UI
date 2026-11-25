<!-- 无分隔线 | split 设为 false，段与段之间不画分隔线 -->
<script setup lang="ts">
import { BoldIcon, ItalicIcon, UnderlineIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggleGroupItem, XhToggleGroupRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhToggleGroupRoot :default-value="['bold']" :split="false" multiple>
    <XhToggleGroupItem value="bold" aria-label="粗体"><XhIcon :icon="BoldIcon" /></XhToggleGroupItem>
    <XhToggleGroupItem value="italic" aria-label="斜体"><XhIcon :icon="ItalicIcon" /></XhToggleGroupItem>
    <XhToggleGroupItem value="underline" aria-label="下划线"><XhIcon :icon="UnderlineIcon" /></XhToggleGroupItem>
  </XhToggleGroupRoot>
</template>
