const o=`// 自动开合与锁存 | 跑起来自动展开、结束自动收起；你手动开合过一次之后，阶段怎么变都不再自动
import type { ToolCallPhase } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhCodeViewCode,
  XhCodeViewPre,
  XhCodeViewRoot,
  XhToolCallContent,
  XhToolCallIndicator,
  XhToolCallInput,
  XhToolCallLabel,
  XhToolCallRoot,
  XhToolCallStatus,
  XhToolCallTrigger,
} from "@xihan-ui/react";
import { useEffect, useState } from "react";

export default function Demo(): ReactNode {
  const [phase, setPhase] = useState<ToolCallPhase>("input-streaming");
  const [lastSource, setLastSource] = useState("");

  // 三秒一轮：在跑 → 完成 → 在跑。效应只在客户端跑，服务端渲染时没有 window
  useEffect(() => {
    const timer = window.setInterval(() => {
      setPhase(current => (current === "input-streaming" ? "output-available" : "input-streaming"));
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <XhToolCallRoot phase={phase} onOpenChange={details => setLastSource(details.source)}>
        <XhToolCallTrigger>
          <XhToolCallIndicator />
          <XhToolCallLabel>read_file</XhToolCallLabel>
          <XhToolCallStatus />
        </XhToolCallTrigger>
        <XhToolCallContent>
          <XhToolCallInput>
            {/* 参数在流式期是半截 JSON，complete 接成「阶段不是参数在传」 */}
            <XhCodeViewRoot
              code="{ &quot;path&quot;: &quot;src/index.ts&quot; }"
              lang="json"
              complete={phase !== "input-streaming"}
            >
              <XhCodeViewPre>
                <XhCodeViewCode />
              </XhCodeViewPre>
            </XhCodeViewRoot>
          </XhToolCallInput>
        </XhToolCallContent>
      </XhToolCallRoot>
      <p style={{ margin: 0 }}>{\`上一次开合来自：\${lastSource || "还没动过"}\`}</p>
    </div>
  );
}
`;export{o as default};
