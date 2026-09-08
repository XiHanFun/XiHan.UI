// 提交时机 | 输入途中只动草稿，失焦或回车才把值交给业务模型；不合法就退回上一次提交的值
import type { ReactNode } from "react";
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  // 草稿绑在组件上，模型只在提交那一刻更新
  const [draft, setDraft] = useState("3");
  const [model, setModel] = useState(3);

  function commit(): void {
    const n = Number(draft);
    if (draft === "" || !Number.isFinite(n)) {
      setDraft(String(model));
      return;
    }
    setModel(n);
    setDraft(String(n));
  }

  return (
    <XhNumberFieldRoot
      value={draft}
      min={1}
      max={99}
      onValueChange={details => setDraft(details.value)}
    >
      <XhNumberFieldLabel>数量</XhNumberFieldLabel>
      <XhNumberFieldControl>
        <XhNumberFieldInput
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter")
              commit();
          }}
        />
        <XhNumberFieldDecrementTrigger />
        <XhNumberFieldIncrementTrigger />
      </XhNumberFieldControl>
      <span>{`草稿：${draft || "（空）"} · 已提交：${model}`}</span>
    </XhNumberFieldRoot>
  );
}
