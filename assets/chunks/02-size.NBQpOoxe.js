const e=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 尺寸 | 小、中、大三档 -->
<script setup lang="ts">
import { XhKbdGroup } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 24px">
    <XhKbdGroup :keys="['Mod', '1']" size="sm" />
    <XhKbdGroup :keys="['Mod', '2']" size="md" />
    <XhKbdGroup :keys="['Mod', '3']" size="lg" />
  </div>
</template>
`;export{e as default};
