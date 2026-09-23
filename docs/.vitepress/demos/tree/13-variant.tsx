// 形态 | variant="ghost" 去掉外框与底色，树直接落在页面上；默认 outline 保持带框的外观
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
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/react";

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

const variants = ["outline", "ghost"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", inlineSize: "100%", maxInlineSize: "320px" }}>
      {variants.map(variant => (
        <XhTreeRoot
          key={variant}
          collection={collection}
          variant={variant}
          defaultExpandedValue={["src"]}
        >
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
      ))}
    </div>
  );
}
