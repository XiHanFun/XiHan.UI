<!-- 宿主自定义的准入 | 组件只管理 accept 与大小数量这几条通用规则，其他规则由宿主在受控列表中再筛一遍：这里同名文件只保留最先到达的一份 -->
<script setup lang="ts">
import {
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadItemSizeText,
  XhFileUploadLabel,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const files = ref<File[]>([]);
const dropped = ref("");
const lastAccepted = ref("");

// 组件报来的是变化之后的完整列表，宿主按自己的规矩决定最终留下哪些
function onFilesChange(details: { files: File[] }) {
  const seen = new Set<string>();
  const kept: File[] = [];
  const names: string[] = [];
  for (const file of details.files) {
    if (seen.has(file.name)) {
      names.push(file.name);
      continue;
    }
    seen.add(file.name);
    kept.push(file);
  }
  files.value = kept;
  dropped.value = names.join("、");
}

// 这一批组件收下了谁
function onFileAccept(details: { files: File[] }) {
  lastAccepted.value = details.files.map(file => file.name).join("、");
}
</script>

<template>
  <div style="width: 100%; max-width: 480px; display: grid; gap: 12px">
    <XhFileUploadRoot
      v-slot="{ acceptedFiles }"
      :files="files"
      :max-files="6"
      @files-change="onFilesChange"
      @file-accept="onFileAccept"
    >
      <XhFileUploadLabel>去重后的附件</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>同名文件只留最先来的那份</span>
      </XhFileUploadDropzone>
      <div>
        <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
      </div>
      <XhFileUploadHiddenInput />
      <XhFileUploadList>
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file">
          <XhFileUploadItemName />
          <XhFileUploadItemSizeText />
          <XhFileUploadItemDeleteTrigger />
        </XhFileUploadItem>
      </XhFileUploadList>
    </XhFileUploadRoot>

    <span v-if="lastAccepted">这一批收下：{{ lastAccepted }}</span>
    <span v-if="dropped">同名挡下：{{ dropped }}</span>
  </div>
</template>
