const t=`<!-- 操作 | 将与提示直接相关的短操作放在尾端 -->
<script setup lang="ts">
import {
  XhAlertAction,
  XhAlertContent,
  XhAlertDescription,
  XhAlertRoot,
  XhAlertTitle,
  XhButton,
} from "@xihan-ui/vue";
<\/script>

<template>
  <div style="width: 100%">
    <XhAlertRoot tone="warning">
      <XhAlertContent>
        <XhAlertTitle>配额即将用尽</XhAlertTitle>
        <XhAlertDescription>本月还可处理 120 次请求。</XhAlertDescription>
      </XhAlertContent>
      <XhAlertAction><XhButton size="sm" variant="outline">查看用量</XhButton></XhAlertAction>
    </XhAlertRoot>
  </div>
</template>
`;export{t as default};
