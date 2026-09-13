const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 文本前后缀 | 添加协议和域名后缀 -->
<script setup lang="ts">
import {
  XhInputGroupItem,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhInputGroupRoot>
    <XhInputGroupItem>https://</XhInputGroupItem>
    <XhTextFieldRoot placeholder="xihan">
      <XhTextFieldControl>
        <XhTextFieldInput aria-label="站点地址" />
      </XhTextFieldControl>
    </XhTextFieldRoot>
    <XhInputGroupItem>.dev</XhInputGroupItem>
  </XhInputGroupRoot>
</template>
`;export{n as default};
