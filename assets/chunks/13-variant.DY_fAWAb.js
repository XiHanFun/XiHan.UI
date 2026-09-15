const e=`// 形态 | variant="plain" 去掉外框与底色，树直接落在页面上；缺省 surface 保持带框的样子
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

const variants = ["surface", "plain"] as const;

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
      ))}
    </div>
  );
}
`;export{e as default};
