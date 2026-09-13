<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 补充说明 | description 提供一行简短上下文；需要长时间阅读的内容改用 Notification -->
<script setup lang="ts">
import {
  XhToastCloseTrigger,
  XhToastContent,
  XhToastDescription,
  XhToastIndicator,
  XhToastRoot,
  XhToastTitle,
} from "@xihan-ui/vue";
</script>

<template>
  <XhToastRoot
    type="success"
    title="文件已上传"
    description="可在项目资源中继续查看"
    :duration="0"
    :translations="{ close: '关闭' }"
  >
    <XhToastIndicator />
    <XhToastContent>
      <XhToastTitle />
      <XhToastDescription />
    </XhToastContent>
    <XhToastCloseTrigger />
  </XhToastRoot>
</template>
