const e=`<!-- 选择整个目录 | directory 使隐藏输入改为接收目录，选中目录下的文件一次性全部进入，数量上限要随之放开 -->
<script setup lang="ts">
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

const noLimit = Number.POSITIVE_INFINITY;
<\/script>

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
      <XhFileUploadList style="max-block-size: 220px; overflow: auto">
        <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file">
          <XhFileUploadItemName />
          <XhFileUploadItemSizeText />
          <XhFileUploadItemDeleteTrigger />
        </XhFileUploadItem>
      </XhFileUploadList>
    </XhFileUploadRoot>
  </div>
</template>
`;export{e as default};
