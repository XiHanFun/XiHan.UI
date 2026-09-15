const e=`// 基础用法 | collection 是层级元信息的唯一事实源，标记只管长相；缩进由子层容器自己顶着
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
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeBranch value="components">
              <XhTreeBranchControl>
                <XhTreeBranchTrigger />
                <XhTreeBranchText>components</XhTreeBranchText>
              </XhTreeBranchControl>
              <XhTreeBranchContent>
                <XhTreeItem value="button">
                  <XhTreeItemIndicator />
                  <XhTreeItemText>Button.vue</XhTreeItemText>
                </XhTreeItem>
                <XhTreeItem value="dialog">
                  <XhTreeItemIndicator />
                  <XhTreeItemText>Dialog.vue</XhTreeItemText>
                </XhTreeItem>
              </XhTreeBranchContent>
            </XhTreeBranch>
            <XhTreeItem value="main">
              <XhTreeItemIndicator />
              <XhTreeItemText>main.ts</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>

        <XhTreeBranch value="docs">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>docs</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="guide">
              <XhTreeItemIndicator />
              <XhTreeItemText>guide.md</XhTreeItemText>
            </XhTreeItem>
            <XhTreeItem value="api">
              <XhTreeItemIndicator />
              <XhTreeItemText>api.md</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>

        <XhTreeItem value="readme">
          <XhTreeItemIndicator />
          <XhTreeItemText>README.md</XhTreeItemText>
        </XhTreeItem>
      </XhTreeTree>
    </XhTreeRoot>
  );
}
`;export{e as default};
