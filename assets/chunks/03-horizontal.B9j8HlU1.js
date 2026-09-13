const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 横向排布 | 使用 orientation 设置排列方向
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
