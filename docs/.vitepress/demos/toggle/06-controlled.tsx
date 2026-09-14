// 受控状态 | 由外部状态控制按下值
import type { ReactNode } from "react";
import { HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhToggle } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [pressed, setPressed] = useState(false);

  return (
    <XhToggle
      pressed={pressed}
      onPressedChange={details => setPressed(details.pressed)}
    >
      <XhIcon icon={HeartIcon} />
      {pressed ? "已点赞" : "点赞"}
    </XhToggle>
  );
}
