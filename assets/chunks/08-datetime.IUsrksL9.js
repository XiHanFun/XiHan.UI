const e=`// 精确到分 | granularity=minute 在年月日后面接出时、分两段，值随之带上 T 与时间位
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
  const [value, setValue] = useState<string | null>("2026-07-28T13:45");

  return (
    <>
      <XhDateFieldRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        locale="zh-CN"
        granularity="minute"
      >
        <XhDateFieldLabel>发布时间</XhDateFieldLabel>
        <XhDateFieldControl>
          <XhDateFieldSegmentGroup>
            {/* 段序仍由 locale 排：前三段是年月日，时分按精度追加在后面 */}
            <XhDateFieldSegment index={0} />
            <span>年</span>
            <XhDateFieldSegment index={1} />
            <span>月</span>
            <XhDateFieldSegment index={2} />
            <span>日</span>
            <span>&nbsp;</span>
            <XhDateFieldSegment index={3} />
            <span>:</span>
            <XhDateFieldSegment index={4} />
          </XhDateFieldSegmentGroup>
        </XhDateFieldControl>
      </XhDateFieldRoot>

      <span style={{ fontSize: "13px" }}>{\`当前值：\${value ?? "（未填齐）"}\`}</span>
    </>
  );
}
`;export{e as default};
