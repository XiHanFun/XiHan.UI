// 呈现方式 | date 只到日、datetime 到秒、relative 说成「几分钟前」；datetime 属性的精度跟着走
import type { CSSProperties, ReactNode } from "react";
import { XhTimestamp } from "@xihan-ui/react";
import { Fragment } from "react";

const value = "2026-08-11T09:30:05";
// 参照时刻写死，示例的产出才不随打开页面的时间变
const now = "2026-08-11T12:00:00";

const types = ["date", "datetime", "relative"] as const;

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto auto",
  gap: "8px 24px",
  justifyContent: "start",
};

export default function Demo(): ReactNode {
  return (
    <div style={grid}>
      {types.map(type => (
        <Fragment key={type}>
          <code>{type}</code>
          <XhTimestamp value={value} type={type} now={now} />
        </Fragment>
      ))}
    </div>
  );
}
