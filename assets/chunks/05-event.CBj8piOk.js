const e=`// 事件 | checked-change 带一份 { checked }，非受控时内部翻转也照发一次
import type { ReactNode } from "react";
import { XhCheckbox } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [log, setLog] = useState<string[]>([]);

  // 只留最近五条
  function onCheckedChange(details: { checked: boolean }): void {
    setLog(prev => [details.checked ? "勾上" : "取消", ...prev].slice(0, 5));
  }

  return (
    <>
      <XhCheckbox onCheckedChange={onCheckedChange} />
      <span>
        最近：
        {log.join(" ← ") || "（还没动过）"}
      </span>
    </>
  );
}
`;export{e as default};
