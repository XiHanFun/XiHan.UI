const e=`// 方向 | 设置水平或垂直排列
import type { CSSProperties, ReactNode } from "react";
import { XhFlex } from "@xihan-ui/react";

const items = ["设计", "开发", "测试"];
const itemStyle: CSSProperties = {
  padding: "8px 14px",
  borderRadius: "var(--xh-shape-control)",
  background: "var(--xh-bg-subtle)",
};

export default function Demo(): ReactNode {
  return (
    <XhFlex orientation="vertical" gap="lg">
      <XhFlex gap="sm">
        {items.map(item => <span key={item} style={itemStyle}>{item}</span>)}
      </XhFlex>
      <XhFlex orientation="vertical" gap="sm" style={{ inlineSize: "120px" }}>
        {items.map(item => <span key={item} style={itemStyle}>{item}</span>)}
      </XhFlex>
    </XhFlex>
  );
}
`;export{e as default};
