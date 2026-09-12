const e=`// 受控与拦截 | 传了 value 就由宿主说了算，value-change 只报意图；这里最多留两项
import type { ReactNode } from "react";
import { XhCheckboxGroupRoot } from "@xihan-ui/react";
import { useState } from "react";

const channels = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
  { value: "push", label: "推送" },
  { value: "webhook", label: "回调" },
];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<string[]>(["email"]);
  const [rejected, setRejected] = useState(false);

  // 超过两项就不写回，界面停在原值
  function onValueChange(details: { value: string[] }): void {
    const over = details.value.length > 2;
    setRejected(over);
    if (!over) {
      setPicked(details.value);
    }
  }

  return (
    <>
      <XhCheckboxGroupRoot
        value={picked}
        collection={channels}
        label="通知渠道（最多两项）"
        orientation="horizontal"
        onValueChange={onValueChange}
      />
      <p>{\`已选：\${picked.join("、") || "（无）"}\${rejected ? " · 上一次超额，未写回" : ""}\`}</p>
    </>
  );
}
`;export{e as default};
