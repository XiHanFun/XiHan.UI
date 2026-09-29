const e=`<!-- 尺寸 | size 写到 root 的 data-size：行高、字号、展开箭头与对号盒、层级缩进一起随档；三档并排，缺省即 md -->
<script setup lang="ts">
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
      { value: "main", label: "main.ts" },
      { value: "app", label: "App.vue" },
    ],
  },
  { value: "readme", label: "README.md" },
];

// 中间档不传 size，缺省即 md
const sizes = [
  { key: "sm", size: "sm", label: "sm" },
  { key: "md", size: undefined, label: "缺省（md）" },
  { key: "lg", size: "lg", label: "lg" },
] as const;
<\/script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start">
    <XhTreeRoot
      v-for="s in sizes"
      :key="s.key"
      :collection="collection"
      :size="s.size"
      :default-expanded-value="['src']"
      :default-selection="['main']"
      style="flex: 1 1 180px; min-width: 180px"
    >
      <XhTreeLabel>{{ s.label }}</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch value="src">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>src</XhTreeBranchText>
            <XhTreeItemIndicator />
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="main">
              <XhTreeItemText>main.ts</XhTreeItemText>
              <XhTreeItemIndicator />
            </XhTreeItem>
            <XhTreeItem value="app">
              <XhTreeItemText>App.vue</XhTreeItemText>
              <XhTreeItemIndicator />
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
        <XhTreeItem value="readme">
          <XhTreeItemText>README.md</XhTreeItemText>
          <XhTreeItemIndicator />
        </XhTreeItem>
      </XhTreeTree>
    </XhTreeRoot>
  </div>
</template>
`;export{e as default};
