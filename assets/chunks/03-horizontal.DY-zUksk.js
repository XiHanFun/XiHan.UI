const n=`// 横向排布 | orientation 只出 data-orientation 交给皮肤排版，role=group 不接受 aria-orientation
import type { ReactNode } from "react";
import { XhCheckboxGroupRoot } from "@xihan-ui/react";
import { useState } from "react";

const items = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
  { value: "push", label: "推送" },
];

export default function Demo(): ReactNode {
  const [channels, setChannels] = useState<string[]>(["email"]);

  return (
    <XhCheckboxGroupRoot
      value={channels}
      onValueChange={details => setChannels(details.value)}
      collection={items}
      label="通知渠道"
      orientation="horizontal"
    />
  );
}
`;export{n as default};
