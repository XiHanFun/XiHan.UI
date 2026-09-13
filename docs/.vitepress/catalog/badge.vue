<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 提供 badge 相关实现。 -->

<script setup lang="ts">
import { XhBadge, XhButton } from "@xihan-ui/vue";
</script>

<template>
  <XhBadge :count="8" tone="danger" label="8 条未读">
    <XhButton variant="outline">收件箱</XhButton>
  </XhBadge>
</template>
