const e=`// 多行与自动长高 | input 部件写成 textarea 即多行宿主；autoSize 让高度跟内容走，对象形态钉行数上下限（顶到 maxRows 后内部滚动）
import type { ReactNode } from "react";
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [note, setNote] = useState("");

  return (
    <div style={{ display: "grid", gap: "16px", inlineSize: "320px" }}>
      <XhTextFieldRoot
        value={note}
        onValueChange={details => setNote(details.value)}
        autoSize={{ minRows: 2, maxRows: 6 }}
        maxLength={120}
        placeholder="说点什么"
      >
        {({ value, atLimit }) => (
          <>
            <XhTextFieldLabel>备注（2-6 行自动长高）</XhTextFieldLabel>
            <XhTextFieldControl>
              <XhTextFieldInput as="textarea" />
            </XhTextFieldControl>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: atLimit ? "var(--xh-fg-danger)" : "var(--xh-fg-subtle)" }}>
              {\`\${value.length} / 120\`}
            </p>
          </>
        )}
      </XhTextFieldRoot>

      <XhTextFieldRoot autoSize placeholder="不设行数界限，完全跟内容走">
        <XhTextFieldLabel>随写随长</XhTextFieldLabel>
        <XhTextFieldControl>
          <XhTextFieldInput as="textarea" />
        </XhTextFieldControl>
      </XhTextFieldRoot>
    </div>
  );
}
`;export{e as default};
