<!-- 服务器附件回显 | remote-files 装编辑表单里已存在的附件：与本地文件同列渲染（allFiles 远程在前）、占 max-files 名额，删除走 remote-files-change 由宿主落库 -->
<script setup lang="ts">
import type { FileUploadRemoteFile } from "@xihan-ui/vue";
import { ref } from "vue";
import {
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadList,
  XhFileUploadItemName,
  XhFileUploadItemSizeText,
  XhFileUploadLabel,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/vue";

// 编辑场景：这两条是服务端返回的既有附件，不是本地 File
const remoteFiles = ref<FileUploadRemoteFile[]>([
  { id: "a1", name: "合同扫描件.pdf", size: 382_000, type: "application/pdf", url: "https://cdn.example.com/a1.pdf" },
  { id: "a2", name: "报价单.xlsx", size: 51_200, url: "https://cdn.example.com/a2.xlsx" },
]);
</script>

<template>
  <XhFileUploadRoot
    v-slot="{ allFiles }"
    v-model:remote-files="remoteFiles"
    :max-files="4"
    style="max-inline-size: 420px"
  >
    <XhFileUploadLabel>附件（最多 4 个，已有 {{ remoteFiles.length }} 个在服务器上）</XhFileUploadLabel>
    <XhFileUploadDropzone>拖进来或点击选择</XhFileUploadDropzone>
    <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
    <XhFileUploadHiddenInput />
    <XhFileUploadList>
      <XhFileUploadItem
        v-for="(file, i) in allFiles"
        :key="'id' in file ? file.id : `local-${i}`"
        :file="file"
      >
        <XhFileUploadItemName />
        <XhFileUploadItemSizeText />
        <a v-if="'url' in file && file.url" :href="file.url" target="_blank" rel="noreferrer">查看</a>
        <XhFileUploadItemDeleteTrigger />
      </XhFileUploadItem>
    </XhFileUploadList>
  </XhFileUploadRoot>
  <p>剩余名额与新选文件共享；删除服务器附件只改 remote-files，落库由宿主决定。</p>
</template>
