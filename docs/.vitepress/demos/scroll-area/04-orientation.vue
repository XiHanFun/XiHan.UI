<!-- 只管一条轴 | orientation 关掉的那条轴滚动条恒不显形，视口那一向也不再滚，不留滚不回来的暗格 -->
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const cards = Array.from({ length: 12 }, (_, i) => `卡片 ${i + 1}`);
</script>

<template>
  <XhScrollAreaRoot
    orientation="horizontal"
    type="always"
    style="block-size: 110px; inline-size: 100%; max-inline-size: 420px"
  >
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="display: flex; gap: 10px; padding: 10px 12px">
        <div
          v-for="card in cards"
          :key="card"
          style="
            flex: none;
            display: grid;
            place-items: center;
            inline-size: 96px;
            block-size: 64px;
            border: 1px solid var(--xh-border-subtle);
            border-radius: 8px;
          "
        >
          {{ card }}
        </div>
      </XhScrollAreaContent>
    </XhScrollAreaViewport>
    <XhScrollAreaScrollbar orientation="horizontal">
      <XhScrollAreaThumb />
    </XhScrollAreaScrollbar>
  </XhScrollAreaRoot>
</template>
