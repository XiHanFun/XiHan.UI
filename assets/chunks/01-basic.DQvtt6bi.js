const n=`// 基础用法 | 一维排布容器：子项横着排，间距走档位，容器自己不给子项加任何样式
import type { ReactNode } from "react";
import { XhFlex } from "@xihan-ui/react";

const boxStyle = {
  padding: "8px 14px",
  borderRadius: "var(--xh-radius-md)",
  background: "var(--xh-bg-subtle)",
  color: "var(--xh-fg-default)",
};

export default function Demo(): ReactNode {
  return (
    <XhFlex gap="sm">
      <span style={boxStyle}>甲</span>
      <span style={boxStyle}>乙</span>
      <span style={boxStyle}>丙</span>
    </XhFlex>
  );
}
`;export{n as default};
