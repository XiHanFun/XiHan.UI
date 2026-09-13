const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 空态 | 没有选项时显示简洁提示 -->
<script setup lang="ts">
import {
  XhListboxContent,
  XhListboxEmpty,
  XhListboxLabel,
  XhListboxRoot,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhListboxRoot :collection="[]" style="inline-size: min(100%, 300px)">
    <XhListboxLabel>团队成员</XhListboxLabel>
    <XhListboxContent />
    <XhListboxEmpty>暂无成员</XhListboxEmpty>
  </XhListboxRoot>
</template>
`;export{n as default};
