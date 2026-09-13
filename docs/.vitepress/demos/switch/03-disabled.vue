<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 禁用 | disabled 同时挡住指针与键盘，状态机收不到 TOGGLE -->
<script setup lang="ts">
import { XhSwitch } from "@xihan-ui/vue";
</script>

<template>
  <XhSwitch disabled />
  <XhSwitch disabled default-checked />
</template>
