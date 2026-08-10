<!-- 异步确认 | 提交期间按钮转圈，Esc 与点遮罩这两条出口一并封住，落定之后才把 open 写回 false -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhButtonIndicator,
  XhButtonLabel,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/vue";

const open = ref(false);
const submitting = ref(false);
const archived = ref(false);

function submit() {
  submitting.value = true;
  setTimeout(() => {
    submitting.value = false;
    archived.value = true;
    open.value = false;
  }, 1200);
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhDialogRoot
      v-model:open="open"
      :close-on-escape="!submitting"
      :close-on-interact-outside="!submitting"
    >
      <XhDialogTrigger>归档这个项目</XhDialogTrigger>
      <XhDialogContent>
        <XhDialogTitle>归档项目</XhDialogTitle>
        <XhDialogDescription>
          {{ submitting ? "正在归档，先别走开。" : "归档后项目转为只读，随时可以恢复。" }}
        </XhDialogDescription>
        <div style="display: flex; justify-content: flex-end; gap: 8px">
          <XhButton variant="ghost" :disabled="submitting" @click="open = false">
            取消
          </XhButton>
          <XhButton variant="solid" :loading="submitting" @click="submit">
            <XhButtonIndicator v-if="submitting" />
            <XhButtonLabel>{{ submitting ? "归档中" : "确认归档" }}</XhButtonLabel>
          </XhButton>
        </div>
      </XhDialogContent>
    </XhDialogRoot>
    <span>{{ archived ? "已归档" : "未归档" }}</span>
  </div>
</template>
