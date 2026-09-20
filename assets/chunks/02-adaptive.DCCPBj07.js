const n=`// 自适应列 | 根据最小列宽自动排列
import type { ReactNode } from "react";
import { XhGridItem, XhGridRoot } from "@xihan-ui/react";

const features = [
  { id: 1, tone: "brand" },
  { id: 2, tone: "info" },
  { id: 3, tone: "success" },
  { id: 4, tone: "warning" },
  { id: 5, tone: "danger" },
  { id: 6, tone: "neutral" },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhGridRoot minColWidth="sm" gap="sm" style={{ inlineSize: "min(640px, 100%)" }}>
      {features.map(feature => <XhGridItem key={feature.id} data-demo-block data-tone={feature.tone} />)}
    </XhGridRoot>
  );
}
`;export{n as default};
