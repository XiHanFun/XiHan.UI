<!-- props 写法 | 不写结构时按标准结构铺：标题与触发器文字两项，正文另给；页脚的取消与确定照铺，点确定记一次「应用」 -->
<script setup lang="ts">
import { XhDrawerRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const applied = ref(0);
</script>

<template>
  <XhDrawerRoot
    trigger-text="筛选"
    title="筛选条件"
    confirm-text="应用"
    @confirm="applied += 1"
  >
    <template #body>
      <p>只看最近 30 天、状态为进行中的订单。</p>
    </template>
  </XhDrawerRoot>
  <span data-demo-output>已应用 {{ applied }} 次</span>
</template>
