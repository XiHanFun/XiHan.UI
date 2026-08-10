<!-- 列表项上的下载 | 条目里放什么由作者定：一条普通的 a[download] 就是下载口；想自己接管就换成按钮，在处理器里怎么取都行 -->
<script setup lang="ts">
import { onBeforeUnmount } from "vue";
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

// 一个文件一条地址，取过就留着，卸载时统一交还
const urls = new Map<File, string>();

function urlOf(file: File) {
  const cached = urls.get(file);
  if (cached) {
    return cached;
  }
  const url = URL.createObjectURL(file);
  urls.set(file, url);
  return url;
}

// 自己接管下载：这里换了个存盘名，换成签名地址或先取回 blob 也是同一个位置
function saveCopy(file: File) {
  const link = document.createElement("a");
  link.href = urlOf(file);
  link.download = `副本-${file.name}`;
  link.click();
}

onBeforeUnmount(() => {
  urls.forEach((url) => URL.revokeObjectURL(url));
  urls.clear();
});

const action = {
  flex: "none",
  fontSize: "12px",
  color: "var(--xh-fg-brand)",
  cursor: "pointer",
};
</script>

<template>
  <div style="width: 100%; max-width: 520px">
    <XhFileUploadRoot v-slot="{ acceptedFiles }" :max-files="5">
      <XhFileUploadLabel>资料</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>放几份文件进来，每条后面就带上下载口</span>
      </XhFileUploadDropzone>
      <div>
        <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
      </div>
      <XhFileUploadHiddenInput />
      <XhFileUploadItemGroup>
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file">
          <XhFileUploadItemName />
          <XhFileUploadItemSizeText />
          <a :style="action" :href="urlOf(file)" :download="file.name">下载</a>
          <button :style="action" type="button" @click="saveCopy(file)">
            存为副本
          </button>
          <XhFileUploadItemDeleteTrigger>✕</XhFileUploadItemDeleteTrigger>
        </XhFileUploadItem>
      </XhFileUploadItemGroup>
    </XhFileUploadRoot>
  </div>
</template>
