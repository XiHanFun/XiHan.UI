// 形态、语气、尺寸与状态 | variant 只更换触发框的描边与底色，浮层与树的外观不随之变化；tone 与 variant 正交，这里统一使用 subtle 形态；size 更换行高、内边距与字号，不写即默认档；disabled 连键盘入口都没有，readOnly 照常展开浏览但值不可修改也不可清空，invalid 只报告校验态，交互一切照常
import type { ControlVariant, Size, Tone } from "@xihan-ui/core";
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

interface Entry {
  key: string;
  label: string;
  variant?: ControlVariant;
  tone?: Tone;
  size?: Size;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  defaultValue?: string[];
}

// 一行只换一根轴；语气那一行统一 subtle，尺寸那一行中间一档不传 size，走皮肤的缺省尺寸
const rows: Entry[][] = [
  (["outline", "subtle", "ghost"] as const).map(variant => ({ key: variant, label: variant, variant })),
  (["brand", "neutral", "success", "warning", "danger", "info"] as const).map(tone => ({
    key: tone,
    label: tone,
    variant: "subtle",
    tone,
    defaultValue: ["guide"],
  })),
  [
    { key: "sm", label: "sm", size: "sm" },
    { key: "default", label: "缺省" },
    { key: "lg", label: "lg", size: "lg" },
  ],
  [
    { key: "disabled", label: "禁用", disabled: true, defaultValue: ["guide"] },
    { key: "readonly", label: "只读", readOnly: true, defaultValue: ["guide"] },
    { key: "invalid", label: "校验失败", invalid: true, defaultValue: ["guide"] },
  ],
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-6)" }}>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: "var(--xh-space-4)", alignItems: "flex-start" }}>
          {row.map(entry => (
            <XhTreeSelectRoot
              key={entry.key}
              collection={files}
              variant={entry.variant}
              tone={entry.tone}
              size={entry.size}
              disabled={entry.disabled}
              readOnly={entry.readOnly}
              invalid={entry.invalid}
              defaultValue={entry.defaultValue}
              defaultExpandedValue={["docs"]}
              placeholder="选一个文件"
            >
              <XhTreeSelectLabel>{entry.label}</XhTreeSelectLabel>
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
      ))}
    </div>
  );
}
