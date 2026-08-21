const r=`<!-- 基础用法 | href 归作者写，末级只多一个 current：它拿到 aria-current="page"、点不动、也不占 Tab 位 -->
<script setup lang="ts">
import {
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhBreadcrumbRoot>
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
</template>
`;export{r as default};
