const e=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 变体 | 根据所在表面选择强调层级 -->
<script setup lang="ts">
import { XhCheckbox } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: grid; gap: 12px">
    <XhCheckbox default-checked>主要复选框</XhCheckbox>
    <XhCheckbox variant="secondary" default-checked>次级复选框</XhCheckbox>
  </div>
</template>
`;export{e as default};
