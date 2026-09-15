const a=`<!-- 基础用法 | 图片加载失败或未提供时落到 fallback -->
<script setup lang="ts">
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <XhAvatarRoot src="/images/logo.png" alt="曦寒">
    <XhAvatarImage />
    <XhAvatarFallback>曦</XhAvatarFallback>
  </XhAvatarRoot>

  <XhAvatarRoot>
    <XhAvatarImage />
    <XhAvatarFallback>XH</XhAvatarFallback>
  </XhAvatarRoot>
</template>
`;export{a as default};
