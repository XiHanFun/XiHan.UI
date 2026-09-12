// 形态 | variant 换按钮的底色、描边与前景怎么用；这里把露面门槛设成 0，不滚也看得见
import type { CSSProperties, ReactNode } from "react";
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/react";
import { useState } from "react";

const boxStyle: CSSProperties = {
  blockSize: "160px",
  overflow: "auto",
  padding: "12px",
  border: "1px solid var(--xh-border-default)",
  borderRadius: "8px",
};
const rootStyle = {
  "position": "absolute",
  "--xh-back-top-inset-block": "12px",
  "--xh-back-top-inset-inline": "12px",
} as CSSProperties;

export default function Demo(): ReactNode {
  const [solidEl, setSolidEl] = useState<HTMLElement | null>(null);
  const [outlineEl, setOutlineEl] = useState<HTMLElement | null>(null);
  const [ghostEl, setGhostEl] = useState<HTMLElement | null>(null);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      <div style={{ position: "relative", inlineSize: "200px" }}>
        <div ref={setSolidEl} style={boxStyle}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(i => (
            <p key={i} style={{ margin: "0 0 12px" }}>{`实心 ${i}`}</p>
          ))}
        </div>
        <XhBackTopRoot target={solidEl} variant="solid" visibilityHeight={0} style={rootStyle}>
          <XhBackTopTrigger />
        </XhBackTopRoot>
      </div>

      <div style={{ position: "relative", inlineSize: "200px" }}>
        <div ref={setOutlineEl} style={boxStyle}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(i => (
            <p key={i} style={{ margin: "0 0 12px" }}>{`描边 ${i}`}</p>
          ))}
        </div>
        <XhBackTopRoot target={outlineEl} variant="outline" visibilityHeight={0} style={rootStyle}>
          <XhBackTopTrigger />
        </XhBackTopRoot>
      </div>

      <div style={{ position: "relative", inlineSize: "200px" }}>
        <div ref={setGhostEl} style={boxStyle}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(i => (
            <p key={i} style={{ margin: "0 0 12px" }}>{`幽灵 ${i}`}</p>
          ))}
        </div>
        <XhBackTopRoot target={ghostEl} variant="ghost" visibilityHeight={0} style={rootStyle}>
          <XhBackTopTrigger />
        </XhBackTopRoot>
      </div>
    </div>
  );
}
