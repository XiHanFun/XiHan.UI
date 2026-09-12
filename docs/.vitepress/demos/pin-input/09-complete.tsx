// 填满才可提交 | 每格都有字才算填满，作者据此点亮提交按钮；重填一次清空整组
import type { ReactNode } from "react";
import { XhPinInputInput, XhPinInputLabel, XhPinInputRoot } from "@xihan-ui/react";
import { useState } from "react";

const cells = Array.from({ length: 4 }, (_, i) => i);

export default function Demo(): ReactNode {
  const [submitted, setSubmitted] = useState("");

  function reset(clear: () => void): void {
    clear();
    setSubmitted("");
  }

  return (
    <XhPinInputRoot length={4} placeholder="·">
      {({ complete, valueAsString, clear }) => (
        <>
          <XhPinInputLabel>兑换码</XhPinInputLabel>
          <div style={{ display: "flex" }}>
            {cells.map(i => <XhPinInputInput key={i} index={i} />)}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" disabled={!complete} onClick={() => setSubmitted(valueAsString)}>
              提交
            </button>
            <button type="button" onClick={() => reset(clear)}>重填</button>
          </div>
          <span>{submitted ? `已提交：${submitted}` : "四格都填满才能提交"}</span>
        </>
      )}
    </XhPinInputRoot>
  );
}
