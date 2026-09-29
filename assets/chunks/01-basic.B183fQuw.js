const a=`// 基础用法 | 一组数画成一条折线，末点标出现在的位置；可及名写在 aria-label 上，摘要由组件生成
import type { ReactNode } from "react";
import { XhSparkline } from "@xihan-ui/react";

// 近 12 周的访问量：迷你图只看形状，不读具体的值
const visits = [320, 356, 341, 398, 420, 388, 452, 470, 431, 498, 520, 548];

export default function Demo(): ReactNode {
  return <XhSparkline data={visits} aria-label="近 12 周访问量" />;
}
`;export{a as default};
