<!-- 分隔线与页脚 | bordered 在底部画一条线，footer 整行另起，装描述或一组摘要 -->
<script setup lang="ts">
import {
  XhPageHeaderExtra,
  XhPageHeaderFooter,
  XhPageHeaderRoot,
  XhPageHeaderTitle,
} from "@xihan-ui/vue";
</script>

<template>
  <XhPageHeaderRoot bordered>
    <XhPageHeaderTitle>七月账单</XhPageHeaderTitle>
    <XhPageHeaderExtra>
      <button type="button">去支付</button>
    </XhPageHeaderExtra>
    <XhPageHeaderFooter>账期 7 月 1 日至 7 月 31 日，共 128 笔，合计 3,240.00 元。</XhPageHeaderFooter>
  </XhPageHeaderRoot>
</template>
