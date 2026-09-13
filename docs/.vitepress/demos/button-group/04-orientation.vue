<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 方向 | 水平或垂直排列 -->
<script setup lang="ts">
import { XhButton, XhButtonGroup } from "@xihan-ui/vue";

const actions = ["复制", "剪切", "粘贴"];
</script>

<template>
  <div style="display: flex; align-items: flex-start; gap: 24px">
    <XhButtonGroup>
      <XhButton v-for="action in actions" :key="action">{{ action }}</XhButton>
    </XhButtonGroup>

    <XhButtonGroup orientation="vertical">
      <XhButton v-for="action in actions" :key="action">{{ action }}</XhButton>
    </XhButtonGroup>
  </div>
</template>
