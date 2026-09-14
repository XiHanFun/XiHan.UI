<!-- 禁用 | disabled 把投放区、触发器与隐藏输入一并关停，拖拽进来也不再收 -->
<script setup lang="ts">
import {
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadLabel,
  XhFileUploadRoot,
  XhFileUploadTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; max-width: 480px">
    <XhFileUploadRoot disabled>
      <XhFileUploadLabel>附件</XhFileUploadLabel>
      <XhFileUploadDropzone>
        <span>当前不接受上传</span>
      </XhFileUploadDropzone>
      <div>
        <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
      </div>
      <XhFileUploadHiddenInput />
    </XhFileUploadRoot>
  </div>
</template>
