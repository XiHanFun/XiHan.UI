<!-- 使用者令牌 | 直径、叠放量、分隔那圈底色都留了槽位，写在组上就整组换掉 -->
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarGroupOverflow, XhAvatarGroupRoot, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";

const shown = ["曦", "寒", "懿", "承"];

// 方头像、叠得更深、计数那一枚也跟着换形状
const tokens = {
  "--xh-avatar-group-size": "34px",
  "--xh-avatar-group-overlap": "14px",
  "--xh-avatar-group-radius": "var(--xh-radius-md)",
  "--xh-avatar-radius": "var(--xh-radius-md)",
};
</script>

<template>
  <XhAvatarGroupRoot :max="4" :style="tokens">
    <XhAvatarRoot v-for="m in shown" :key="m">
      <XhAvatarImage />
      <XhAvatarFallback>{{ m }}</XhAvatarFallback>
    </XhAvatarRoot>
    <XhAvatarGroupOverflow>+2</XhAvatarGroupOverflow>
  </XhAvatarGroupRoot>
</template>
