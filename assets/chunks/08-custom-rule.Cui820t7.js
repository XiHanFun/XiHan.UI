const e=`<!-- 作者的准入判定 | accept 与大小数量之外的规矩交给 validate：类型与大小通过之后逐个问它，返回拒绝码即拒收，拒收的文件带着这个码进 file-reject；这里同名文件只收最先到的一份 -->
<script setup lang="ts">
import type { FileUploadValidateContext } from "@xihan-ui/vue";
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

const dropped = ref("");

// 列表里已有同名的，或同一批里排在它前面的有同名的，就报 duplicate
function validate(file: File, context: FileUploadValidateContext): string | null {
  const earlier = context.files.slice(0, context.files.indexOf(file));
  const taken = [...context.acceptedFiles, ...earlier].some(other => other.name === file.name);
  return taken ? "duplicate" : null;
}

// 拒收的文件与内建原因（类型、大小、数量）走同一条通道，按码挑出自己关心的那一类
function onFileReject(details: { files: { file: File; reasons: string[] }[] }) {
  dropped.value = details.files
    .filter(rejection => rejection.reasons.includes("duplicate"))
    .map(rejection => rejection.file.name)
    .join("、");
}
<\/script>

<template>
  <div style="width: 100%; max-width: 480px; display: grid; gap: 12px">
    <XhFileUploadRoot
      v-slot="{ acceptedFiles }"
      :max-files="6"
      :validate="validate"
      @file-reject="onFileReject"
    >
      <XhFileUploadLabel>去重后的附件</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>同名文件只收最先来的那份</span>
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

    <span v-if="dropped">同名挡下：{{ dropped }}</span>
  </div>
</template>
`;export{e as default};
