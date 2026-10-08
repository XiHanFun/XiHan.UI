var e=`<!-- 连接线 | lines 从父节点的展开箭头引出竖线，每个子节点横出一段接到行首、最后一个子节点拐成直角收住，层级深的时候一眼看得出谁挂在谁下面；只是外观，不改结构与键盘 -->
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
<\/script>

<template>
  <XhTreeRoot
    lines
    :collection="collection"
    :default-expanded-value="['src', 'components', 'docs']"
    style="inline-size: 100%; max-inline-size: 320px"
  >
    <XhTreeLabel>项目文件</XhTreeLabel>
    <XhTreeTree>
      <XhTreeBranch value="src">
        <XhTreeBranchControl>
          <XhTreeBranchTrigger />
          <XhTreeBranchText>src</XhTreeBranchText>
          <XhTreeItemIndicator />
        </XhTreeBranchControl>
        <XhTreeBranchContent>
          <XhTreeBranch value="components">
            <XhTreeBranchControl>
              <XhTreeBranchTrigger />
              <XhTreeBranchText>components</XhTreeBranchText>
              <XhTreeItemIndicator />
            </XhTreeBranchControl>
            <XhTreeBranchContent>
              <XhTreeItem value="button">
                <XhTreeItemText>Button.vue</XhTreeItemText>
                <XhTreeItemIndicator />
              </XhTreeItem>
              <XhTreeItem value="dialog">
                <XhTreeItemText>Dialog.vue</XhTreeItemText>
                <XhTreeItemIndicator />
              </XhTreeItem>
            </XhTreeBranchContent>
          </XhTreeBranch>
          <XhTreeItem value="main">
            <XhTreeItemText>main.ts</XhTreeItemText>
            <XhTreeItemIndicator />
          </XhTreeItem>
        </XhTreeBranchContent>
      </XhTreeBranch>

      <XhTreeBranch value="docs">
        <XhTreeBranchControl>
          <XhTreeBranchTrigger />
          <XhTreeBranchText>docs</XhTreeBranchText>
          <XhTreeItemIndicator />
        </XhTreeBranchControl>
        <XhTreeBranchContent>
          <XhTreeItem value="guide">
            <XhTreeItemText>guide.md</XhTreeItemText>
            <XhTreeItemIndicator />
          </XhTreeItem>
          <XhTreeItem value="api">
            <XhTreeItemText>api.md</XhTreeItemText>
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
</template>
`;export{e as default};