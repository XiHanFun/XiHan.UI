var e=`// 12 小时制 | hourCycle=12 时小时段收 1-12，分钟段之后多出上下午段（按 a / p 切换），值仍是 24 小时制的 ISO 串
import type { ReactNode } from "react";
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string | null>("2026-07-28T21:05");

  return (
    <>
      <XhDateFieldRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        locale="en-US"
        granularity="minute"
        hourCycle={12}
      >
        <XhDateFieldLabel>Departure</XhDateFieldLabel>
        <XhDateFieldControl>
          <XhDateFieldSegmentGroup>
            <XhDateFieldSegment index={0} />
            <span>/</span>
            <XhDateFieldSegment index={1} />
            <span>/</span>
            <XhDateFieldSegment index={2} />
            <span>&nbsp;</span>
            <XhDateFieldSegment index={3} />
            <span>:</span>
            <XhDateFieldSegment index={4} />
            <span>&nbsp;</span>
            <XhDateFieldSegment segment="dayPeriod" />
          </XhDateFieldSegmentGroup>
        </XhDateFieldControl>
      </XhDateFieldRoot>

      <span style={{ fontSize: "13px" }}>{\`当前值：\${value ?? "（空）"}\`}</span>
    </>
  );
}
`;export{e as default};