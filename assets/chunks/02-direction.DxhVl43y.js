const n=`<!-- 方向 | 四档：左右走横轴，上下走纵轴。轴另落成 data-orientation，竖着滚的窗口靠 --xh-marquee-block-size 定高 -->
<script setup lang="ts">
import { XhMarqueeContent, XhMarqueeRoot } from "@xihan-ui/vue";

const directions = ["left", "right", "up", "down"] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <div v-for="d in directions" :key="d" style="inline-size: 200px">
      <p style="margin-block-end: 8px; font-size: 12px">{{ d }}</p>
      <XhMarqueeRoot
        :direction="d"
        style="
          --xh-marquee-block-size: 5rem;
          border: 1px solid var(--xh-border-default);
          border-radius: 6px;
        "
      >
        <XhMarqueeContent>
          <span v-for="i in 6" :key="i" style="padding: 4px 12px; white-space: nowrap">
            第 {{ i }} 条公告
          </span>
        </XhMarqueeContent>
      </XhMarqueeRoot>
    </div>
  </div>
</template>
`;export{n as default};
