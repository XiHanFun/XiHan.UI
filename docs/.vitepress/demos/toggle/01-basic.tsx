// 基础用法 | 按下态由 pressed 表达，非受控时组件自己维护
import type { ReactNode } from "react";
import { XhToggle } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [bold, setBold] = useState(false);

  return (
    <>
      <XhToggle>加粗</XhToggle>
      <XhToggle pressed={bold} onPressedChange={details => setBold(details.pressed)}>
        {`受控：${bold ? "已按下" : "未按下"}`}
      </XhToggle>
    </>
  );
}
