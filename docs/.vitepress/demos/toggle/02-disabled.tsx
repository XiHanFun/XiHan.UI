// 禁用 | 保留禁用前的状态
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
