const e=`<!-- 形态 | variant="plain" 去掉外框与底色，树直接落在页面上；缺省 surface 保持带框的样子 -->
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
<\/script>

<template>
  <div style="display: grid; gap: 16px; inline-size: 100%; max-inline-size: 320px">
    <XhTreeRoot
      v-for="variant in (['surface', 'plain'] as const)"
      :key="variant"
      :collection="collection"
      :variant="variant"
      :default-expanded-value="['src']"
    >
      <XhTreeTree>
        <XhTreeBranch value="src">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>src</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="main">
              <XhTreeItemIndicator />
              <XhTreeItemText>main.ts</XhTreeItemText>
            </XhTreeItem>
            <XhTreeItem value="app">
              <XhTreeItemIndicator />
              <XhTreeItemText>App.vue</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
        <XhTreeItem value="readme">
          <XhTreeItemIndicator />
          <XhTreeItemText>README.md</XhTreeItemText>
        </XhTreeItem>
      </XhTreeTree>
    </XhTreeRoot>
  </div>
</template>
`;export{e as default};
