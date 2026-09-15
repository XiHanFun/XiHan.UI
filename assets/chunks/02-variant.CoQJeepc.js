const a=`<!-- 层级 | default、secondary、tertiary 逐级增强表面，transparent 用于嵌套内容 -->
<script setup lang="ts">
import { XhCardContent, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/vue";

const variants = ["default", "secondary", "tertiary", "transparent"] as const;
<\/script>

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
`;export{a as default};
