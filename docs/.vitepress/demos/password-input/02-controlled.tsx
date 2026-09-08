// 受控 | 值与明暗都能受控：传了就由宿主说了算，组件只把意图报出来，写不写回由宿主定
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
  const [visible, setVisible] = useState(false);

  return (
    <>
      <XhPasswordInputRoot
        value={password}
        onValueChange={details => setPassword(details.value)}
        visible={visible}
        onVisibilityChange={details => setVisible(details.visible)}
      >
        <XhPasswordInputLabel>密码</XhPasswordInputLabel>
        <XhPasswordInputControl>
          <XhPasswordInputInput style={{ inlineSize: "200px" }} />
          {/* 图标随宿主那份状态换，切换钮自己的名字由组件管 */}
          <XhPasswordInputVisibilityTrigger>{visible ? "◉" : "○"}</XhPasswordInputVisibilityTrigger>
        </XhPasswordInputControl>
      </XhPasswordInputRoot>
      <span>{`当前：${visible ? password : "•".repeat(password.length)}`}</span>
      <button type="button" onClick={() => setVisible(false)}>收起明文</button>
    </>
  );
}
