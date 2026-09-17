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
  <XhCarouselRoot :slide-count="2" style="inline-size: var(--xh-doc-catalog-w)">
    <XhCarouselViewport style="block-size: calc(var(--xh-doc-catalog-h) - var(--xh-control-h-md))">
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
