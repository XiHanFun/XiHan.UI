// 形态 | variant 只改选中态怎么画，切换行为与键盘操作三档一致；不写 variant 即 line 档
import type { ReactNode } from "react";
import { XhTabsRoot } from "@xihan-ui/react";

// 第一档不写 variant，用 undefined 表达 line 缺省
const variants = [
  { variant: undefined, label: "line（缺省）" },
  { variant: "card", label: "card" },
  { variant: "segment", label: "segment" },
] as const;

const tabs = [
  { value: "overview", label: "概览" },
  { value: "usage", label: "用法" },
  { value: "api", label: "API" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", inlineSize: "100%" }}>
      {variants.map(v => (
        <div key={v.label}>
          <div style={{ marginBlockEnd: "8px", fontSize: "12px" }}>{v.label}</div>
          <XhTabsRoot
            variant={v.variant}
            collection={tabs}
            defaultValue="overview"
            style={{ inlineSize: "100%" }}
            renderPanel={node => `${node.label}面板`}
          />
        </div>
      ))}
    </div>
  );
}
