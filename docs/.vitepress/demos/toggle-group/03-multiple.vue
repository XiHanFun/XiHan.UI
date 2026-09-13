<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 多选 | 同时选择多个格式 -->
<script setup lang="ts">
import { XhToggleGroupRoot } from "@xihan-ui/vue";

const formats = [
  { value: "bold", label: "B" },
  { value: "italic", label: "I" },
  { value: "underline", label: "U" },
];
</script>

<template>
  <XhToggleGroupRoot :collection="formats" :default-value="['bold']" multiple />
</template>
