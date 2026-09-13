const e=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 尺寸 | 适配不同的界面密度 -->
<script setup lang="ts">
import { XhCheckbox } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhCheckbox size="sm" default-checked>小</XhCheckbox>
    <XhCheckbox default-checked>中</XhCheckbox>
    <XhCheckbox size="lg" default-checked>大</XhCheckbox>
  </div>
</template>
`;export{e as default};
