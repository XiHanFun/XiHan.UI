<!-- 尺寸与状态 | size 决定方框与条目文字的几何档位，组标题不随档；禁用项不可操作，只读项仍可聚焦 -->
<script setup lang="ts">
import { XhCheckboxGroupRoot } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"] as const;
const channels = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
];

const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
];

// 单项禁用写在数据里，条目部件上不必再声明一遍
const partly = [
  { value: "cheese", label: "芝士" },
  { value: "truffle", label: "松露", disabled: true },
];
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-6)">
    <div style="display: flex; flex-wrap: wrap; gap: var(--xh-space-8); align-items: flex-start">
      <XhCheckboxGroupRoot
        v-for="s in sizes"
        :key="s"
        :collection="channels"
        :default-value="['email']"
        :label="s"
        :size="s"
      />
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: var(--xh-space-8); align-items: flex-start">
      <XhCheckboxGroupRoot :default-value="['cheese']" :collection="items" label="整组禁用" disabled />

      <XhCheckboxGroupRoot :default-value="['cheese']" :collection="items" label="整组只读" read-only />

      <XhCheckboxGroupRoot :default-value="['cheese']" :collection="partly" label="单项禁用" />
    </div>
  </div>
</template>
