const e=`// 事件 | checked-change 带一份 { checked }，非受控时内部转移也照发一次
import type { ReactNode } from "react";
import { XhSwitch } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [times, setTimes] = useState(0);
  const [last, setLast] = useState("（还没动过）");

  function onCheckedChange(details: { checked: boolean }): void {
    setTimes(n => n + 1);
    setLast(details.checked ? "开" : "关");
  }

  return (
    <>
      <XhSwitch onCheckedChange={onCheckedChange} />
      <span>{\`翻转 \${times} 次 · 最近落到 \${last}\`}</span>
    </>
  );
}
`;export{e as default};
