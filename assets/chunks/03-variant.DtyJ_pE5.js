const t=`<!-- 变体 | 设置浮动按钮的表面 -->
<script setup lang="ts">
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/vue";

const variants = ["outline", "solid", "subtle", "ghost"] as const;
<\/script>

<template>
  <XhFloatButtonRoot v-for="variant in variants" :key="variant" style="position: static" :variant="variant">
    <XhFloatButtonTrigger />
    <XhFloatButtonList />
  </XhFloatButtonRoot>
</template>
`;export{t as default};
