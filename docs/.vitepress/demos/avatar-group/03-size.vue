<!-- 尺寸 | 直径、字号与叠放量在组上写一次，沿自定义属性下发给组内每个头像，「+N」随之更换 -->
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarGroupOverflowItem, XhAvatarGroupRoot, XhAvatarRoot } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"];
const shown = ["曦", "寒", "懿"];
</script>

<template>
  <div style="display: grid; gap: 16px; justify-items: start">
    <XhAvatarGroupRoot v-for="s in sizes" :key="s" :size="s" :max="3">
      <XhAvatarRoot v-for="m in shown" :key="m">
        <XhAvatarFallback>{{ m }}</XhAvatarFallback>
      </XhAvatarRoot>
      <XhAvatarGroupOverflowItem>+3</XhAvatarGroupOverflowItem>
    </XhAvatarGroupRoot>
  </div>
</template>
