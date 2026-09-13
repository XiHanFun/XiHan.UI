<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 提供 carousel 相关实现。 -->

<script setup lang="ts">
import {
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselList,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/vue";
</script>

<template>
  <XhCarouselRoot :slide-count="2" style="inline-size: 220px">
    <XhCarouselViewport style="block-size: 96px">
      <XhCarouselList>
        <XhCarouselItem :index="0">
          <strong>设计系统</strong>
        </XhCarouselItem>
        <XhCarouselItem :index="1">
          <strong>跨框架组件</strong>
        </XhCarouselItem>
      </XhCarouselList>
    </XhCarouselViewport>
    <XhCarouselIndicatorGroup>
      <XhCarouselIndicator :index="0" />
      <XhCarouselIndicator :index="1" />
    </XhCarouselIndicatorGroup>
  </XhCarouselRoot>
</template>
