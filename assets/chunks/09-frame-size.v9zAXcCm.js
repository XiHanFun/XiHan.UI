var e=`<!-- 底框尺寸 | sm、md、lg 三档底框与头像同档 -->
<script setup lang="ts">
import { FolderIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhIcon v-for="size in sizes" :key="size" :icon="FolderIcon" :size="size" frame="subtle" tone="brand" />
  </div>
</template>
`;export{e as default};