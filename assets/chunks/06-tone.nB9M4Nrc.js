const n=`// 语气 | tone 决定选中态用哪族颜色，与 variant 正交；这里固定 card 形态只看语气的差别
import type { ReactNode } from "react";
import { XhTabsRoot } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

// 每族一套标签，选中那张的文本带上语气名
const groups = tones.map(tone => ({
  tone,
  tabs: [
    { value: "selected", label: \`\${tone}（选中）\` },
    { value: "other", label: "未选" },
  ],
}));

const panels: Record<string, string> = {
  selected: "选中面板",
  other: "另一个面板",
};

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", inlineSize: "100%" }}>
      {groups.map(g => (
        <XhTabsRoot
          key={g.tone}
          variant="card"
          tone={g.tone}
          collection={g.tabs}
          defaultValue="selected"
          style={{ inlineSize: "100%" }}
          renderPanel={node => panels[node.value]}
        />
      ))}
    </div>
  );
}
`;export{n as default};
