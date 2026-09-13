const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 基础用法 | 为输入框添加固定前缀 -->
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
    <XhInputGroupItem>
      <svg aria-hidden="true" viewBox="0 0 20 20" style="inline-size: 1em; block-size: 1em">
        <path d="M2.5 5.5 10 10.75 17.5 5.5M4 4h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
      </svg>
    </XhInputGroupItem>
    <XhTextFieldRoot type="email" placeholder="name@example.com">
      <XhTextFieldControl>
        <XhTextFieldInput aria-label="邮箱地址" />
      </XhTextFieldControl>
    </XhTextFieldRoot>
  </XhInputGroupRoot>
</template>
`;export{n as default};
