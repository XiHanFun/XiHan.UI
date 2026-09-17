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
  { value: "src", label: "src", children: [{ value: "main", label: "main.ts" }, { value: "app", label: "App.vue" }] },
  { value: "readme", label: "README.md" },
];
</script>

<template>
  <XhTreeRoot :collection="collection" :default-expanded-value="['src']" :default-selection="['app']" style="inline-size: var(--xh-doc-catalog-w)">
    <XhTreeTree>
      <XhTreeBranch value="src">
        <XhTreeBranchControl>
          <XhTreeBranchTrigger />
          <XhTreeBranchText>src</XhTreeBranchText>
        </XhTreeBranchControl>
        <XhTreeBranchContent>
          <XhTreeItem value="main"><XhTreeItemIndicator /><XhTreeItemText>main.ts</XhTreeItemText></XhTreeItem>
          <XhTreeItem value="app"><XhTreeItemIndicator /><XhTreeItemText>App.vue</XhTreeItemText></XhTreeItem>
        </XhTreeBranchContent>
      </XhTreeBranch>
      <XhTreeItem value="readme"><XhTreeItemIndicator /><XhTreeItemText>README.md</XhTreeItemText></XhTreeItem>
    </XhTreeTree>
  </XhTreeRoot>
</template>
