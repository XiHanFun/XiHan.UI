const e=`<!-- 全选与半选 | 使用 itemValues 计算全选和半选状态 -->
<script setup lang="ts">
import {
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
  XhCheckboxGroupSelectAllTrigger,
} from "@xihan-ui/vue";

const items = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
  { value: "push", label: "推送通知" },
];
const itemValues = items.map(t => t.value);
<\/script>

<template>
  <XhCheckboxGroupRoot :default-value="['email']" :item-values="itemValues">
    <XhCheckboxGroupLabel>通知方式</XhCheckboxGroupLabel>
    <XhCheckboxGroupSelectAllTrigger>全选</XhCheckboxGroupSelectAllTrigger>
    <XhCheckboxGroupItem
      v-for="item in items"
      :key="item.value"
      :value="item.value"
    >
      <XhCheckboxGroupIndicator />
      <XhCheckboxGroupItemText>{{ item.label }}</XhCheckboxGroupItemText>
    </XhCheckboxGroupItem>
  </XhCheckboxGroupRoot>
</template>
`;export{e as default};
