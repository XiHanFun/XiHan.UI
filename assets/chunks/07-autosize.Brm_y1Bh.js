const t=`// 随内容长高 | 输入框的高度跟着内容走，rows 定的是起始行数；不手动拖拽，也不写死高度
import type { ReactNode } from "react";
import { XhPromptInputInput, XhPromptInputRoot, XhPromptInputSubmitTrigger } from "@xihan-ui/react";

const draft = "第一行\\n第二行\\n第三行\\n再多敲几行，框会继续往下长";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "12px" }}>
      {/* 起始一行：敲到第二行时框自己变高 */}
      <XhPromptInputRoot translations={{ input: "给助手写点什么" }}>
        <XhPromptInputInput rows={1} placeholder="按 Shift+Enter 换行试试" />
        <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
      </XhPromptInputRoot>

      {/* 初值就是好几行，挂载时框已经是撑开的 */}
      <XhPromptInputRoot defaultValue={draft} translations={{ input: "已经有草稿的输入框" }}>
        <XhPromptInputInput rows={1} />
        <XhPromptInputSubmitTrigger>发送</XhPromptInputSubmitTrigger>
      </XhPromptInputRoot>
    </div>
  );
}
`;export{t as default};
