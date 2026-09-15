const t=`// 外观 | default 使用中性底，light 保持透明
import type { ReactNode } from "react";
import { XhKbd } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", gap: "12px" }}>
      <XhKbd keys={["Enter"]} />
      <XhKbd keys={["Enter"]} variant="light" />
    </div>
  );
}
`;export{t as default};
