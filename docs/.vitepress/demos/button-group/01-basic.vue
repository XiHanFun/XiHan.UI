<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 组合相关操作 -->
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";

const views = ["照片", "视频", "更多"];
</script>

<template>
  <XhButtonGroup>
    <XhButton v-for="view in views" :key="view">{{ view }}</XhButton>
  </XhButtonGroup>
</template>
