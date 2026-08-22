const e=`<!-- 基础用法 | 投放区自己就是一个大按钮，隐藏输入是必备部件，缺了它选不了文件 -->
<script setup lang="ts">
import {
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
<\/script>

<template>
  <div style="width: 100%; max-width: 480px">
    <XhFileUploadRoot v-slot="{ acceptedFiles }">
      <XhFileUploadLabel>附件</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>把文件拖到这里</span>
        <span>或者用下面的按钮挑一个</span>
      </XhFileUploadDropzone>
      <div>
        <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
      </div>
      <XhFileUploadHiddenInput />
      <XhFileUploadItemGroup>
        <!-- key 取 File 本身：同名同大小是两份不同的文件，拿文件名当 key 会撞 -->
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file">
          <XhFileUploadItemPreview />
          <XhFileUploadItemName />
          <XhFileUploadItemSizeText />
          <XhFileUploadItemDeleteTrigger />
        </XhFileUploadItem>
      </XhFileUploadItemGroup>
    </XhFileUploadRoot>
  </div>
</template>
`;export{e as default};
