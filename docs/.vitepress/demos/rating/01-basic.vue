<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 不传 value 即为非受控，组件自己维护评分；default-value 只决定初始那一档 -->
<script setup lang="ts">
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhRatingRoot v-slot="{ items }" :default-value="3">
    <XhRatingLabel>整体满意度</XhRatingLabel>
    <XhRatingControl>
      <XhRatingItem v-for="i in items" :key="i" :value="i" />
    </XhRatingControl>
  </XhRatingRoot>
</template>
