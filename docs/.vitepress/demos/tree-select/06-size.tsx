// 尺寸 | size 换掉行高、内边距与字号，不写就是缺省档
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

// 中间一档不传 size，走皮肤的缺省尺寸
const sizes = [
  { key: "sm", size: "sm", label: "sm" },
  { key: "default", size: undefined, label: "缺省" },
  { key: "lg", size: "lg", label: "lg" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start" }}>
      {sizes.map(s => (
        <XhTreeSelectRoot
          key={s.key}
          collection={files}
          size={s.size}
          defaultExpandedValue={["docs"]}
          placeholder="选一个文件"
          style={{ inlineSize: "220px" }}
        >
          <XhTreeSelectLabel>{s.label}</XhTreeSelectLabel>
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
