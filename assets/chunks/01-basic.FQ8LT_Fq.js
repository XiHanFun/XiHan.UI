const n=`<!-- 基础用法 | 创建等宽列 -->
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const tones = ["brand", "info", "success"] as const;
<\/script>

<template>
  <XhGridRoot :cols="3" gap="md" aria-label="三列等宽占位区块" style="inline-size: min(600px, 100%)">
    <XhGridItem v-for="tone in tones" :key="tone">
      <span data-demo-block :data-tone="tone" style="--xh-demo-block-block-size: 96px" />
    </XhGridItem>
  </XhGridRoot>
</template>
`;export{n as default};
