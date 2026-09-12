const e=`// 可及名字 | 缺省拿 value 当 aria-label；内容不是给人念的时候用 label 换一句人话
import type { ReactNode } from "react";
import { XhQrCode } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [text, setText] = useState("https://ui.xihanfun.com");

  return (
    <div style={{ display: "grid", gap: "12px", justifyItems: "start" }}>
      <input
        value={text}
        onChange={event => setText(event.target.value)}
        type="text"
        aria-label="要编码的内容"
        style={{ inlineSize: "320px", maxInlineSize: "100%" }}
      />
      {/* 内容清空时不画码，读屏也读不到这块 */}
      <XhQrCode value={text} pixelSize={140} label="曦寒 UI 文档站二维码" />
    </div>
  );
}
`;export{e as default};
