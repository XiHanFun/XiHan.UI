const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 变体 | 设置背景和边框样式 -->
<script setup lang="ts">
import { CheckIcon } from "@xihan-ui/icons";
import { XhIcon, XhIconWrapper } from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline", "ghost"] as const;
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhIconWrapper v-for="variant in variants" :key="variant" :variant="variant">
      <XhIcon :icon="CheckIcon" />
    </XhIconWrapper>
  </div>
</template>
`;export{n as default};
