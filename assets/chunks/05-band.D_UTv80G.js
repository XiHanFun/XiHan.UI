const n=`// 参考带 | band 把正常区间画成一条淡底，一眼看出哪几次越界；纵向范围会扩到把它包进来
import type { ReactNode } from "react";
import { XhSparkline } from "@xihan-ui/react";

// 近 14 天的接口 P95 延迟（ms），正常区间 120–200
const latency = [150, 162, 148, 171, 188, 214, 196, 172, 165, 158, 231, 204, 179, 168];

export default function Demo(): ReactNode {
  return <XhSparkline data={latency} band={[120, 200]} aria-label="近 14 天 P95 延迟，正常区间 120 到 200 毫秒" />;
}
`;export{n as default};
