// 跟着数据走 | 改 to 就从当前数字接着走向新终点，跑完停下之后再改也照样重新跑；active 翻假即停在当前值
import type { ReactNode } from "react";
import { XhButton, XhNumberAnimation } from "@xihan-ui/react";
import { useState } from "react";

const readings = [3600, 8250, 4180, 12040];

export default function Demo(): ReactNode {
  const [at, setAt] = useState(0);
  const [running, setRunning] = useState(true);
  const [settled, setSettled] = useState<number | null>(null);

  return (
    <>
      <XhNumberAnimation
        to={readings[at]}
        duration={1200}
        active={running}
        easing="easeOut"
        separator=","
        size="lg"
        onComplete={details => setSettled(details.value)}
      />

      <XhButton variant="solid" onClick={() => setAt((at + 1) % readings.length)}>换一组读数</XhButton>
      <XhButton variant="outline" onClick={() => setRunning(!running)}>
        {running ? "暂停" : "继续"}
      </XhButton>
      {settled !== null ? <span>{`上一次停在：${settled}`}</span> : null}
    </>
  );
}
