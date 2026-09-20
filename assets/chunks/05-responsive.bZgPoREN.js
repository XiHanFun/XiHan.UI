const n=`// 响应式列 | 在不同视口使用不同列数
import type { ReactNode } from "react";
import { XhGridItem, XhGridRoot } from "@xihan-ui/react";

const sections = [
  { id: 1, tone: "brand" },
  { id: 2, tone: "info" },
  { id: 3, tone: "success" },
  { id: 4, tone: "warning" },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhGridRoot cols={{ base: 1, sm: 2, lg: 4 }} gap="sm" style={{ inlineSize: "min(720px, 100%)" }}>
      {sections.map(section => <XhGridItem key={section.id} data-demo-block data-tone={section.tone} />)}
    </XhGridRoot>
  );
}
`;export{n as default};
