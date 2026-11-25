// 掩码 | mask 把输入排成固定格式：9 收数字、a 收字母，分隔符按到那一位时自动补上；值含分隔符，value-change 另带去掉分隔符的 unmaskedValue
import type { ReactNode } from "react";
import {
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [digits, setDigits] = useState("");
  return (
    <>
      <XhTextFieldRoot
        name="phone"
        mask="999 9999 9999"
        placeholder="138 0000 0000"
        onValueChange={details => setDigits(details.unmaskedValue ?? "")}
      >
        <XhTextFieldLabel>手机号</XhTextFieldLabel>
        <XhTextFieldControl>
          <XhTextFieldInput />
        </XhTextFieldControl>
      </XhTextFieldRoot>
      <span data-demo-output>
        去掉分隔符：
        {digits || "（未输入）"}
      </span>
    </>
  );
}
