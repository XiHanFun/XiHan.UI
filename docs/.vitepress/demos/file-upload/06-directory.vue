<!-- 选整个目录 | directory 让隐藏输入改收目录，选中目录下的文件一次性全进来，数量上限要跟着放开 -->
<script setup lang="ts">
import {
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemGroup,
  XhFileUploadItemName,
  XhFileUploadItemSizeText,
  XhFileUploadLabel,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/vue";

const noLimit = Number.POSITIVE_INFINITY;
</script>

<template>
  <div style="width: 100%; max-width: 480px">
    <XhFileUploadRoot v-slot="{ acceptedFiles, empty }" directory :max-files="noLimit">
      <XhFileUploadLabel>整个目录</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>挑一个目录，里面的文件全收</span>
      </XhFileUploadDropzone>
      <div>
        <XhFileUploadTrigger>选择目录</XhFileUploadTrigger>
      </div>
      <XhFileUploadHiddenInput />
      <span v-if="!empty">共 {{ acceptedFiles.length }} 个文件</span>
      <XhFileUploadItemGroup style="max-block-size: 220px; overflow: auto">
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file">
          <XhFileUploadItemName />
          <XhFileUploadItemSizeText />
          <XhFileUploadItemDeleteTrigger>✕</XhFileUploadItemDeleteTrigger>
        </XhFileUploadItem>
      </XhFileUploadItemGroup>
    </XhFileUploadRoot>
  </div>
</template>
