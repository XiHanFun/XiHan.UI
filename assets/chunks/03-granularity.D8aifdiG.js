const e=`// 精度到秒 | granularity=second 让秒段显出来并参与值，空段按上下键从该段边界起步
import type { ReactNode } from "react";
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState("");

  return (
    <>
      <XhTimeFieldRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        granularity="second"
      >
        <XhTimeFieldLabel>定时</XhTimeFieldLabel>
        <XhTimeFieldControl>
          <XhTimeFieldSegmentGroup>
            <XhTimeFieldSegment segment="hour" />
            <span>:</span>
            <XhTimeFieldSegment segment="minute" />
            <span>:</span>
            <XhTimeFieldSegment segment="second" />
          </XhTimeFieldSegmentGroup>
        </XhTimeFieldControl>
      </XhTimeFieldRoot>

      <span style={{ fontSize: "13px" }}>{\`当前值：\${value || "（未填齐）"}\`}</span>
    </>
  );
}
`;export{e as default};
