const e=`// 段位可拼装 | segments 决定这份控件由哪几块组成；段位可按段名认领，不必数下标
import type { DateSegmentSet } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/react";
import { useState } from "react";

const QUARTER: DateSegmentSet = ["year", "quarter"];
const WEEK: DateSegmentSet = ["year", "week"];
const AT: DateSegmentSet = ["year", "month", "day", "hour", "dayPeriod"];

export default function Demo(): ReactNode {
  // 值的形态不变，仍是 ISO 日期串：季度取那一季的头一个月、周取那一周的周首日
  const [quarter, setQuarter] = useState<string | null>("2026-04-01");
  const [week, setWeek] = useState<string | null>("2026-08-10");
  const [at, setAt] = useState<string | null>("2026-08-17T09");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <XhDateFieldRoot
        value={quarter}
        onValueChange={details => setQuarter(details.value)}
        segments={QUARTER}
        locale="zh-CN"
      >
        <XhDateFieldLabel>结算季度</XhDateFieldLabel>
        <XhDateFieldControl>
          <XhDateFieldSegmentGroup>
            {/* 按段名认领：写死这一格就是年、那一格就是季度，不必数下标 */}
            <XhDateFieldSegment segment="year" />
            <span>-</span>
            <XhDateFieldSegment segment="quarter" />
          </XhDateFieldSegmentGroup>
        </XhDateFieldControl>
      </XhDateFieldRoot>
      <span style={{ fontSize: "13px" }}>{quarter ?? "（未填齐）"}</span>

      <XhDateFieldRoot
        value={week}
        onValueChange={details => setWeek(details.value)}
        segments={WEEK}
        locale="zh-CN"
      >
        <XhDateFieldLabel>排期周</XhDateFieldLabel>
        <XhDateFieldControl>
          <XhDateFieldSegmentGroup>
            <XhDateFieldSegment segment="year" />
            <span>-</span>
            <XhDateFieldSegment segment="week" />
          </XhDateFieldSegmentGroup>
          {/* 「周」与「年 / 月 / 日」一样是普通节点，段位自己只出数字 */}
          <span>周</span>
        </XhDateFieldControl>
      </XhDateFieldRoot>
      <span style={{ fontSize: "13px" }}>{\`\${week ?? "（未填齐）"}（那一周的周首日）\`}</span>

      <XhDateFieldRoot
        value={at}
        onValueChange={details => setAt(details.value)}
        segments={AT}
        locale="zh-CN"
      >
        <XhDateFieldLabel>开始时间</XhDateFieldLabel>
        <XhDateFieldControl>
          <XhDateFieldSegmentGroup>
            <XhDateFieldSegment segment="year" />
            <span>-</span>
            <XhDateFieldSegment segment="month" />
            <span>-</span>
            <XhDateFieldSegment segment="day" />
            <span>&nbsp;</span>
            {/* 段集里带上下午时，小时段收的是 12 时制的那个数；a / p 键直接指定 */}
            <XhDateFieldSegment segment="hour" />
            <span>&nbsp;</span>
            <XhDateFieldSegment segment="dayPeriod" />
          </XhDateFieldSegmentGroup>
        </XhDateFieldControl>
      </XhDateFieldRoot>
      <span style={{ fontSize: "13px" }}>{at ?? "（未填齐）"}</span>
    </div>
  );
}
`;export{e as default};
