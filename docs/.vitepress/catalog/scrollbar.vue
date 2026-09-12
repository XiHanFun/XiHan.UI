<script setup lang="ts">
import { XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollable = ref<HTMLElement | null>(null);
</script>

<template>
  <div style="position: relative; inline-size: 180px">
    <div ref="scrollable" style="block-size: 96px; overflow: auto; scrollbar-width: none">
      <div v-for="line in 8" :key="line">第 {{ line }} 行</div>
    </div>
    <XhScrollbarRoot :scrollable="scrollable" type="always">
      <XhScrollbarTrack><XhScrollbarThumb /></XhScrollbarTrack>
    </XhScrollbarRoot>
  </div>
</template>
