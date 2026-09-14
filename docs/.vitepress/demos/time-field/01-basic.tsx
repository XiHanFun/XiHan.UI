// 基础用法 | 逐段输入并实时获得标准时间值；有值时可以一键清空
import type { ReactNode } from "react";
import {
  XhTimeFieldClearTrigger,
  XhTimeFieldControl,
  XhTimeFieldHiddenInput,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState("09:30");

  return (
    <>
      <XhTimeFieldRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        name="start-time"
      >
        <XhTimeFieldLabel>开始时间</XhTimeFieldLabel>
        <XhTimeFieldControl>
          <XhTimeFieldSegmentGroup>
            <XhTimeFieldSegment segment="hour" />
            <span>:</span>
            <XhTimeFieldSegment segment="minute" />
          </XhTimeFieldSegmentGroup>
          <XhTimeFieldClearTrigger />
        </XhTimeFieldControl>
        <XhTimeFieldHiddenInput />
      </XhTimeFieldRoot>

      <span aria-live="polite" style={{ fontSize: "13px" }}>
        {`当前值：${value || "（未填齐）"}`}
      </span>
    </>
  );
}
