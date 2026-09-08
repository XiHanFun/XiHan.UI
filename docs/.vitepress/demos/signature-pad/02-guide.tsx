// 标题、基准线与清空 | 基准线是纯画面（带 aria-hidden），清空按钮是原生 button，读屏念的是 translations 里那句
import type { ReactNode } from "react";
import {
  XhSignaturePadClearTrigger,
  XhSignaturePadControl,
  XhSignaturePadGuide,
  XhSignaturePadLabel,
  XhSignaturePadPath,
  XhSignaturePadRoot,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhSignaturePadRoot
      translations={{ label: "手写签名", clearTrigger: "清空签名" }}
      style={{ maxInlineSize: "22rem" }}
    >
      <XhSignaturePadLabel>请在下方签名</XhSignaturePadLabel>
      <XhSignaturePadControl>
        <XhSignaturePadGuide />
        <XhSignaturePadPath />
      </XhSignaturePadControl>
      <XhSignaturePadClearTrigger>清空</XhSignaturePadClearTrigger>
    </XhSignaturePadRoot>
  );
}
