const e=`// 角度、疏密与深浅 | rotate 转整块图样，gap 决定两块之间留多少空白，fontSize 与 opacity 决定字多大、印多深
import type { ReactNode } from "react";
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/react";

const looks = [
  { label: "缺省", rotate: undefined, gap: undefined, fontSize: undefined, opacity: undefined },
  { label: "平着排、印得密", rotate: 0, gap: 8, fontSize: 12, opacity: 0.18 },
  { label: "转 45 度、印得疏", rotate: -45, gap: 56, fontSize: 18, opacity: 0.12 },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {looks.map(l => (
        <XhWatermarkRoot
          key={l.label}
          text="曦寒"
          rotate={l.rotate}
          gap={l.gap}
          fontSize={l.fontSize}
          opacity={l.opacity}
          style={{ inlineSize: "220px", border: "1px solid var(--xh-border-default)", borderRadius: "6px" }}
        >
          <XhWatermarkContent>
            <div style={{ padding: "16px", blockSize: "160px", fontSize: "13px" }}>{l.label}</div>
          </XhWatermarkContent>
        </XhWatermarkRoot>
      ))}
    </div>
  );
}
`;export{e as default};
