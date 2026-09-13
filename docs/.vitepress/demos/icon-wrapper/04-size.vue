<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 尺寸 | 设置图标块大小 -->
<script setup lang="ts">
import { FolderIcon } from "@xihan-ui/icons";
import { XhIcon, XhIconWrapper } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhIconWrapper v-for="size in sizes" :key="size" :size="size" variant="subtle" tone="brand">
      <XhIcon :icon="FolderIcon" />
    </XhIconWrapper>
  </div>
</template>
