const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 颜色 | 使用语义颜色 -->
<script setup lang="ts">
import { StarIcon } from "@xihan-ui/icons";
import { XhIcon, XhIconWrapper } from "@xihan-ui/vue";

const tones = ["brand", "success", "warning", "danger", "info"] as const;
<\/script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhIconWrapper v-for="tone in tones" :key="tone" variant="subtle" :tone="tone">
      <XhIcon :icon="StarIcon" />
    </XhIconWrapper>
  </div>
</template>
`;export{n as default};
