const e=`<!-- 受控 | 传了 files 就由宿主说了算，组件自己不再落值，只发 files-change 报告意图 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
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

const files = ref<File[]>([]);

// 变化之后的完整列表，不是增量
function onFilesChange(details: { files: File[] }) {
  files.value = details.files;
}
<\/script>

<template>
  <div style="width: 100%; max-width: 480px; display: grid; gap: 12px">
    <XhFileUploadRoot
      v-slot="{ acceptedFiles }"
      :files="files"
      :max-files="5"
      @files-change="onFilesChange"
    >
      <XhFileUploadLabel>受控列表</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>选进来的文件由外部数组保管</span>
      </XhFileUploadDropzone>
      <div>
        <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
      </div>
      <XhFileUploadHiddenInput />
      <XhFileUploadItemGroup>
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file">
          <XhFileUploadItemName />
          <XhFileUploadItemSizeText />
          <XhFileUploadItemDeleteTrigger>✕</XhFileUploadItemDeleteTrigger>
        </XhFileUploadItem>
      </XhFileUploadItemGroup>
    </XhFileUploadRoot>

    <div style="display: flex; align-items: center; gap: 12px">
      <XhButton size="sm" :disabled="!files.length" @click="files = []">
        从外面清空
      </XhButton>
      <span>宿主持有 {{ files.length }} 个文件</span>
    </div>
  </div>
</template>
`;export{e as default};
