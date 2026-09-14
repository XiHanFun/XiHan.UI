// 受控通道 | 给了 value 与 active 就走受控分支：value 改写即重新计时，active 翻假停在当前剩余量、翻真接着走
import type { ReactNode } from "react";
import { XhButton, XhTimerDisplay, XhTimerRoot } from "@xihan-ui/react";
import { useState } from "react";

// 两个时长交替：value 变了组件才重新计时，同一个值再写一遍不算换了一轮
const rounds = [5000, 8000];

export default function Demo(): ReactNode {
  const [at, setAt] = useState(0);
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);

  function restart(): void {
    setAt((at + 1) % rounds.length);
    setDone(false);
    setRunning(true);
  }

  return (
    <>
      <XhTimerRoot
        value={rounds[at]}
        active={running}
        precision={1}
        format="s.S"
        onComplete={() => setDone(true)}
      >
        {({ text }) => <XhTimerDisplay>{text}</XhTimerDisplay>}
      </XhTimerRoot>
      <span> 秒</span>

      <XhButton variant="outline" onClick={() => setRunning(!running)}>
        {running ? "暂停" : "继续"}
      </XhButton>
      <XhButton variant="solid" onClick={restart}>重新计时（5 秒 / 8 秒 交替）</XhButton>
      {done ? <span>到点了</span> : null}
    </>
  );
}
