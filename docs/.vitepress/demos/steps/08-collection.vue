<!-- 数据写法 | 只给 collection、不写结构时按标准结构铺：一步一个条目，标题与说明照数据铺，走过的步由皮肤画对号 -->
<script setup lang="ts">
import { XhStepsRoot } from "@xihan-ui/vue";

const steps = [
  { title: "填写地址", description: "收货人与联系方式" },
  { title: "选择支付", description: "支付方式与优惠" },
  { title: "确认订单", description: "核对金额" },
];
</script>

<template>
  <XhStepsRoot :collection="steps" :default-value="1" />
</template>
