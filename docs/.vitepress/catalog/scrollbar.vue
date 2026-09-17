<script setup lang="ts">
import { XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollable = ref<HTMLElement | null>(null);
</script>

<template>
  <div style="position: relative; inline-size: var(--xh-doc-catalog-w-narrow)">
    <!-- 自绘条的宿主：原生条由 [data-xh-scrollbar] 隐藏，不加 data-xh-scroll -->
    <div ref="scrollable" style="block-size: var(--xh-doc-catalog-h); overflow: auto">
      <div v-for="line in 12" :key="line">第 {{ line }} 行</div>
    </div>
    <XhScrollbarRoot :scrollable="scrollable">
      <XhScrollbarTrack><XhScrollbarThumb /></XhScrollbarTrack>
    </XhScrollbarRoot>
  </div>
</template>
