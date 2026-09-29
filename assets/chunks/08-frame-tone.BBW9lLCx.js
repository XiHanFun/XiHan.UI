const n=`<!-- 底框颜色 | tone 同时决定底框与图标的配色 -->
<script setup lang="ts">
import { StarIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/vue";

const tones = ["brand", "success", "warning", "danger", "info"] as const;
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhIcon v-for="tone in tones" :key="tone" :icon="StarIcon" frame="subtle" :tone="tone" />
  </div>
</template>
`;export{n as default};
