var e=`// 三个尺寸档 | size 只写在 root 上，数字大小与起停按钮的高度一起换档，子部件不重复标注
import type { ReactNode } from "react";
import {
  XhTimerControl,
  XhTimerDisplay,
  XhTimerItem,
  XhTimerRoot,
  XhTimerSeparator,
} from "@xihan-ui/react";

const sizes = ["sm", "md", "lg"] as const;
const oneMinute = 60 * 1000;
// 起停钮不写内容，组件照当前动作填 translations 里的那句，字与读屏名同一句
const translations = { start: "开始", pause: "暂停", resume: "继续", reset: "重置" };

export default function Demo(): ReactNode {
  return (
    <>
      {sizes.map(size => (
        <div key={size} style={{ marginBlockEnd: "12px" }}>
          <XhTimerRoot size={size} countdown startMs={oneMinute} translations={translations}>
            <XhTimerDisplay>
              <XhTimerItem unit="minutes" />
              <XhTimerSeparator>:</XhTimerSeparator>
              <XhTimerItem unit="seconds" />
            </XhTimerDisplay>
            <XhTimerControl />
          </XhTimerRoot>
        </div>
      ))}
    </>
  );
}
`;export{e as default};