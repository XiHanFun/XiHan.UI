<!-- 基础用法 | 除了 root，返回位、副标题、操作、页脚都可选；只写用得上的那几段 -->
<script setup lang="ts">
import { XhPageHeaderRoot, XhPageHeaderDescription, XhPageHeaderTitle } from "@xihan-ui/vue";
</script>

<template>
  <XhPageHeaderRoot>
    <XhPageHeaderTitle>订单详情</XhPageHeaderTitle>
    <XhPageHeaderDescription>编号 SO-20260731-004</XhPageHeaderDescription>
  </XhPageHeaderRoot>
</template>
