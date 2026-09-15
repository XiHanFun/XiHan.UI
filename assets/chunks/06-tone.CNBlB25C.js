const e=`// 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，只看语气这一轴
import type { ReactNode } from "react";
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {tones.map(t => (
        <XhTimeFieldRoot key={t} variant="subtle" tone={t} defaultValue="09:30">
          <XhTimeFieldLabel>{t}</XhTimeFieldLabel>
          <XhTimeFieldControl>
            <XhTimeFieldSegmentGroup>
              <XhTimeFieldSegment segment="hour" />
              <span>:</span>
              <XhTimeFieldSegment segment="minute" />
            </XhTimeFieldSegmentGroup>
          </XhTimeFieldControl>
        </XhTimeFieldRoot>
      ))}
    </div>
  );
}
`;export{e as default};
