const n=`// 取出签名 | 签名定稿时 draw-end 带上一份可直接落库的 SVG；提交前用 empty 拦一道，空签名不该走出客户端
import type { ReactNode } from "react";
import {
  XhSignaturePadClearTrigger,
  XhSignaturePadControl,
  XhSignaturePadGuide,
  XhSignaturePadPath,
  XhSignaturePadRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [size, setSize] = useState(0);

  return (
    <XhSignaturePadRoot
      style={{ maxInlineSize: "22rem" }}
      // 签名定稿才发一次：抬笔、清空与表单重置三条路径都会走到这里
      onDrawEnd={details => setSize(details.svg.length)}
    >
      {({ empty }) => (
        <>
          <XhSignaturePadControl>
            <XhSignaturePadGuide />
            <XhSignaturePadPath />
          </XhSignaturePadControl>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <XhSignaturePadClearTrigger>清空</XhSignaturePadClearTrigger>
            {/* 空签名与「签了但很潦草」是两回事，前者应该在客户端就挡住 */}
            <button type="button" disabled={empty}>提交</button>
            <span style={{ fontSize: "12px" }}>{\`SVG \${size} 字节\`}</span>
          </div>
        </>
      )}
    </XhSignaturePadRoot>
  );
}
`;export{n as default};
