const a=`<!-- 尺寸 | 直径、字号与叠放量在组上写一次，沿自定义属性流给组内每一枚，「+N」跟着一起换 -->
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarGroupOverflow, XhAvatarGroupRoot, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"];
const shown = ["曦", "寒", "懿"];
<\/script>

<template>
  <div style="display: grid; gap: 16px; justify-items: start">
    <XhAvatarGroupRoot v-for="s in sizes" :key="s" :size="s" :max="3">
      <XhAvatarRoot v-for="m in shown" :key="m">
        <XhAvatarImage />
        <XhAvatarFallback>{{ m }}</XhAvatarFallback>
      </XhAvatarRoot>
      <XhAvatarGroupOverflow>+3</XhAvatarGroupOverflow>
    </XhAvatarGroupRoot>
  </div>
</template>
`;export{a as default};
