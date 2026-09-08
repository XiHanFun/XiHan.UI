// 禁用 | disabled 同时挡住指针与键盘，按下态保持原样
import type { ReactNode } from "react";
import { XhToggle } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhToggle disabled>未按下</XhToggle>
      <XhToggle disabled defaultPressed>已按下</XhToggle>
    </>
  );
}
