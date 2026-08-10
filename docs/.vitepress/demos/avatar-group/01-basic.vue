<!-- 基础用法 | 一排叠放的头像：后一枚压在前一枚上，被压住的边由一圈底色分开 -->
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarGroupRoot, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";

const members = ["曦", "寒", "懿", "承"];
</script>

<template>
  <XhAvatarGroupRoot>
    <XhAvatarRoot v-for="m in members" :key="m">
      <XhAvatarImage />
      <XhAvatarFallback>{{ m }}</XhAvatarFallback>
    </XhAvatarRoot>
  </XhAvatarGroupRoot>
</template>
