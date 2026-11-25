<!-- 头部下载 | 下载交给下载触发器：放进头部条，文件名沿用代码的文件名，写出的是原文 -->
<script setup lang="ts">
import { DownloadIcon } from "@xihan-ui/icons";
import {
  XhCodeViewCode,
  XhCodeViewFileName,
  XhCodeViewHeader,
  XhCodeViewPre,
  XhCodeViewRoot,
  XhDownloadTrigger,
  XhIcon,
} from "@xihan-ui/vue";

const fileName = "retry.ts";
const sample = `export async function retry<T>(run: () => Promise<T>, times = 3): Promise<T> {
  let last: unknown
  for (let i = 0; i < times; i++) {
    try {
      return await run()
    }
    catch (error) {
      last = error
    }
  }
  throw last
}`;
</script>

<template>
  <XhCodeViewRoot :code="sample" lang="typescript" :file-name="fileName" complete style="inline-size: 100%;">
    <XhCodeViewHeader>
      <!-- 文件名占满剩余宽度，下载按钮自然被推到头部条末端 -->
      <XhCodeViewFileName />
      <XhDownloadTrigger :data="sample" :file-name="fileName" variant="ghost" size="sm">
        <XhIcon :icon="DownloadIcon" /> 下载
      </XhDownloadTrigger>
    </XhCodeViewHeader>
    <XhCodeViewPre>
      <XhCodeViewCode />
    </XhCodeViewPre>
  </XhCodeViewRoot>
</template>
