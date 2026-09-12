const n=`// 语气 | tone 换聚焦描边与发送钮用哪族颜色，输入与提交那条链不受影响
import type { ReactNode } from "react";
import { XhPromptInputInput, XhPromptInputRoot, XhPromptInputSubmitTrigger } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {tones.map(tone => (
        <XhPromptInputRoot
          key={tone}
          tone={tone}
          translations={{ input: "给助手写点什么" }}
        >
          <XhPromptInputInput rows={1} placeholder={\`\${tone} 档\`} />
          <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
        </XhPromptInputRoot>
      ))}
    </div>
  );
}
`;export{n as default};
