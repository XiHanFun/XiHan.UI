<!-- props 写法 | 不写结构时按标准结构铺：标题、说明与触发器文字三项写出一个确认对话框；确认动作返回 Promise 时等它落定才收起，期间确定钮转圈 -->
<script setup lang="ts">
import { XhDialogRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const archived = ref(false);

function archive(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      archived.value = true;
      resolve();
    }, 1200);
  });
}
</script>

<template>
  <XhDialogRoot
    trigger-text="归档这个项目"
    title="归档项目"
    description="归档后项目转为只读，随时可以恢复。"
    confirm-text="确认归档"
    @confirm="archive"
  />
  <span data-demo-output>项目状态：{{ archived ? "已归档" : "未归档" }}</span>
</template>
