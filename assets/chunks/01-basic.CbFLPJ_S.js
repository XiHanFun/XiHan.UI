const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 显示当前页面的层级路径 -->
<script setup lang="ts">
import { XhBreadcrumbRoot } from "@xihan-ui/vue";

const items = [
  { value: "home", label: "首页", href: "#/" },
  { value: "components", label: "组件", href: "#/components" },
  { value: "navigation", label: "导航", href: "#/components#navigation" },
  { value: "breadcrumb", label: "面包屑", current: true },
];
<\/script>

<template>
  <XhBreadcrumbRoot :collection="items" />
</template>
`;export{n as default};
