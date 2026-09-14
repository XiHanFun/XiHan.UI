// 参与表单 | 给了 name 就带上表单影子，提交的是一份独立 SVG；表单重置会把画布清回空
import type { ReactNode } from "react";
import {
  XhSignaturePadClearTrigger,
  XhSignaturePadControl,
  XhSignaturePadGuide,
  XhSignaturePadHiddenInput,
  XhSignaturePadLabel,
  XhSignaturePadPath,
  XhSignaturePadRoot,
  XhSignaturePadStatus,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <form
      style={{ display: "flex", flexDirection: "column", gap: "12px", maxInlineSize: "22rem" }}
      onSubmit={event => event.preventDefault()}
    >
      <XhSignaturePadRoot
        name="signature"
        required
        translations={{ statusEmpty: "尚未签名", statusSigned: "已签名" }}
      >
        <XhSignaturePadLabel>验收签名（必填）</XhSignaturePadLabel>
        <XhSignaturePadControl>
          <XhSignaturePadGuide />
          <XhSignaturePadPath />
        </XhSignaturePadControl>
        <XhSignaturePadClearTrigger>清空</XhSignaturePadClearTrigger>
        {/* 画布是一张图，签没签只能从这块活区域听出来；签上与清空都会播报一次 */}
        <XhSignaturePadStatus />
        {/* 表单影子视觉隐藏，但 required 会拦住空签名的提交 */}
        <XhSignaturePadHiddenInput />
      </XhSignaturePadRoot>
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="submit">提交</button>
        <button type="reset">重置</button>
      </div>
    </form>
  );
}
