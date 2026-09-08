// 一次性验证码 | otp 补上 autocomplete=one-time-code，隐藏输入把拼好的整串交给表单，填满那一刻发 value-complete
import type { ReactNode } from "react";
import {
  XhPinInputHiddenInput,
  XhPinInputInput,
  XhPinInputLabel,
  XhPinInputRoot,
} from "@xihan-ui/react";
import { useState } from "react";

const cells = Array.from({ length: 6 }, (_, i) => i);

export default function Demo(): ReactNode {
  const [code, setCode] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState("");

  return (
    <>
      <XhPinInputRoot
        value={code}
        onValueChange={details => setCode(details.value)}
        length={6}
        name="code"
        placeholder="·"
        otp
        onValueComplete={details => setSubmitted(details.valueAsString)}
      >
        <XhPinInputLabel>短信验证码</XhPinInputLabel>
        <div style={{ display: "flex" }}>
          {cells.map(i => <XhPinInputInput key={i} index={i} />)}
        </div>
        <XhPinInputHiddenInput />
      </XhPinInputRoot>
      <span>{`填满时拿到：${submitted || "（未填满）"}`}</span>
    </>
  );
}
