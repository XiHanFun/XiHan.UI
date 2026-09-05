<!-- 行尾操作 | extra 贴在整行的末尾，里面放什么按钮由作者决定 -->
<script setup lang="ts">
import {
  XhPageHeaderExtra,
  XhPageHeaderRoot,
  XhPageHeaderDescription,
  XhPageHeaderTitle,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPageHeaderRoot>
    <XhPageHeaderTitle>订单详情</XhPageHeaderTitle>
    <XhPageHeaderDescription>编号 SO-20260731-004</XhPageHeaderDescription>
    <XhPageHeaderExtra>
      <button type="button">导出</button>
      <button type="button">打印</button>
    </XhPageHeaderExtra>
  </XhPageHeaderRoot>
</template>
