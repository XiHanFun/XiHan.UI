const n=`<!-- 命令式服务 | createDialogService 的 confirm 与单按钮预设：一行调用弹出，onOk 返回 Promise 时确认钮自动 pending 并拦住关闭；多次调用排队顺次弹 -->
<script setup lang="ts">
import type { DialogService } from "@xihan-ui/vue";
import { onBeforeUnmount, ref } from "vue";
import { createDialogService, XhButton } from "@xihan-ui/vue";

let modal: DialogService | undefined;
function use(): DialogService {
  modal ??= createDialogService();
  return modal;
}
onBeforeUnmount(() => modal?.dispose());

const lastAnswer = ref("（还没问过）");

async function remove(): Promise<void> {
  const ok = await use().confirm({
    title: "删除工作区",
    content: "删除后 30 天内还能恢复。",
    tone: "danger",
    okText: "删除",
    onOk: () => new Promise((r) => setTimeout(r, 900)),
  });
  lastAnswer.value = ok ? "已删除" : "取消了";
}
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
    <XhButton variant="solid" tone="danger" @click="remove()">删除工作区</XhButton>
    <XhButton
      variant="outline"
      @click="use().error({ title: '同步失败', content: '稍后重试。' })"
    >
      error 告知框
    </XhButton>
    <span>上次答复：{{ lastAnswer }}</span>
  </div>
</template>
`;export{n as default};
