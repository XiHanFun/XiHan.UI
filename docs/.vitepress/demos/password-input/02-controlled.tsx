// 受控 | 值与明暗都可受控：传入后由宿主决定，组件只报告意图，是否写回由宿主决定
import type { ReactNode } from "react";
import {
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [password, setPassword] = useState("hunter2");
  const [revealed, setRevealed] = useState(false);

  return (
    <>
      <XhPasswordInputRoot
        value={password}
        onValueChange={details => setPassword(details.value)}
        revealed={revealed}
        onRevealedChange={details => setRevealed(details.revealed)}
      >
        <XhPasswordInputLabel>密码</XhPasswordInputLabel>
        <XhPasswordInputControl>
          <XhPasswordInputInput style={{ inlineSize: "200px" }} />
          <XhPasswordInputVisibilityTrigger />
        </XhPasswordInputControl>
      </XhPasswordInputRoot>
      <span>{`当前：${revealed ? password : "•".repeat(password.length)}`}</span>
      <button type="button" onClick={() => setRevealed(false)}>收起明文</button>
    </>
  );
}
