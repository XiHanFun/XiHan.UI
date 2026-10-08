var e=`// 分段 | steps 把轨道切成等宽的格，填充按整格亮起；读屏报的仍是实际值
import type { ReactNode } from "react";
import { XhProgress } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [step, setStep] = useState(3);

  return (
    <div style={{ width: "100%", display: "grid", gap: "8px" }}>
      <XhProgress
        value={step}
        max={5}
        steps={5}
        valueText={\`第 \${step} 步，共 5 步\`}
        aria-label="注册进度"
      />
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="button" onClick={() => setStep(v => Math.max(0, v - 1))}>上一步</button>
        <button type="button" onClick={() => setStep(v => Math.min(5, v + 1))}>下一步</button>
      </div>
    </div>
  );
}
`;export{e as default};