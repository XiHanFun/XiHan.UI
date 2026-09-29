const t=`<!-- 多选 | Space 切换当前行，Shift + 方向键、Shift + Space 与 Shift + 点击把锚点到那一行的一段并进选中，Ctrl 或 Cmd+A 选择或清空全部可用行 -->
<script setup lang="ts">
import {
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowContent,
  XhGridListRowSelectionIndicator,
  XhGridListRowText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const items = [
  { value: "read", label: "读取" },
  { value: "write", label: "写入" },
  { value: "deploy", label: "发布", disabled: true },
];
const selected = ref<string[]>(["read"]);
<\/script>

<template>
  <div data-demo-stack>
    <XhGridListRoot v-model:value="selected" :collection="items" selection-mode="multiple">
      <XhGridListRow v-for="item in items" :key="item.value" :value="item.value" :disabled="item.disabled">
        <XhGridListRowSelectionIndicator />
        <XhGridListRowContent><XhGridListRowText>{{ item.label }}</XhGridListRowText></XhGridListRowContent>
      </XhGridListRow>
    </XhGridListRoot>
    <span data-label>权限：{{ selected.join("、") || "无" }}</span>
  </div>
</template>
`;export{t as default};
