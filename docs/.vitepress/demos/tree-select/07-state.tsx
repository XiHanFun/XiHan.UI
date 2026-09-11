// 禁用、只读与校验失败 | disabled 连键盘入口都没有；readOnly 照常展开浏览但值改不动也清不掉；invalid 只报校验态，交互一切照旧
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

const states = [
  { key: "disabled", label: "禁用", disabled: true, readOnly: false, invalid: false },
  { key: "readonly", label: "只读", disabled: false, readOnly: true, invalid: false },
  { key: "invalid", label: "校验失败", disabled: false, readOnly: false, invalid: true },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start" }}>
      {states.map(s => (
        <XhTreeSelectRoot
          key={s.key}
          collection={files}
          disabled={s.disabled}
          readOnly={s.readOnly}
          invalid={s.invalid}
          defaultValue={["guide"]}
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
                    <XhTreeSelectItemIndicator />
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
