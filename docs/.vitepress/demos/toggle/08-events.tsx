// 受控状态 | 由外部状态控制按下值
import type { ReactNode } from "react";
import { XhToggle } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [pressed, setPressed] = useState(true);

  return (
    <XhToggle
      pressed={pressed}
      onPressedChange={details => setPressed(details.pressed)}
    >
      自动保存
    </XhToggle>
  );
}
