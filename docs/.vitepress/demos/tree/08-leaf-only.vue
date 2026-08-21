<!-- 只让叶子进选中集合 | 选中受控就由宿主定夺：分支的值直接不写回，点目录只剩展开收起这一个效果 -->
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
    value: "src",
    label: "src",
    children: [
      { value: "index", label: "index.ts" },
      { value: "app", label: "app.vue" },
    ],
  },
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
      { value: "api", label: "api.md" },
    ],
  },
];

const leaves = new Set(collection.flatMap((dir) => dir.children.map((file) => file.value)));

const selected = ref<string[]>([]);

function onSelectionChange(details: { value: string[] }): void {
  selected.value = details.value.filter((value) => leaves.has(value));
}
</script>

<template>
  <div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
    <XhTreeRoot
      :collection="collection"
      :selected-value="selected"
      :default-expanded-value="['src']"
      selection-mode="multiple"
      @selection-change="onSelectionChange"
    >
      <XhTreeLabel>要提交的文件</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch v-for="dir in collection" :key="dir.value" :value="dir.value">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>{{ dir.label }}</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem v-for="file in dir.children" :key="file.value" :value="file.value">
              <XhTreeItemIndicator />
              <XhTreeItemText>{{ file.label }}</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>
    <span>已选：{{ selected.length ? selected.join("、") : "（无）" }}</span>
  </div>
</template>
