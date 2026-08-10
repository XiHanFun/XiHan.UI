<!-- 手动上传与进度 | 传输整件事在宿主手里：file-accept 报来本批收下了谁，宿主以 File 为键记状态、进度与完成后的名字，再自己挑时机发起 -->
<script setup lang="ts">
import type { CSSProperties } from "vue";
import { onBeforeUnmount, ref } from "vue";
import {
  XhButton,
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemGroup,
  XhFileUploadItemName,
  XhFileUploadLabel,
  XhFileUploadRoot,
  XhFileUploadTrigger,
  XhProgress,
} from "@xihan-ui/vue";

interface Task {
  status: "pending" | "uploading" | "done";
  progress: number;
  /** 传完之后远端给回的名字，没有就显示本地文件名。 */
  name?: string;
}

// File 引用即键：组件删条目按引用剔除，键不会失效
const tasks = ref(new Map<File, Task>());

const timers = new Set<ReturnType<typeof setInterval>>();

function onFileAccept(details: { files: File[] }) {
  for (const file of details.files) {
    tasks.value.set(file, { status: "pending", progress: 0 });
  }
}

// 这里用定时器代替真正的请求，换成 fetch / XHR 是同一个位置
function upload(file: File) {
  tasks.value.set(file, { status: "uploading", progress: 0 });
  const timer = setInterval(() => {
    const task = tasks.value.get(file);
    if (!task) {
      clearInterval(timer);
      timers.delete(timer);
      return;
    }
    const next = task.progress + 20;
    if (next >= 100) {
      clearInterval(timer);
      timers.delete(timer);
      tasks.value.set(file, {
        status: "done",
        progress: 100,
        name: `已归档-${file.name}`,
      });
      return;
    }
    tasks.value.set(file, { status: "uploading", progress: next });
  }, 300);
  timers.add(timer);
}

function uploadAll(files: File[]) {
  for (const file of files) {
    if (tasks.value.get(file)?.status === "pending") {
      upload(file);
    }
  }
}

function nameOf(file: File) {
  return tasks.value.get(file)?.name ?? file.name;
}

function statusText(file: File) {
  const task = tasks.value.get(file);
  if (!task || task.status === "pending") {
    return "待上传";
  }
  return task.status === "done" ? "已完成" : `${task.progress}%`;
}

function progressOf(file: File) {
  return tasks.value.get(file)?.progress ?? 0;
}

function toneOf(file: File) {
  return tasks.value.get(file)?.status === "done" ? "success" : "brand";
}

onBeforeUnmount(() => {
  timers.forEach((timer) => clearInterval(timer));
  timers.clear();
});

const status: CSSProperties = {
  flex: "none",
  inlineSize: "56px",
  textAlign: "end",
  fontSize: "12px",
  color: "var(--xh-fg-muted)",
};
</script>

<template>
  <div style="width: 100%; max-width: 520px; display: grid; gap: 12px">
    <XhFileUploadRoot
      v-slot="{ acceptedFiles, empty }"
      :max-files="5"
      @file-accept="onFileAccept"
    >
      <XhFileUploadLabel>附件</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>先把文件放进来，再点「开始上传」</span>
      </XhFileUploadDropzone>
      <div style="display: flex; gap: 8px">
        <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
        <XhButton size="sm" :disabled="empty" @click="uploadAll(acceptedFiles)">
          开始上传
        </XhButton>
      </div>
      <XhFileUploadHiddenInput />
      <XhFileUploadItemGroup>
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file">
          <XhFileUploadItemName>{{ nameOf(file) }}</XhFileUploadItemName>
          <XhProgress
            :value="progressOf(file)"
            :tone="toneOf(file)"
            size="sm"
            style="flex: none; inline-size: 96px"
          />
          <span :style="status">{{ statusText(file) }}</span>
          <XhFileUploadItemDeleteTrigger>✕</XhFileUploadItemDeleteTrigger>
        </XhFileUploadItem>
      </XhFileUploadItemGroup>
    </XhFileUploadRoot>
  </div>
</template>
