const e=`// 起停与归零 | 自己写部件：control 是一个原生按钮，按一下就按当前状态走一步（开始 / 暂停 / 继续 / 重来）
import type { ReactNode } from "react";
import {
  XhTimerControl,
  XhTimerDisplay,
  XhTimerItem,
  XhTimerRoot,
  XhTimerSeparator,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhTimerRoot>
      <XhTimerDisplay>
        <XhTimerItem unit="minutes" />
        <XhTimerSeparator>:</XhTimerSeparator>
        <XhTimerItem unit="seconds" />
      </XhTimerDisplay>
      <XhTimerControl>起停</XhTimerControl>
    </XhTimerRoot>
  );
}
`;export{e as default};
