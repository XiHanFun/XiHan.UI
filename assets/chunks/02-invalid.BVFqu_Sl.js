const e=`// 无效与必填 | invalid 一翻，错误文案接入描述链并显出，控件上同时落 aria-invalid；required 只落 aria-required，校验仍归宿主
import type { ReactNode } from "react";
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [email, setEmail] = useState("zhaifanhua");
  // 无效与否由宿主判定，Field 只负责把这个结论铺成属性
  const invalid = email !== "" && !email.includes("@");

  return (
    <XhFieldRoot invalid={invalid} required style={{ inlineSize: "280px" }}>
      <XhFieldLabel>邮箱</XhFieldLabel>
      <XhFieldControl>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={event => setEmail(event.target.value)}
        />
      </XhFieldControl>
      <XhFieldDescription>用于接收账单与安全提醒</XhFieldDescription>
      {/* 错误文案带 role=alert，翻转的那一刻读屏立即播报 */}
      <XhFieldErrorText>邮箱格式不正确</XhFieldErrorText>
    </XhFieldRoot>
  );
}
`;export{e as default};
