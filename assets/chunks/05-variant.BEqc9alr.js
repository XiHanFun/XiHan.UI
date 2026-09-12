const e=`// 形态 | variant 只改分段框的底色与描边用法，分段结构与键盘行为都不变
import type { ReactNode } from "react";
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/react";

const variants = ["outline", "subtle", "ghost"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", justifyItems: "start" }}>
      {variants.map(v => (
        <XhTimeFieldRoot key={v} variant={v} defaultValue="09:30">
          <XhTimeFieldLabel>{v}</XhTimeFieldLabel>
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
