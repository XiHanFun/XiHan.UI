const e=`<!-- 尺寸 | size 决定方框与条目文字的几何档位，组标题不随档 -->
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
const items = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
];
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start">
    <XhCheckboxGroupRoot
      v-for="s in sizes"
      :key="s"
      :collection="items"
      :default-value="['email']"
      :label="s"
      :size="s"
    />
  </div>
</template>
`;export{e as default};
