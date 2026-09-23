// 基础用法 | collection 是层级元信息的唯一事实源，标记只负责外观；缩进由子层容器自行撑开
import type { ReactNode } from "react";
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
} from "@xihan-ui/react";

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

export default function Demo(): ReactNode {
  return (
    <XhTreeRoot
      collection={collection}
      defaultExpandedValue={["src"]}
      style={{ inlineSize: "100%", maxInlineSize: "320px" }}
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
  );
}
