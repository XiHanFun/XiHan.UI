// 禁用与越界 | 禁用整组退出 Tab 序；越界只做标注，08:00 原样留着不被改写
import type { ReactNode } from "react";
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <XhTimeFieldRoot defaultValue="13:45" disabled>
        <XhTimeFieldLabel>禁用</XhTimeFieldLabel>
        <XhTimeFieldControl>
          <XhTimeFieldSegmentGroup>
            <XhTimeFieldSegment segment="hour" />
            <span>:</span>
            <XhTimeFieldSegment segment="minute" />
          </XhTimeFieldSegmentGroup>
        </XhTimeFieldControl>
      </XhTimeFieldRoot>

      <XhTimeFieldRoot defaultValue="08:00" min="09:00" max="18:00">
        <XhTimeFieldLabel>越界（09:00 – 18:00）</XhTimeFieldLabel>
        <XhTimeFieldControl>
          <XhTimeFieldSegmentGroup>
            <XhTimeFieldSegment segment="hour" />
            <span>:</span>
            <XhTimeFieldSegment segment="minute" />
          </XhTimeFieldSegmentGroup>
        </XhTimeFieldControl>
      </XhTimeFieldRoot>
    </div>
  );
}
