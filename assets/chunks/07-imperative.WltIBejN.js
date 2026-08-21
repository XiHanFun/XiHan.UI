const n=`<!-- 命令式确认框 | 一次函数调用把描述符推进表里并展开对话框；拿回的对象随后可改标题、正文与按钮状态，表里就是当前所有实例 -->
<script setup lang="ts">
import { reactive, ref } from "vue";
import {
  XhButton,
  XhButtonIndicator,
  XhButtonLabel,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
} from "@xihan-ui/vue";

interface Spec {
  id: number;
  title: string;
  text: string;
  confirmLabel: string;
  loading: boolean;
}

const specs = reactive<Spec[]>([]);
const current = ref<Spec | null>(null);
const open = ref(false);
let seq = 0;

// 一行调用：造描述符、入表、置为当前并展开，最后把它交回调用方
function ask(title: string, text: string): Spec {
  seq += 1;
  const spec = reactive<Spec>({ id: seq, title, text, confirmLabel: "确认", loading: false });
  specs.push(spec);
  current.value = spec;
  open.value = true;
  return spec;
}

// 改的是描述符本身，对话框跟着变
function submit(): void {
  const spec = current.value;
  if (!spec) return;
  spec.loading = true;
  spec.confirmLabel = "提交中";
  spec.text = "正在提交，稍等一下。";
  setTimeout(() => {
    spec.loading = false;
    spec.confirmLabel = "确认";
    spec.text = "这次已经提交完成。";
    open.value = false;
  }, 1200);
}
<\/script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <XhButton variant="solid" @click="ask('删除工作区', '删除后 30 天内还能恢复。')">
        删除工作区
      </XhButton>
      <XhButton
        variant="outline"
        @click="ask('导出数据', '导出任务在后台跑，完成后发一条通知。')"
      >
        导出数据
      </XhButton>
    </div>

    <ol style="display: grid; gap: 4px; margin: 0; padding-inline-start: 20px">
      <li v-for="spec in specs" :key="spec.id">
        {{ spec.title }} — {{ spec.loading ? "提交中" : "空闲" }}
      </li>
      <li v-if="specs.length === 0">（还没有描述符）</li>
    </ol>

    <XhDialogRoot
      v-model:open="open"
      :close-on-escape="!current?.loading"
      :close-on-interact-outside="!current?.loading"
    >
      <XhDialogContent v-if="current">
        <XhDialogTitle>{{ current.title }}</XhDialogTitle>
        <XhDialogDescription>{{ current.text }}</XhDialogDescription>
        <div style="display: flex; justify-content: flex-end; gap: 8px">
          <XhButton variant="ghost" :disabled="current.loading" @click="open = false">
            取消
          </XhButton>
          <XhButton variant="solid" :loading="current.loading" @click="submit">
            <XhButtonIndicator v-if="current.loading" />
            <XhButtonLabel>{{ current.confirmLabel }}</XhButtonLabel>
          </XhButton>
        </div>
      </XhDialogContent>
    </XhDialogRoot>
  </div>
</template>
`;export{n as default};
