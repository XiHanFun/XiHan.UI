// 每一拍与到期 | tick 每过一个 interval 触发一次，complete 只在到达终点时触发一次；到期的一拍不再触发 tick
import type { ReactNode } from "react";
import {
  XhTimerControl,
  XhTimerDisplay,
  XhTimerItem,
  XhTimerRoot,
  XhTimerSeparator,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [ticks, setTicks] = useState(0);
  const [done, setDone] = useState(false);

  // 按钮本身归组件管起停，这里只把计数一起归零
  function restart(): void {
    setTicks(0);
    setDone(false);
  }

  return (
    <>
      <XhTimerRoot
        countdown
        startMs={5000}
        onTick={() => setTicks(n => n + 1)}
        onComplete={() => setDone(true)}
      >
        <XhTimerDisplay>
          <XhTimerItem unit="minutes" />
          <XhTimerSeparator>:</XhTimerSeparator>
          <XhTimerItem unit="seconds" />
        </XhTimerDisplay>
        <XhTimerControl onClick={restart}>起停</XhTimerControl>
      </XhTimerRoot>

      <p>{`已经跳了 ${ticks} 拍${done ? "，到点了" : ""}`}</p>
    </>
  );
}
