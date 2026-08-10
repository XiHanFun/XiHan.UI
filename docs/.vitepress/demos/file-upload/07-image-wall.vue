<!-- 缩略图墙 | item-preview 是个空方框，作者往里塞什么都行；塞进去的图会被裁成方格，一行摆几张由外层网格定 -->
<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import {
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemGroup,
  XhFileUploadItemName,
  XhFileUploadItemPreview,
  XhFileUploadLabel,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/vue";

const wall = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
};

const card = {
  flexDirection: "column",
  alignItems: "stretch",
  "--xh-file-upload-preview-size": "96px",
};

// 一个文件一条地址，取过就留着，卸载时统一交还
const urls = new Map<File, string>();

function previewUrl(file: File) {
  const cached = urls.get(file);
  if (cached) {
    return cached;
  }
  const url = URL.createObjectURL(file);
  urls.set(file, url);
  return url;
}

onBeforeUnmount(() => {
  urls.forEach((url) => URL.revokeObjectURL(url));
  urls.clear();
});
</script>

<template>
  <div style="width: 100%; max-width: 480px">
    <XhFileUploadRoot v-slot="{ acceptedFiles }" accept="image/*" :max-files="6">
      <XhFileUploadLabel>相册</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>把图片拖进来，最多 6 张</span>
      </XhFileUploadDropzone>
      <div>
        <XhFileUploadTrigger>选择图片</XhFileUploadTrigger>
      </div>
      <XhFileUploadHiddenInput />
      <XhFileUploadItemGroup :style="wall">
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file" :style="card">
          <XhFileUploadItemPreview>
            <img :src="previewUrl(file)" alt="" />
          </XhFileUploadItemPreview>
          <XhFileUploadItemName />
          <XhFileUploadItemDeleteTrigger>移除</XhFileUploadItemDeleteTrigger>
        </XhFileUploadItem>
      </XhFileUploadItemGroup>
    </XhFileUploadRoot>
  </div>
</template>
