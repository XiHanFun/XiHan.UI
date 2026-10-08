var e=`<!-- 加载 | 保留按钮标签并阻止重复操作 -->
<script setup lang="ts">
import { XhButton, XhButtonIndicator, XhButtonLabel } from "@xihan-ui/vue";
<\/script>

<template>
  <XhButton loading>
    <XhButtonIndicator />
    <XhButtonLabel>提交</XhButtonLabel>
  </XhButton>
  <XhButton loading variant="subtle">
    <XhButtonIndicator />
    <XhButtonLabel>处理中</XhButtonLabel>
  </XhButton>
</template>
`;export{e as default};