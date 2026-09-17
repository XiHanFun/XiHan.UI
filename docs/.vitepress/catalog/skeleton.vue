<script setup lang="ts">
import { XhSkeletonItem, XhSkeletonRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhSkeletonRoot style="inline-size: var(--xh-doc-catalog-w)">
    <XhSkeletonItem shape="rect" style="--xh-skeleton-rect-block-size: 72px" />
    <XhSkeletonItem style="inline-size: 70%" />
    <XhSkeletonItem style="inline-size: 45%" />
  </XhSkeletonRoot>
</template>
