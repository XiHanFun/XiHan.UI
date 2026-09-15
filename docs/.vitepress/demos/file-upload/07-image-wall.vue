<!-- 缩略图墙 | item-preview 是一个空方框，作者可放置任意内容；放入的图片会被裁为方格，一行排几张由外层网格决定 -->
<script setup lang="ts">
import {
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadItemPreview,
  XhFileUploadLabel,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/vue";
import { onBeforeUnmount } from "vue";

const wall = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
};

const card = {
  "flexDirection": "column",
  "alignItems": "stretch",
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
  urls.forEach(url => URL.revokeObjectURL(url));
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
      <XhFileUploadList :style="wall">
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file" :style="card">
          <XhFileUploadItemPreview>
            <img :src="previewUrl(file)" alt="">
          </XhFileUploadItemPreview>
          <XhFileUploadItemName />
          <XhFileUploadItemDeleteTrigger>移除</XhFileUploadItemDeleteTrigger>
        </XhFileUploadItem>
      </XhFileUploadList>
    </XhFileUploadRoot>
  </div>
</template>
