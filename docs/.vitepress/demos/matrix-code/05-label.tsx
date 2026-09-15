// 可及名字 | 默认使用 value 作为 aria-label；内容不适合朗读时用 label 替换为可读文案
import type { ReactNode } from "react";
import { XhMatrixCode } from "@xihan-ui/react";
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
      <XhMatrixCode value={text} pixelSize={140} label="曦寒 UI 文档站二维码" />
    </div>
  );
}
