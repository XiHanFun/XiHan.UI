<!-- 形态 | outline 为默认卡面，subtle 淡底嵌入，ghost 用于嵌套 -->
<script setup lang="ts">
import { XhCardContent, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/vue";

const variants = ["outline", "subtle", "ghost"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhCardRoot v-for="v in variants" :key="v" :variant="v" style="inline-size: 200px">
      <XhCardHeader>
        <XhCardTitle>{{ v }}</XhCardTitle>
      </XhCardHeader>
      <XhCardContent>一段用来看表面层级的正文。</XhCardContent>
    </XhCardRoot>
  </div>
</template>
