<!-- props 写法 | 不写结构时按标准结构铺：触发器、标题、说明与确认文字几个属性写出一个弹出确认；取消钮的文字缺省取语言包 -->
<script setup lang="ts">
import { XhPopconfirmRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const answer = ref("还没答复");
</script>

<template>
  <XhPopconfirmRoot
    trigger-text="删除这条记录"
    title="删除后不可恢复"
    description="这条记录连同它的附件一起清掉。"
    confirm-text="删除"
    @confirm="answer = '已删除'"
    @cancel-press="answer = '已取消'"
  />
  <span data-demo-output>答复：{{ answer }}</span>
</template>
