<!-- 上传生命周期 | 给一个 upload 实现组件就是上传器：收下即开传（auto-upload 可关成手动），进度、成败与返回地址都在每条的传输快照里，失败一键重试 -->
<script setup lang="ts">
import type { FileUploadRequest, FileUploadResult } from "@xihan-ui/vue";
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

// 演示用的假传输：一秒走完，文件名带「坏」字的在半路失败；真实实现把 signal 接给请求库即可
function upload(request: FileUploadRequest): Promise<FileUploadResult> {
  return new Promise((resolve, reject) => {
    let progress = 0;
    const timer = setInterval(() => {
      if (request.signal.aborted) {
        clearInterval(timer);
        reject(new Error("aborted"));
        return;
      }
      progress += 20;
      request.onProgress(progress);
      if (progress >= 60 && request.file.name.includes("坏")) {
        clearInterval(timer);
        reject(new Error("网络中断"));
        return;
      }
      if (progress >= 100) {
        clearInterval(timer);
        resolve({ url: `https://cdn.example.com/${request.file.name}` });
      }
    }, 200);
    request.signal.addEventListener("abort", () => clearInterval(timer));
  });
}
</script>

<template>
  <XhFileUploadRoot
    v-slot="{ acceptedFiles, uploadOf, startUpload }"
    :max-files="Infinity"
    :upload="upload"
    style="max-inline-size: 420px"
  >
    <XhFileUploadLabel>附件</XhFileUploadLabel>
    <XhFileUploadDropzone>拖进来或点击选择，收下即开传</XhFileUploadDropzone>
    <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
    <XhFileUploadHiddenInput />
    <XhFileUploadItemGroup>
      <XhFileUploadItem v-for="file in acceptedFiles" :key="file.name" :file="file">
        <XhFileUploadItemName />
        <template v-if="uploadOf(file)">
          <XhProgress
            v-if="uploadOf(file)!.status === 'uploading'"
            :value="uploadOf(file)!.progress"
            style="flex: 1"
          />
          <span v-else-if="uploadOf(file)!.status === 'done'">
            已传到 {{ uploadOf(file)!.url }}
          </span>
          <template v-else-if="uploadOf(file)!.status === 'error'">
            <span style="color: var(--xh-fg-danger)">失败</span>
            <XhButton size="sm" variant="outline" @click="startUpload(file)">重试</XhButton>
          </template>
        </template>
        <XhFileUploadItemDeleteTrigger>✕</XhFileUploadItemDeleteTrigger>
      </XhFileUploadItem>
    </XhFileUploadItemGroup>
  </XhFileUploadRoot>
  <p>试试选一个文件名带「坏」字的文件，看失败与重试。</p>
</template>
