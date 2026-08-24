<!-- 子层横排 | orientation="horizontal" 把同一层的节点并排铺开，缩进仍标层级；方向键不跟着改：左右是收展、上下走可见行，这是 treeview 的规范语义 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";

const collection = [
  {
    value: "color",
    label: "主色",
    children: [
      { value: "brand", label: "品牌" },
      { value: "accent", label: "强调" },
      { value: "neutral", label: "中性" },
    ],
  },
  {
    value: "size",
    label: "尺寸",
    children: [
      { value: "sm", label: "小" },
      { value: "md", label: "中" },
      { value: "lg", label: "大" },
    ],
  },
];

const orientation = ref<"horizontal" | "vertical">("horizontal");
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px; justify-items: start">
    <label style="display: inline-flex; gap: 6px; align-items: center">
      <input v-model="orientation" type="checkbox" true-value="horizontal" false-value="vertical" />
      子层横排
    </label>

    <XhTreeRoot
      :collection="collection"
      :orientation="orientation"
      :default-expanded-value="['color', 'size']"
    >
      <XhTreeLabel>设计令牌</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch v-for="group in collection" :key="group.value" :value="group.value">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>{{ group.label }}</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem v-for="token in group.children" :key="token.value" :value="token.value">
              <XhTreeItemIndicator />
              <XhTreeItemText>{{ token.label }}</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>
  </div>
</template>
