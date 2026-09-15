const e=`// 平台键名 | 常用按键与跨平台组合由 Headless 统一格式化
import type { ReactNode } from "react";
import { XhKbd } from "@xihan-ui/react";

const keys = [["Mod"], ["Shift"], ["ArrowUp"], ["Escape"], ["Mod", "Shift", "P"]];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {keys.map(item => <XhKbd key={item.join("-")} keys={item} />)}
    </div>
  );
}
`;export{e as default};
