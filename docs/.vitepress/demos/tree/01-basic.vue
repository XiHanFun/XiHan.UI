<!-- 基础用法 | collection 是层级元信息的唯一事实源，标记只管长相；缩进由子层容器自己顶着 -->
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
      {
        value: "components",
        label: "components",
        children: [
          { value: "button", label: "Button.vue" },
          { value: "dialog", label: "Dialog.vue" },
        ],
      },
      { value: "main", label: "main.ts" },
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
  { value: "readme", label: "README.md" },
];
</script>

<template>
  <XhTreeRoot
    :collection="collection"
    :default-expanded-value="['src']"
    style="inline-size: 100%; max-inline-size: 320px"
  >
    <XhTreeLabel>项目文件</XhTreeLabel>
    <XhTreeTree>
      <XhTreeBranch value="src">
        <XhTreeBranchControl>
          <XhTreeBranchTrigger>▸</XhTreeBranchTrigger>
          <XhTreeBranchText>src</XhTreeBranchText>
        </XhTreeBranchControl>
        <XhTreeBranchContent>
          <XhTreeBranch value="components">
            <XhTreeBranchControl>
              <XhTreeBranchTrigger>▸</XhTreeBranchTrigger>
              <XhTreeBranchText>components</XhTreeBranchText>
            </XhTreeBranchControl>
            <XhTreeBranchContent>
              <XhTreeItem value="button">
                <XhTreeItemIndicator>✓</XhTreeItemIndicator>
                <XhTreeItemText>Button.vue</XhTreeItemText>
              </XhTreeItem>
              <XhTreeItem value="dialog">
                <XhTreeItemIndicator>✓</XhTreeItemIndicator>
                <XhTreeItemText>Dialog.vue</XhTreeItemText>
              </XhTreeItem>
            </XhTreeBranchContent>
          </XhTreeBranch>
          <XhTreeItem value="main">
            <XhTreeItemIndicator>✓</XhTreeItemIndicator>
            <XhTreeItemText>main.ts</XhTreeItemText>
          </XhTreeItem>
        </XhTreeBranchContent>
      </XhTreeBranch>

      <XhTreeBranch value="docs">
        <XhTreeBranchControl>
          <XhTreeBranchTrigger>▸</XhTreeBranchTrigger>
          <XhTreeBranchText>docs</XhTreeBranchText>
        </XhTreeBranchControl>
        <XhTreeBranchContent>
          <XhTreeItem value="guide">
            <XhTreeItemIndicator>✓</XhTreeItemIndicator>
            <XhTreeItemText>guide.md</XhTreeItemText>
          </XhTreeItem>
          <XhTreeItem value="api">
            <XhTreeItemIndicator>✓</XhTreeItemIndicator>
            <XhTreeItemText>api.md</XhTreeItemText>
          </XhTreeItem>
        </XhTreeBranchContent>
      </XhTreeBranch>

      <XhTreeItem value="readme">
        <XhTreeItemIndicator>✓</XhTreeItemIndicator>
        <XhTreeItemText>README.md</XhTreeItemText>
      </XhTreeItem>
    </XhTreeTree>
  </XhTreeRoot>
</template>
