<!-- 勾选与选中分开 | checkable 让勾选与选中各管一件事：行首勾选框与空格只改勾选集合（批量操作），点行与确认键选中当前项（看详情）；级联作用在勾选集合上 -->
<script setup lang="ts">
import { XhTreeRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const collection = [
  {
    value: "identity",
    label: "identity",
    children: [
      { value: "identity:global", label: "global" },
      { value: "identity:guide", label: "guide" },
      { value: "identity:welcome", label: "welcome" },
    ],
  },
  {
    value: "security",
    label: "security",
    children: [
      { value: "security:rules", label: "rules" },
      { value: "security:policies", label: "policies" },
    ],
  },
];

const current = ref<string[]>(["identity:guide"]);
const checked = ref<string[]>([]);
</script>

<template>
  <div style="display: grid; gap: 8px; justify-items: start">
    <XhTreeRoot
      v-model:selection="current"
      v-model:checked="checked"
      :collection="collection"
      :default-expanded-value="['identity', 'security']"
      label="缓存键"
      checkable
      cascade
    />
    <p data-demo-output>
      详情：{{ current[0] ?? "（未选）" }} · 已勾选：{{ checked.length ? checked.join("、") : "（无）" }}
    </p>
  </div>
</template>
