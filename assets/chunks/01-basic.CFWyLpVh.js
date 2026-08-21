const t=`<!-- 基础用法 | 各部件按需摆放，标题与描述都是可选的 -->
<script setup lang="ts">
import { XhAlertDescription, XhAlertRoot, XhAlertTitle } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhAlertRoot>
      <XhAlertTitle>部署已排队</XhAlertTitle>
      <XhAlertDescription>构建完成后会自动发布。</XhAlertDescription>
    </XhAlertRoot>
  </div>
</template>
`;export{t as default};
