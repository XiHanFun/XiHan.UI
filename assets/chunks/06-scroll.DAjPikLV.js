const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 滚动 | 固定高度显示长列表 -->
<script setup lang="ts">
import { XhListboxRoot } from "@xihan-ui/vue";

const tracks = Array.from({ length: 12 }, (_, index) => ({
  value: \`track-\${index + 1}\`,
  label: \`曲目 \${String(index + 1).padStart(2, "0")}\`,
}));
<\/script>

<template>
  <XhListboxRoot
    :collection="tracks"
    :default-value="['track-1']"
    label="播放列表"
    style="inline-size: min(100%, 300px); --xh-listbox-content-max-h: 180px"
  />
</template>
`;export{n as default};
