const e=`// 方向 | 设置水平或垂直排列
import type { CSSProperties, ReactNode } from "react";
import { XhFlex } from "@xihan-ui/react";

const items = [
  { id: "设计", tone: "brand" },
  { id: "开发", tone: "info" },
  { id: "测试", tone: "success" },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhFlex orientation="vertical" gap="lg">
      <XhFlex gap="sm">
        {items.map(item => <span key={item.id} data-demo-block data-tone={item.tone} style={{ "--xh-demo-block-inline-size": "72px" } as CSSProperties} />)}
      </XhFlex>
      <XhFlex orientation="vertical" gap="sm" style={{ inlineSize: "120px" }}>
        {items.map(item => <span key={item.id} data-demo-block data-tone={item.tone} />)}
      </XhFlex>
    </XhFlex>
  );
}
`;export{e as default};
