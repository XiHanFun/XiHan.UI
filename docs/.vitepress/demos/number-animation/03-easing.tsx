// 缓动与时长 | duration 定跑多久，easing 定快慢怎么分配；同一段距离四档并排跑，差别一眼可见
import type { ReactNode } from "react";
import { XhButton, XhNumberAnimation } from "@xihan-ui/react";
import { useState } from "react";

const easings = ["linear", "easeIn", "easeOut", "easeInOut"] as const;

export default function Demo(): ReactNode {
  // 终点在两个数之间来回换，每换一次四档都从当前数字重新走一遍
  const [to, setTo] = useState(10000);

  return (
    <>
      {easings.map(easing => (
        <p key={easing}>
          {`${easing}：`}
          <XhNumberAnimation to={to} duration={2000} easing={easing} separator="," />
        </p>
      ))}
      <XhButton variant="outline" onClick={() => setTo(to === 10000 ? 0 : 10000)}>
        换个终点再跑一遍
      </XhButton>
    </>
  );
}
