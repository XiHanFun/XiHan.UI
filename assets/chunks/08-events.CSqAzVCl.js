const e=`// 变化回调 | pressed-change 每次带着 details 报一次按下意图；不做受控绑定时它就是拿到新值的唯一出口
import type { ReactNode } from "react";
import { XhToggle } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [trail, setTrail] = useState<string[]>([]);

  function onPressedChange(details: { pressed: boolean }): void {
    // 只留最近三次
    setTrail(prev => [details.pressed ? "开" : "关", ...prev].slice(0, 3));
  }

  return (
    <>
      <XhToggle variant="outline" onPressedChange={onPressedChange}>静音</XhToggle>
      <span style={{ fontSize: "13px" }}>
        {\`最近三次：\${trail.join(" · ") || "（还没动过）"}\`}
      </span>
    </>
  );
}
`;export{e as default};
