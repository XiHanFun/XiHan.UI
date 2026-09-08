// 形态 | variant 只换触发框的描边与底色，浮层与树的长相不跟着变
import type { ReactNode } from "react";
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/react";

const files = [
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

const variants = ["outline", "subtle", "ghost"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start" }}>
      {variants.map(v => (
        <XhTreeSelectRoot
          key={v}
          collection={files}
          variant={v}
          defaultExpandedValue={["docs"]}
          placeholder="选一个文件"
          style={{ inlineSize: "220px" }}
        >
          <XhTreeSelectLabel>{v}</XhTreeSelectLabel>
          <XhTreeSelectControl>
            <XhTreeSelectTrigger>
              <XhTreeSelectValueText />
              <XhTreeSelectIndicator />
            </XhTreeSelectTrigger>
          </XhTreeSelectControl>
          <XhTreeSelectPositioner>
            <XhTreeSelectContent>
              <XhTreeSelectTree>
                <XhTreeSelectBranch value="docs">
                  <XhTreeSelectBranchControl>
                    <XhTreeSelectBranchTrigger />
                    <XhTreeSelectBranchText>docs</XhTreeSelectBranchText>
                  </XhTreeSelectBranchControl>
                  <XhTreeSelectBranchContent>
                    <XhTreeSelectItem value="guide">
                      <XhTreeSelectItemIndicator />
                      <XhTreeSelectItemText>guide.md</XhTreeSelectItemText>
                    </XhTreeSelectItem>
                    <XhTreeSelectItem value="api">
                      <XhTreeSelectItemIndicator />
                      <XhTreeSelectItemText>api.md</XhTreeSelectItemText>
                    </XhTreeSelectItem>
                  </XhTreeSelectBranchContent>
                </XhTreeSelectBranch>
                <XhTreeSelectItem value="readme">
                  <XhTreeSelectItemIndicator />
                  <XhTreeSelectItemText>README.md</XhTreeSelectItemText>
                </XhTreeSelectItem>
              </XhTreeSelectTree>
            </XhTreeSelectContent>
          </XhTreeSelectPositioner>
        </XhTreeSelectRoot>
      ))}
    </div>
  );
}
