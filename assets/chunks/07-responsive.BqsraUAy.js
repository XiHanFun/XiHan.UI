var e=`// 响应式排布 | 方向、对齐、分布与间距都可以按视口逐档书写：窄屏竖排、md 起横排并拉开间距
import type { ReactNode } from "react";
import { XhFlex } from "@xihan-ui/react";

const items = [
  { id: "设计", tone: "brand" },
  { id: "开发", tone: "info" },
  { id: "测试", tone: "success" },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhFlex
      orientation={{ base: "vertical", md: "horizontal" }}
      gap={{ base: "sm", md: "lg" }}
      style={{ inlineSize: "min(560px, 100%)" }}
    >
      {items.map(item => <span key={item.id} data-demo-block data-tone={item.tone} style={{ flex: 1 }} />)}
    </XhFlex>
  );
}
`;export{e as default};