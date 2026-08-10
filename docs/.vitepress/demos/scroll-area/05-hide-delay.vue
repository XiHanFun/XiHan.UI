<!-- 收起的等待 | type 为 scroll 时滚动条停手后不立刻收起，scrollHideDelay 决定还留多少毫秒 -->
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const cases = [
  { delay: 200, label: "200ms：停手就收" },
  { delay: 2000, label: "2000ms：停手后还留两秒" },
];
const lines = Array.from({ length: 20 }, (_, i) => `第 ${i + 1} 行`);
</script>

<template>
  <div style="width: 100%; display: flex; flex-wrap: wrap; gap: 16px">
    <div v-for="item in cases" :key="item.delay" style="display: grid; gap: 6px">
      <span>{{ item.label }}</span>
      <XhScrollAreaRoot
        type="scroll"
        :scroll-hide-delay="item.delay"
        style="block-size: 140px; inline-size: 200px"
      >
        <XhScrollAreaViewport>
          <XhScrollAreaContent style="padding: 8px 12px">
            <p v-for="line in lines" :key="line" style="margin: 0; line-height: 22px">
              {{ line }}
            </p>
          </XhScrollAreaContent>
        </XhScrollAreaViewport>
        <XhScrollAreaScrollbar orientation="vertical">
          <XhScrollAreaThumb />
        </XhScrollAreaScrollbar>
      </XhScrollAreaRoot>
    </div>
  </div>
</template>
