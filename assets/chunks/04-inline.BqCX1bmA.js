const t=`// 快捷键注册 | 可见提示显式开启 register 后响应按键
import type { ReactNode } from "react";
import { XhKbd } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [count, setCount] = useState(0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <XhKbd keys={["Mod", "K"]} register onHotKey={() => setCount(value => value + 1)} />
      <output>{count ? \`已触发 \${count} 次\` : "按下组合键"}</output>
    </div>
  );
}
`;export{t as default};
