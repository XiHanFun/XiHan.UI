// 基础用法 | 想的时候自动展开、想完自动收起；状态文案由组件按在不在想与时长给出
import type { ReactNode } from "react";
import {
  XhReasoningContent,
  XhReasoningIndicator,
  XhReasoningLabel,
  XhReasoningRoot,
  XhReasoningTrigger,
} from "@xihan-ui/react";
import { useEffect, useState } from "react";

const full = "先看约束：只读一次文件，别改它。再看目标：找出导出面。";

// 名字位不写内容时显示这几句，{seconds} 由组件代入
const translations = {
  label: "思考过程",
  thinking: "正在思考…",
  thoughtFor: "想了 {seconds} 秒",
};

export default function Demo(): ReactNode {
  const [streaming, setStreaming] = useState(true);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [endTime, setEndTime] = useState<number | undefined>(undefined);
  const [text, setText] = useState("");

  // 挂载后才开始追加：组件函数体在服务端渲染时也执行，那里没有 window
  useEffect(() => {
    let at = 0;
    let timer = 0;
    setStartTime(Date.now());
    function tick(): void {
      at = Math.min(at + 2, full.length);
      setText(full.slice(0, at));
      if (at < full.length) {
        timer = window.setTimeout(tick, 60);
        return;
      }
      setEndTime(Date.now());
      setStreaming(false);
    }
    tick();
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <XhReasoningRoot
      streaming={streaming}
      startTime={startTime}
      endTime={endTime}
      translations={translations}
    >
      <XhReasoningTrigger>
        <XhReasoningIndicator />
        <XhReasoningLabel />
      </XhReasoningTrigger>
      <XhReasoningContent>{text}</XhReasoningContent>
    </XhReasoningRoot>
  );
}
