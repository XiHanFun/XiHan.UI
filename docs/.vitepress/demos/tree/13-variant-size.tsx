// 形态与尺寸 | 缺省 ghost 不带外框与底色，树直接落在页面上，variant="outline" 换成带框的外观；size 写到 root 的 data-size，行高、字号、展开箭头与对号盒、层级缩进一起随档，缺省即 md
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
      { value: "main", label: "main.ts" },
      { value: "app", label: "App.vue" },
    ],
  },
  { value: "readme", label: "README.md" },
];

const variants = ["outline", "ghost"] as const;

// 中间档不传 size，缺省即 md
const sizes = [
  { key: "sm", size: "sm", label: "sm" },
  { key: "md", size: undefined, label: "缺省（md）" },
  { key: "lg", size: "lg", label: "lg" },
] as const;

function Files(): ReactNode {
  return (
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
  );
}

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-8)", inlineSize: "100%" }}>
      <div style={{ display: "grid", gap: "var(--xh-space-4)", inlineSize: "100%", maxInlineSize: "320px" }}>
        {variants.map(variant => (
          <XhTreeRoot
            key={variant}
            collection={collection}
            variant={variant}
            defaultExpandedValue={["src"]}
          >
            <Files />
          </XhTreeRoot>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-4)", alignItems: "flex-start" }}>
        {sizes.map(s => (
          <XhTreeRoot
            key={s.key}
            collection={collection}
            size={s.size}
            defaultExpandedValue={["src"]}
            defaultSelection={["main"]}
            style={{ flex: "1 1 180px", minWidth: "180px" }}
          >
            <XhTreeLabel>{s.label}</XhTreeLabel>
            <Files />
          </XhTreeRoot>
        ))}
      </div>
    </div>
  );
}
