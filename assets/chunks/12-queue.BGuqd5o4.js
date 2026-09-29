const e=`<!-- 并发上限与取消 | max-concurrent-uploads 限定同时在传的份数，多出来的排队依次补上；cancelUpload 只中止传输、文件留在列表里，startUpload 让它重新开传 -->
<script setup lang="ts">
import type { FileUploadRequest, FileUploadResult, FileUploadStatus } from "@xihan-ui/vue";
import {
  XhButton,
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadLabel,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
  XhProgress,
} from "@xihan-ui/vue";

const statusText: Record<FileUploadStatus, string> = {
  idle: "未开始",
  queued: "排队中",
  uploading: "上传中",
  done: "已传完",
  error: "失败",
  canceled: "已取消",
};

// 演示用的假传输：两秒走完；真实实现把 signal 接给请求库，取消与删除都经它中止
function upload(request: FileUploadRequest): Promise<FileUploadResult> {
  return new Promise((resolve, reject) => {
    let progress = 0;
    const timer = setInterval(() => {
      progress += 10;
      request.onProgress(progress);
      if (progress >= 100) {
        clearInterval(timer);
        resolve({});
      }
    }, 200);
    request.signal.addEventListener("abort", () => {
      clearInterval(timer);
      reject(request.signal.reason);
    });
  });
}
<\/script>

<template>
  <XhFileUploadRoot
    v-slot="{ acceptedFiles, uploadOf, startUpload, cancelUpload }"
    :max-files="Infinity"
    :max-concurrent-uploads="2"
    :upload="upload"
    style="max-inline-size: 420px"
  >
    <XhFileUploadLabel>附件</XhFileUploadLabel>
    <XhFileUploadDropzone>一次多选几份，同时只传两份</XhFileUploadDropzone>
    <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
    <XhFileUploadHiddenInput />
    <XhFileUploadList>
      <XhFileUploadItem v-for="file in acceptedFiles" :key="file.name" :file="file">
        <XhFileUploadItemName />
        <XhProgress
          v-if="uploadOf(file)?.status === 'uploading'"
          :value="uploadOf(file)!.progress"
          style="flex: 1"
        />
        <span v-else style="flex: 1">{{ statusText[uploadOf(file)?.status ?? "idle"] }}</span>
        <XhButton
          v-if="uploadOf(file)?.status === 'uploading' || uploadOf(file)?.status === 'queued'"
          size="sm"
          variant="outline"
          @click="cancelUpload(file)"
        >
          取消
        </XhButton>
        <XhButton
          v-else-if="uploadOf(file)?.status === 'canceled'"
          size="sm"
          variant="outline"
          @click="startUpload(file)"
        >
          重新上传
        </XhButton>
        <XhFileUploadItemDeleteTrigger />
      </XhFileUploadItem>
    </XhFileUploadList>
  </XhFileUploadRoot>
</template>
`;export{e as default};
