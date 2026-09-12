const t=`// 配文字说明 | 进度条自身只画轨道与进度，百分比文字由使用者摆
import type { ReactNode } from "react";
import { XhProgress } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState(64);

  return (
    <div style={{ width: "100%", display: "grid", gap: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>上传中</span>
        <span>{\`\${value}%\`}</span>
      </div>
      <XhProgress value={value} />
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="button" onClick={() => setValue(v => Math.max(0, v - 10))}>-10</button>
        <button type="button" onClick={() => setValue(v => Math.min(100, v + 10))}>+10</button>
      </div>
    </div>
  );
}
`;export{t as default};
