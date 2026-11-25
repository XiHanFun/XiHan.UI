<!-- 形态与尺寸 | variant 设置浮动按钮的表面，size 取小、中、大三档 -->
<script setup lang="ts">
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/vue";

const variants = ["outline", "solid", "subtle", "ghost"] as const;
const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: var(--xh-space-4)">
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-4)">
      <XhFloatButtonRoot v-for="variant in variants" :key="variant" style="position: static" :variant="variant">
        <XhFloatButtonTrigger />
        <XhFloatButtonList />
      </XhFloatButtonRoot>
    </div>
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-4)">
      <XhFloatButtonRoot v-for="size in sizes" :key="size" style="position: static" :size="size">
        <XhFloatButtonTrigger />
        <XhFloatButtonList />
      </XhFloatButtonRoot>
    </div>
  </div>
</template>
