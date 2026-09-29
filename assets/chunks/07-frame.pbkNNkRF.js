const n=`<!-- 底框 | 用 frame 给图标套一层圆形底框 -->
<script setup lang="ts">
import { CheckIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/vue";

const frames = ["solid", "subtle", "outline", "ghost"] as const;
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhIcon v-for="frame in frames" :key="frame" :icon="CheckIcon" :frame="frame" />
  </div>
</template>
`;export{n as default};
