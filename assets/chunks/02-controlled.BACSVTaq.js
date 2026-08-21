const n=`<!-- 受控 | 传了 value 就由宿主说了算，组件自己不再改选中值；切换意图从 value-change 出来，写回才真的切 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";

const value = ref("account");
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhTabsRoot v-model:value="value">
      <XhTabsList>
        <XhTabsTrigger value="account">账户</XhTabsTrigger>
        <XhTabsTrigger value="security">安全</XhTabsTrigger>
        <XhTabsTrigger value="notice">通知</XhTabsTrigger>
      </XhTabsList>

      <XhTabsContent value="account">账户面板</XhTabsContent>
      <XhTabsContent value="security">安全面板</XhTabsContent>
      <XhTabsContent value="notice">通知面板</XhTabsContent>
    </XhTabsRoot>

    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton variant="outline" @click="value = 'security'">
        跳到安全
      </XhButton>
      <span>当前：{{ value }}</span>
    </div>
  </div>
</template>
`;export{n as default};
