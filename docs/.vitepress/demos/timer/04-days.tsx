// 带天数的长计时 | 时满 24 会进位到天，超过一天的计时要自己写一段 days，只写时分秒会把整天数丢掉
import type { ReactNode } from "react";
import {
  XhTimerDisplay,
  XhTimerItem,
  XhTimerRoot,
  XhTimerSeparator,
} from "@xihan-ui/react";

const threeDays = 3 * 24 * 60 * 60 * 1000;

export default function Demo(): ReactNode {
  return (
    <XhTimerRoot countdown startMs={threeDays} autoStart>
      <XhTimerDisplay>
        <XhTimerItem unit="days" />
        <XhTimerSeparator>天</XhTimerSeparator>
        <XhTimerItem unit="hours" />
        <XhTimerSeparator>:</XhTimerSeparator>
        <XhTimerItem unit="minutes" />
        <XhTimerSeparator>:</XhTimerSeparator>
        <XhTimerItem unit="seconds" />
      </XhTimerDisplay>
    </XhTimerRoot>
  );
}
