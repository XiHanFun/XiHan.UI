// 语气 | tone 决定用哪族颜色，与 variant 正交，这里统一用 subtle 形态
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

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start" }}>
      {tones.map(t => (
        <XhTreeSelectRoot
          key={t}
          collection={files}
          variant="subtle"
          tone={t}
          defaultValue={["guide"]}
          defaultExpandedValue={["docs"]}
          placeholder="选一个文件"
          style={{ inlineSize: "220px" }}
        >
          <XhTreeSelectLabel>{t}</XhTreeSelectLabel>
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
