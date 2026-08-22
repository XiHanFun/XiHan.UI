const e=`<!-- 预置列表 | defaultFiles 给出挂载时就在的那几份，之后列表照旧由组件自己保管，删除与清空都照常 -->
<script setup lang="ts">
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

// 预置项就是普通的 File，与用户挑进来的那些没有区别
const initialFiles = [
  new File(["甲方与乙方就本次合作达成如下条款……"], "合同正文.txt", { type: "text/plain" }),
  new File(["# 交付说明\\n\\n分三批交付。"], "交付说明.md", { type: "text/markdown" }),
];
<\/script>

<template>
  <div style="width: 100%; max-width: 480px">
    <XhFileUploadRoot v-slot="{ acceptedFiles }" :default-files="initialFiles" :max-files="4">
      <XhFileUploadLabel>随件资料</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>已经带了两份进来</span>
        <span>再拖几份也收，最多 4 份</span>
      </XhFileUploadDropzone>
      <div>
        <XhFileUploadTrigger>继续添加</XhFileUploadTrigger>
      </div>
      <XhFileUploadHiddenInput />
      <XhFileUploadItemGroup>
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file">
          <XhFileUploadItemPreview />
          <XhFileUploadItemName />
          <XhFileUploadItemSizeText />
          <XhFileUploadItemDeleteTrigger />
        </XhFileUploadItem>
      </XhFileUploadItemGroup>
      <XhFileUploadClearTrigger>清空</XhFileUploadClearTrigger>
    </XhFileUploadRoot>
  </div>
</template>
`;export{e as default};
