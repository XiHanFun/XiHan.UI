var e=`// 多行与自动增高 | input 部件写为 textarea 即多行宿主；autoSize 使高度跟随内容，对象形态固定行数上下限（达到 maxRows 后内部滚动）
import type { ReactNode } from "react";
import {
  XhTextFieldControl,
  XhTextFieldCount,
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
        showCount
        placeholder="说点什么"
      >
        <XhTextFieldLabel>备注（2-6 行自动长高）</XhTextFieldLabel>
        <XhTextFieldControl>
          <XhTextFieldInput as="textarea" />
        </XhTextFieldControl>
        <XhTextFieldCount />
      </XhTextFieldRoot>

      <XhTextFieldRoot autoSize placeholder="不设行数界限：随内容长高，到上限后框内滚动">
        <XhTextFieldLabel>随写随长</XhTextFieldLabel>
        <XhTextFieldControl>
          <XhTextFieldInput as="textarea" />
        </XhTextFieldControl>
      </XhTextFieldRoot>
    </div>
  );
}
`;export{e as default};