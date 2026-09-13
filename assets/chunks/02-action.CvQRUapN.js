const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 动作 | 将关联操作放在输入框末端 -->
<script setup lang="ts">
import {
  XhButton,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
<\/script>

<template>
  <XhInputGroupRoot>
    <XhTextFieldRoot placeholder="搜索文档">
      <XhTextFieldControl>
        <XhTextFieldInput aria-label="搜索文档" />
      </XhTextFieldControl>
    </XhTextFieldRoot>
    <XhButton variant="solid">搜索</XhButton>
  </XhInputGroupRoot>
</template>
`;export{n as default};
