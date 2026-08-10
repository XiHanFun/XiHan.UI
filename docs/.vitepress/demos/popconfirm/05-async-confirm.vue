<!-- 受控与异步确认 | 传了 open 就由宿主说了算：确认先跑提交，跑完才写回收起 -->
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

const open = ref(false);
const submitting = ref(false);
const result = ref("尚未提交");

// confirm 先到、收起意图后到，所以这里立起的标记来得及拦住那一次收起
function onConfirm() {
  submitting.value = true;
  result.value = "提交中…";
  window.setTimeout(() => {
    submitting.value = false;
    result.value = "已提交";
    open.value = false;
  }, 900);
}

// 提交期间不放行收起：Escape、点外部与确认发出的那一次都按住
function onOpenChange(details: { open: boolean }) {
  if (submitting.value) {
    return;
  }
  open.value = details.open;
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhPopconfirmRoot
      :open="open"
      @open-change="onOpenChange"
      @confirm="onConfirm"
    >
      <XhPopconfirmTrigger>提交审核</XhPopconfirmTrigger>
      <XhPopconfirmPositioner>
        <XhPopconfirmContent>
          <XhPopconfirmTitle>提交后不能再改</XhPopconfirmTitle>
          <XhPopconfirmDescription>
            这份稿件会立刻进入审核队列。
          </XhPopconfirmDescription>
          <XhPopconfirmCancelTrigger>再看看</XhPopconfirmCancelTrigger>
          <XhPopconfirmConfirmTrigger>
            {{ submitting ? "提交中…" : "提交" }}
          </XhPopconfirmConfirmTrigger>
        </XhPopconfirmContent>
      </XhPopconfirmPositioner>
    </XhPopconfirmRoot>
    <span>{{ result }}</span>
  </div>
</template>
