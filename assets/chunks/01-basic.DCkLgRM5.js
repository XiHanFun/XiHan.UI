var e=`// 基础用法 | Enter 提交、Shift+Enter 换行；输入法组合中的 Enter 一律放行，该按键是在确认候选词
import type { ReactNode } from "react";
import { XhPromptInputInput, XhPromptInputRoot, XhPromptInputSubmitTrigger } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [sent, setSent] = useState<string[]>([]);

  return (
    <>
      <XhPromptInputRoot
        translations={{ input: "给助手写点什么" }}
        onSubmit={details => setSent(prev => [...prev, details.value])}
      >
        <XhPromptInputInput rows={1} placeholder="给助手写点什么…" />
        <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
      </XhPromptInputRoot>
      <p data-demo-output>{\`已发出：\${sent.join(" / ") || "（无）"}\`}</p>
    </>
  );
}
`;export{e as default};