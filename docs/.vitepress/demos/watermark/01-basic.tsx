// 基础用法 | 印子是一张按文字算出来的 SVG，铺在根的伪元素上；底下的内容照常点、照常选
import type { ReactNode } from "react";
import { XhWatermarkContent, XhWatermarkRoot } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhWatermarkRoot text="曦寒 · 内部资料">
      <XhWatermarkContent>
        <div style={{ padding: "24px", lineHeight: 1.9 }}>
          <p>本页列出的账期数据仅供内部核对。</p>
          <p>试着选中这段文字，或点下面的按钮——水印不吃点击，也选不中。</p>
          <p><button type="button">点我</button></p>
        </div>
      </XhWatermarkContent>
    </XhWatermarkRoot>
  );
}
