const n=`// 语气 | tone 只换进度段的底色（取柔和档）；条子本身是 fixed，这里给它写死 absolute 并配一个相对定位的框子，六条才留在示例里而不是叠到页面顶边
import type { CSSProperties, ReactNode } from "react";
import {
  XhLoadingBarRange,
  XhLoadingBarRoot,
  XhLoadingBarTrack,
} from "@xihan-ui/react";

const tones = [
  { value: "brand", label: "brand 品牌" },
  { value: "neutral", label: "neutral 中性" },
  { value: "success", label: "success 成功" },
  { value: "warning", label: "warning 警示" },
  { value: "danger", label: "danger 危险" },
  { value: "info", label: "info 提示" },
] as const;

// 框住条子：条子改走 absolute，inset 就落在这个框上
const frameStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  inlineSize: "100%",
  blockSize: "6px",
  borderRadius: "999px",
  background: "var(--xh-bg-muted)",
};

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", inlineSize: "100%" }}>
      {tones.map(tone => (
        <div key={tone.value} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span>{tone.label}</span>
          <div style={frameStyle}>
            <XhLoadingBarRoot
              loading
              value={60}
              height={6}
              tone={tone.value}
              style={{ position: "absolute" }}
            >
              <XhLoadingBarTrack>
                <XhLoadingBarRange />
              </XhLoadingBarTrack>
            </XhLoadingBarRoot>
          </div>
        </div>
      ))}
    </div>
  );
}
`;export{n as default};
