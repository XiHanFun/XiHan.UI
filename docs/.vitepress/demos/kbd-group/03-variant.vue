<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 外观 | default 使用中性底，light 保持透明；两档共享同一组键名与读屏名称 -->
<script setup lang="ts">
import { XhKbdGroup } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; gap: 12px">
    <XhKbdGroup :keys="['Mod', 'K']" />
    <XhKbdGroup :keys="['Mod', 'K']" variant="light" />
  </div>
</template>
