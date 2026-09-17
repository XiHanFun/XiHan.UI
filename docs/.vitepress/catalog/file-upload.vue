<script setup lang="ts">
import { XhFileUploadDropzone, XhFileUploadHiddenInput, XhFileUploadLabel, XhFileUploadRoot, XhFileUploadTrigger } from "@xihan-ui/vue";
</script>

<template>
  <XhFileUploadRoot style="inline-size: var(--xh-doc-catalog-w)">
    <XhFileUploadLabel>附件</XhFileUploadLabel>
    <XhFileUploadDropzone>
      <span>把文件拖到这里</span>
      <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
    </XhFileUploadDropzone>
    <XhFileUploadHiddenInput />
  </XhFileUploadRoot>
</template>
