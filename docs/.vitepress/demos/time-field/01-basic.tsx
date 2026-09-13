// 基础用法 | 输入时间
import type { CSSProperties, ReactNode } from "react";
import {
  XhTimeFieldControl,
  XhTimeFieldHiddenInput,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhTimeFieldRoot
      name="start-time"
      style={{
        "--xh-time-field-control-min-w": "calc(var(--xh-control-min-w) + var(--xh-control-h-md) + var(--xh-space-6))",
      } as CSSProperties}
    >
      <XhTimeFieldLabel>开始时间</XhTimeFieldLabel>
      <XhTimeFieldControl>
        <XhTimeFieldSegmentGroup>
          <XhTimeFieldSegment segment="hour" />
          <span>:</span>
          <XhTimeFieldSegment segment="minute" />
        </XhTimeFieldSegmentGroup>
      </XhTimeFieldControl>
      <XhTimeFieldHiddenInput />
    </XhTimeFieldRoot>
  );
}
