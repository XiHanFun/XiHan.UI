<!-- 等宽数字 | 数值用等宽数字排版，反复换数时字宽不变，后面的单位不会左右挪 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhStatisticLabel,
  XhStatisticRoot,
  XhStatisticSuffix,
  XhStatisticValue,
} from "@xihan-ui/vue";

const amount = ref("1,111.11");

// 每次换一组随机数字，位数固定，只有字形在变
function reroll() {
  const digit = () => String(Math.floor(Math.random() * 10));
  amount.value = `${digit()},${digit()}${digit()}${digit()}.${digit()}${digit()}`;
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 24px">
    <XhStatisticRoot>
      <XhStatisticLabel>今日成交额</XhStatisticLabel>
      <XhStatisticValue>{{ amount }}</XhStatisticValue>
      <XhStatisticSuffix>元</XhStatisticSuffix>
    </XhStatisticRoot>

    <button type="button" @click="reroll">换一组数字</button>
  </div>
</template>
