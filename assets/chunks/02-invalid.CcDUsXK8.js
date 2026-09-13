const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 必填与校验 | 显示字段错误
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
