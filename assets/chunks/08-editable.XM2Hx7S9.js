const e=`<!-- 增删标签 | 关闭钮或 Delete 键关掉标签，新建按钮追加一枚；标签序由数据源持有 -->
<script setup lang="ts">
import {
  XhButton,
  XhTabsCloseTrigger,
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const drafts = ref([
  { value: "draft-1", label: "草稿 1" },
  { value: "draft-2", label: "草稿 2" },
  { value: "draft-3", label: "草稿 3" },
]);
const selected = ref<string | null>("draft-1");
let next = 4;

function add(): void {
  const value = \`draft-\${next}\`;
  drafts.value = [...drafts.value, { value, label: \`草稿 \${next}\` }];
  selected.value = value;
  next += 1;
}

// 关掉的是选中标签时，选中挪到原位置上的下一枚（没有就是上一枚）
function close(details: { value: string; values: string[] }): void {
  const index = drafts.value.findIndex(draft => draft.value === details.value);
  drafts.value = drafts.value.filter(draft => draft.value !== details.value);
  if (selected.value === details.value)
    selected.value = details.values[Math.min(index, details.values.length - 1)] ?? null;
}
<\/script>

<template>
  <div style="display: grid; gap: var(--xh-space-3); inline-size: 420px; max-inline-size: 100%">
    <XhButton variant="outline" style="justify-self: start" @click="add">新建草稿</XhButton>
    <XhTabsRoot v-model:value="selected" :collection="drafts" closable @tab-close="close">
      <XhTabsList aria-label="草稿">
        <template v-for="draft in drafts" :key="draft.value">
          <XhTabsTrigger :value="draft.value">{{ draft.label }}</XhTabsTrigger>
          <XhTabsCloseTrigger :value="draft.value" />
        </template>
        <XhTabsIndicator />
      </XhTabsList>

      <XhTabsContent v-for="draft in drafts" :key="draft.value" :value="draft.value">{{ draft.label }}的正文。</XhTabsContent>
    </XhTabsRoot>
  </div>
</template>
`;export{e as default};
