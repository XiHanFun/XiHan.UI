const e=`<!-- 限制与拒收 | accept / maxFiles / maxFileSize 越界的当场被拒，file-reject 逐个报出理由 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhFileUploadClearTrigger,
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemGroup,
  XhFileUploadItemName,
  XhFileUploadItemPreview,
  XhFileUploadItemSizeText,
  XhFileUploadLabel,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/vue";

const rejected = ref("");

const reasonText: Record<string, string> = {
  "type": "类型不符",
  "size-too-large": "太大",
  "size-too-small": "太小",
  "too-many-files": "放不下",
};

// 一个文件可能同时命中多条理由
function onReject(details: { files: { file: File; reasons: string[] }[] }) {
  rejected.value = details.files
    .map(
      (it) => \`\${it.file.name}（\${it.reasons.map((r) => reasonText[r] ?? r).join("、")}）\`
    )
    .join("；");
}

// 单条删除按钮的可及名字带上文件名，读屏才分得出删的是哪一条
const translations = {
  deleteFile: (file: File) => \`删除 \${file.name}\`,
  clearFiles: "清空全部",
};
<\/script>

<template>
  <div style="width: 100%; max-width: 480px; display: grid; gap: 12px">
    <XhFileUploadRoot
      v-slot="{ acceptedFiles }"
      accept="image/*"
      :max-files="3"
      :max-file-size="512 * 1024"
      :translations="translations"
      @file-reject="onReject"
    >
      <XhFileUploadLabel>图片</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>只收图片，最多 3 张</span>
        <span>单张不超过 512 KB</span>
      </XhFileUploadDropzone>
      <div>
        <XhFileUploadTrigger>选择图片</XhFileUploadTrigger>
      </div>
      <XhFileUploadHiddenInput />
      <XhFileUploadItemGroup>
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file">
          <XhFileUploadItemPreview />
          <XhFileUploadItemName />
          <XhFileUploadItemSizeText />
          <XhFileUploadItemDeleteTrigger>✕</XhFileUploadItemDeleteTrigger>
        </XhFileUploadItem>
      </XhFileUploadItemGroup>
      <!-- 列表为空时清空按钮带原生 disabled，Tab 停都停不上去 -->
      <XhFileUploadClearTrigger>清空</XhFileUploadClearTrigger>
    </XhFileUploadRoot>
    <span v-if="rejected">被拒：{{ rejected }}</span>
  </div>
</template>
`;export{e as default};
