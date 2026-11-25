<!-- 形态与尺寸 | variant 只换外框：outline 带描边与底色，subtle 淡底无描边，ghost 去掉外框与底色；size 三档只改变字号与层级缩进，行的结构与配色都不变 -->
<script setup lang="ts">
import { XhJsonViewerRoot } from "@xihan-ui/vue";

const payload = { id: 7, label: "曦寒", nested: { ok: true } };
const variants = ["outline", "subtle", "ghost"] as const;
const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-4); inline-size: 100%; max-inline-size: 420px">
    <div style="display: grid; gap: var(--xh-space-3)">
      <XhJsonViewerRoot
        v-for="variant in variants"
        :key="variant"
        :value="payload"
        :default-expanded-depth="2"
        :variant="variant"
      />
    </div>

    <div style="display: grid; gap: var(--xh-space-3)">
      <XhJsonViewerRoot
        v-for="size in sizes"
        :key="size"
        :value="payload"
        :default-expanded-depth="2"
        :size="size"
      />
    </div>
  </div>
</template>
