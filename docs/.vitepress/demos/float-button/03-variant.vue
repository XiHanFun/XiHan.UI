<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 变体 | 设置浮动按钮的表面 -->
<script setup lang="ts">
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/vue";

const variants = [undefined, "solid", "subtle", "outline", "ghost"] as const;
</script>

<template>
  <XhFloatButtonRoot v-for="variant in variants" :key="variant ?? 'glass'" style="position: static" :variant="variant">
    <XhFloatButtonTrigger />
    <XhFloatButtonList />
  </XhFloatButtonRoot>
</template>
