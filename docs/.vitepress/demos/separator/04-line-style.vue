<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 变体 | 设置分隔线强度和线型 -->
<script setup lang="ts">
import { XhSeparator } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; grid-template-columns: 64px minmax(0, 1fr); align-items: center; gap: 16px; inline-size: min(480px, 100%)">
    <span>默认</span><XhSeparator decorative />
    <span>弱化</span><XhSeparator decorative variant="subtle" />
    <span>强调</span><XhSeparator decorative variant="strong" />
    <span>虚线</span><XhSeparator decorative dashed />
  </div>
</template>
