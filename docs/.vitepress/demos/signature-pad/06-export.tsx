// 取出签名 | 签名定稿时 draw-end 带上一份可直接入库的 SVG；提交前用 empty 拦截一次，空签名不应离开客户端
import type { ReactNode } from "react";
import {
  XhButton,
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
    <>
      <XhSignaturePadRoot
        // 钮上的字要包含在读屏名里：名字取 translations，给一句以可见字开头的中文
        translations={{ clearTrigger: "清空签名" }}
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
              <XhButton variant="solid" size="sm" disabled={empty}>提交</XhButton>
            </div>
          </>
        )}
      </XhSignaturePadRoot>
      <span data-demo-output>{`SVG ${size} 字节`}</span>
    </>
  );
}
