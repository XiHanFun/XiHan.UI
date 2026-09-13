const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 注册全局快捷键 -->
<script setup lang="ts">
import { XhHotkeys } from "@xihan-ui/vue";
import { ref } from "vue";

const count = ref(0);
<\/script>

<template>
  <XhHotkeys :keys="['Mod', 'S']" @hot-key="count += 1" />
  <output>按下 Mod + S · {{ count ? \`已触发 \${count} 次\` : "等待输入" }}</output>
</template>
`;export{n as default};
