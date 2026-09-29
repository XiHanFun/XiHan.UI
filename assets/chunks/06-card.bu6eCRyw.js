const n=`<!-- 卡片 | variant="card" 把每个选项画成一张可点的卡；collection 里的 description 铺成文案下方的说明行 -->
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";

const items = [
  { value: "email", label: "邮件", description: "每天早上汇总一封" },
  { value: "sms", label: "短信", description: "只发需要立即处理的事项" },
  { value: "push", label: "推送通知", description: "在手机与桌面端即时提醒" },
];
<\/script>

<template>
  <XhCheckboxGroupRoot
    variant="card"
    :collection="items"
    :default-value="['email']"
    label="通知方式"
    style="max-inline-size: 24rem"
  />
</template>
`;export{n as default};
