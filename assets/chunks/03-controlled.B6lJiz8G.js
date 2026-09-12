const t=`// 受控 | value 与 edit 都能受控，传了就由宿主说了算，用户交互只发出意图；外部按钮同样进得了编辑态
import type { ReactNode } from "react";
import {
  XhEditableControl,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [signature, setSignature] = useState("这个人很懒");
  const [editing, setEditing] = useState(false);

  return (
    <>
      <XhEditableRoot
        value={signature}
        onValueChange={details => setSignature(details.value)}
        edit={editing}
        onEditChange={details => setEditing(details.edit)}
        placeholder="未填写"
      >
        <XhEditableLabel>签名</XhEditableLabel>
        <XhEditableControl>
          <XhEditablePreview />
          <XhEditableInput />
        </XhEditableControl>
      </XhEditableRoot>
      <span>{\`当前：\${signature || "（空）"} · \${editing ? "编辑中" : "预览中"}\`}</span>
      <button type="button" onClick={() => setEditing(true)}>从外部进编辑态</button>
    </>
  );
}
`;export{t as default};
