const n=`// 五种露面时机 | 缺省的 scroll-hover 滚动或指针进来都露、auto 溢出就露、always 恒露、scroll 只认滚动、hover 只认指针；收起都是淡出
import type { ReactNode } from "react";
import { XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from "@xihan-ui/react";
import { useRef } from "react";

const types = ["scroll-hover", "auto", "always", "scroll", "hover"] as const;
const lines = Array.from({ length: 30 }, (_, i) => \`第 \${i + 1} 行\`);

const boxStyle = {
  blockSize: "140px",
  overflow: "auto",
  scrollbarWidth: "none",
  border: "1px solid var(--xh-border-default)",
  borderRadius: "var(--xh-shape-surface)",
  padding: "8px",
} as const;

export default function Demo(): ReactNode {
  const boxes = useRef<Record<string, HTMLDivElement | null>>({});

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {types.map(type => (
        <div key={type} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "13px", color: "var(--xh-fg-muted)" }}>{\`type="\${type}"\`}</span>
          <div style={{ position: "relative", inlineSize: "150px" }}>
            <div
              ref={(el) => { boxes.current[type] = el; }}
              style={boxStyle}
            >
              {lines.map(line => (
                <div key={line} style={{ paddingBlock: "2px" }}>{line}</div>
              ))}
            </div>
            <XhScrollbarRoot
              scrollable={() => boxes.current[type] ?? null}
              type={type}
              hideDelay={400}
            >
              <XhScrollbarTrack>
                <XhScrollbarThumb />
              </XhScrollbarTrack>
            </XhScrollbarRoot>
          </div>
        </div>
      ))}
    </div>
  );
}
`;export{n as default};
