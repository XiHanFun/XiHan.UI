<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 旋转与翻转 | 改变图标方向 -->
<script setup lang="ts">
import { ArrowRightIcon } from "@xihan-ui/icons";
import { XhIcon } from "@xihan-ui/vue";
</script>

<template>
  <XhIcon :icon="ArrowRightIcon" size="lg" />
  <XhIcon :icon="ArrowRightIcon" size="lg" :rotate="90" />
  <XhIcon :icon="ArrowRightIcon" size="lg" :rotate="180" />
  <XhIcon :icon="ArrowRightIcon" size="lg" :rotate="270" />
  <XhIcon :icon="ArrowRightIcon" size="lg" flip="horizontal" />
</template>
