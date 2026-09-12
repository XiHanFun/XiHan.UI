<!-- 尺寸 | 使用小、中、大三档尺寸 -->
<script setup lang="ts">
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <XhFloatButtonRoot v-for="size in sizes" :key="size" style="position: static" :size="size">
    <XhFloatButtonTrigger />
    <XhFloatButtonList />
  </XhFloatButtonRoot>
</template>
