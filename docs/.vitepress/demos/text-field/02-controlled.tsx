// 受控 | 传入 value 后由宿主决定，组件自身不再修改状态；变化经 value-change 报告，是否写回由宿主决定
import type { ReactNode } from "react";
import { XhTextFieldControl, XhTextFieldInput, XhTextFieldLabel, XhTextFieldRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [nickname, setNickname] = useState("曦寒");

  return (
    <>
      <XhTextFieldRoot
        value={nickname}
        onValueChange={details => setNickname(details.value)}
        placeholder="请输入昵称"
      >
        <XhTextFieldLabel>昵称</XhTextFieldLabel>
        <XhTextFieldControl style={{ inlineSize: "200px" }}>
          <XhTextFieldInput />
        </XhTextFieldControl>
      </XhTextFieldRoot>
      <span>{`当前：${nickname || "（空）"}`}</span>
      <button type="button" onClick={() => setNickname("曦寒")}>重置</button>
    </>
  );
}
