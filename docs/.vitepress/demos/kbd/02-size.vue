<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 尺寸 | 小、中、大三档 -->
<script setup lang="ts">
import { XhKbd } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhKbd value="S" size="sm" />
    <XhKbd value="S" size="md" />
    <XhKbd value="S" size="lg" />
  </div>
</template>
