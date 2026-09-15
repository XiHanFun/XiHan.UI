const n=`<!-- 键排序 | sortKeys 让对象键按字典序排，数组顺序不动；接口返回的字段顺序不稳定时用它 -->
<script setup lang="ts">
import { XhJsonViewerRoot } from "@xihan-ui/vue";

const payload = {
  zone: "cn-east-1",
  action: "deploy",
  meta: { retries: 2, at: "2026-08-20", by: "ci" },
  steps: ["build", "test", "publish"],
};
<\/script>

<template>
  <XhJsonViewerRoot
    :value="payload"
    :default-expanded-depth="2"
    sort-keys
    style="inline-size: 100%; max-inline-size: 420px"
  />
</template>
`;export{n as default};
