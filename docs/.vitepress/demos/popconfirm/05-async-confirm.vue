<!-- 异步确认 | @confirm 返回 Promise 即挂起确认门：浮层等兑现才收起、确认按钮转圈且再点无效，落空（reject）留在原地；不必再手动受控拦收起 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhPopconfirmCancelTrigger,
  XhPopconfirmConfirmTrigger,
  XhPopconfirmContent,
  XhPopconfirmDescription,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopconfirmTitle,
  XhPopconfirmTrigger,
} from "@xihan-ui/vue";

const result = ref("尚未提交");

// 返回 Promise：兑现浮层才收；这里用定时器模拟服务端往返
function onConfirm() {
  result.value = "提交中…";
  return new Promise<void>((resolve) => {
    window.setTimeout(() => {
      result.value = "已提交";
      resolve();
    }, 900);
  });
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhPopconfirmRoot v-slot="{ pending }" :on-confirm="onConfirm">
      <XhPopconfirmTrigger>提交审核</XhPopconfirmTrigger>
      <XhPopconfirmPositioner>
        <XhPopconfirmContent>
          <XhPopconfirmTitle>提交后不能再改</XhPopconfirmTitle>
          <XhPopconfirmDescription>
            这份稿件会立刻进入审核队列。
          </XhPopconfirmDescription>
          <XhPopconfirmCancelTrigger>再看看</XhPopconfirmCancelTrigger>
          <XhPopconfirmConfirmTrigger>
            {{ pending ? "提交中…" : "提交" }}
          </XhPopconfirmConfirmTrigger>
        </XhPopconfirmContent>
      </XhPopconfirmPositioner>
    </XhPopconfirmRoot>
    <span>{{ result }}</span>
  </div>
</template>
