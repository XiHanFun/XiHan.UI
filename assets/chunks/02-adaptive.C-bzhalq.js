const e=`// 自适应列 | 根据最小列宽自动排列
import type { CSSProperties, ReactNode } from "react";
import { XhGridItem, XhGridRoot } from "@xihan-ui/react";

const features = ["无头内核", "Vue", "React", "Web Components", "设计令牌", "无障碍"];
const cardStyle: CSSProperties = {
  padding: "16px",
  borderRadius: "var(--xh-shape-surface)",
  background: "var(--xh-bg-subtle)",
};

export default function Demo(): ReactNode {
  return (
    <XhGridRoot minColWidth="sm" gap="sm" style={{ inlineSize: "min(640px, 100%)" }}>
      {features.map(feature => <XhGridItem key={feature} style={cardStyle}>{feature}</XhGridItem>)}
    </XhGridRoot>
  );
}
`;export{e as default};
