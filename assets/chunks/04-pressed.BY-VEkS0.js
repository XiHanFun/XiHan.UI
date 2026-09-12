const e=`// 真实按下 | 键帽只在可交互 owner 真正 active 时轻压
import type { ReactNode } from "react";
import { XhKbd } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <button type="button" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
    按住我 <XhKbd value="Enter" />
  </button>;
}
`;export{e as default};
