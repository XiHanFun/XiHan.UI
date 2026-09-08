// 业务取值 | checked 只认布尔，在中间换一道，进出两头拿到的都是业务值
import type { ReactNode } from "react";
import { XhCheckbox } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  // 后端收的是两个状态码，界面上只有勾与不勾
  const [status, setStatus] = useState<"enabled" | "disabled">("enabled");
  const enabled = status === "enabled";

  // 也可以不落中间变量，直接在事件里写回业务值
  const [plan, setPlan] = useState<"pro" | "free">("free");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <XhCheckbox
          checked={enabled}
          onCheckedChange={details => setStatus(details.checked ? "enabled" : "disabled")}
        />
        <span>{`启用（${status}）`}</span>
      </span>

      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <XhCheckbox
          checked={plan === "pro"}
          onCheckedChange={details => setPlan(details.checked ? "pro" : "free")}
        />
        <span>{`专业版（${plan}）`}</span>
      </span>
    </div>
  );
}
