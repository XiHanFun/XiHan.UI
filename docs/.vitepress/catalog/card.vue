<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 提供 card 相关实现。 -->

<script setup lang="ts">
import { XhCardContent, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/vue";
</script>

<template>
  <XhCardRoot style="inline-size: 190px">
    <XhCardHeader><XhCardTitle>卡片标题</XhCardTitle></XhCardHeader>
    <XhCardContent>卡片内容</XhCardContent>
  </XhCardRoot>
</template>
