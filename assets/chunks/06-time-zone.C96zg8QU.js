const n=`// 时区 | time-zone 给了 IANA 时区名就按那个时区的墙钟显示，datetime 带上该时区的偏移量；不带偏移量的 value 串也按这个时区解读
import type { CSSProperties, ReactNode } from "react";
import { XhTimestamp } from "@xihan-ui/react";
import { Fragment } from "react";

// 同一个时刻：带 Z 的串是确切时刻，与时区无关
const launch = "2026-08-11T01:30:00Z";

const zones = [
  { label: "上海", timeZone: "Asia/Shanghai" },
  { label: "伦敦", timeZone: "Europe/London" },
  { label: "纽约", timeZone: "America/New_York" },
];

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto auto",
  gap: "8px 24px",
  justifyContent: "start",
};

export default function Demo(): ReactNode {
  return (
    <div style={grid}>
      {zones.map(zone => (
        <Fragment key={zone.timeZone}>
          <span>{zone.label}</span>
          <XhTimestamp value={launch} timeZone={zone.timeZone} locale="zh-CN" />
        </Fragment>
      ))}
    </div>
  );
}
`;export{n as default};
