const n=`// 自动跟到底部 | 新行进来时视口自己跟着走；往上滚一段就停住跟随，组件报出的 atBottom 与 scrollToBottom 够自己画一条回到最新
import type { ReactNode } from "react";
import { XhButton, XhLogContent, XhLogLine, XhLogRoot, XhLogViewport } from "@xihan-ui/react";
import { useEffect, useRef, useState } from "react";

export default function Demo(): ReactNode {
  const [lines, setLines] = useState(
    Array.from({ length: 10 }, (_, i) => \`12:00:0\${i}  boot  第 \${i + 1} 行 · 往上滚一段试试\`),
  );
  const seq = useRef(lines.length);
  const [streaming, setStreaming] = useState(false);

  function append(): void {
    seq.current += 1;
    const at = seq.current;
    setLines(prev => [...prev, \`12:0\${Math.floor(at / 60)}:\${String(at % 60).padStart(2, "0")}  http  第 \${at} 行 · 新来的\`]);
  }

  // 开着输出时每 400ms 追加一行，关掉或离开页面时把定时器收掉
  useEffect(() => {
    if (!streaming) {
      return;
    }
    const timer = window.setInterval(append, 400);
    return () => window.clearInterval(timer);
  }, [streaming]);

  return (
    <div style={{ width: "100%", display: "grid", gap: "12px" }}>
      <XhLogRoot rows={8}>
        {({ atBottom, sticking, scrollToBottom }) => (
          <>
            <XhLogViewport>
              <XhLogContent>
                {lines.map((line, i) => <XhLogLine key={i}>{line}</XhLogLine>)}
              </XhLogContent>
            </XhLogViewport>

            {/* 不在底部时才露出来，排在视口下面 */}
            {atBottom
              ? null
              : (
                  <div
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", padding: "6px 12px" }}
                  >
                    <span style={{ fontSize: "13px" }}>{\`已暂停跟随 · 跟随意图：\${sticking ? "开" : "关"}\`}</span>
                    <XhButton variant="outline" size="sm" onClick={() => scrollToBottom()}>回到最新</XhButton>
                  </div>
                )}
          </>
        )}
      </XhLogRoot>

      <div style={{ display: "flex", gap: "8px" }}>
        <XhButton variant="solid" onClick={() => setStreaming(!streaming)}>{streaming ? "停止输出" : "开始输出"}</XhButton>
        <XhButton variant="outline" onClick={append}>追加一行</XhButton>
      </div>
    </div>
  );
}
`;export{n as default};
