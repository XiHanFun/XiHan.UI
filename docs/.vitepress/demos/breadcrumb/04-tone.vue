<!-- 语气 | tone 换的是当前项的文字色，以及可点那几层悬停时的文字色；末级预置为当前项 -->
<script setup lang="ts">
import {
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <div
      v-for="t in tones"
      :key="t"
      style="display: flex; align-items: center; gap: 12px"
    >
      <span style="inline-size: 80px; flex: none; font-size: 12px">{{ t }}</span>
      <XhBreadcrumbRoot :tone="t">
        <XhBreadcrumbList>
          <XhBreadcrumbItem>
            <XhBreadcrumbLink href="#/">首页</XhBreadcrumbLink>
          </XhBreadcrumbItem>
          <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
          <XhBreadcrumbItem>
            <XhBreadcrumbLink href="#/components">组件</XhBreadcrumbLink>
          </XhBreadcrumbItem>
          <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
          <XhBreadcrumbItem>
            <XhBreadcrumbLink href="#/components/breadcrumb" current>
              面包屑
            </XhBreadcrumbLink>
          </XhBreadcrumbItem>
        </XhBreadcrumbList>
      </XhBreadcrumbRoot>
    </div>
  </div>
</template>
