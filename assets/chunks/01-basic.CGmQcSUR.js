const e=`// 基础用法 | 单键与组合键使用同一组件
import type { ReactNode } from "react";
import { XhKbd } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <XhKbd keys={["Escape"]} />
      <XhKbd keys={["Mod", "K"]} />
    </div>
  );
}
`;export{e as default};
