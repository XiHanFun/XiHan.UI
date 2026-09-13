const n=`<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<!-- 变体 | primary 用于页面背景，secondary 用于卡片等已有表面 -->
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";

const items = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
];
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start">
    <XhCheckboxGroupRoot
      :collection="items"
      :default-value="['email']"
      label="主要"
      variant="primary"
    />
    <XhCheckboxGroupRoot
      :collection="items"
      :default-value="['email']"
      label="次要"
      variant="secondary"
    />
  </div>
</template>
`;export{n as default};
