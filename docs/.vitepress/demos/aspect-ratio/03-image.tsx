// 放图片 | 直接放进去的图片铺满盒子并按 cover 裁切：同一张图放进不同比例，都不变形、不留边
import type { CSSProperties, ReactNode } from "react";
import { XhAspectRatio } from "@xihan-ui/react";

const columns: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(var(--xh-layout-col-min-sm), 1fr))",
  gap: "var(--xh-space-3)",
  inlineSize: "100%",
};

export default function Demo(): ReactNode {
  return (
    <div style={columns}>
      <XhAspectRatio>
        <img src="/images/image-cropper-landscape.svg" alt="清晨的山谷与湖泊" />
      </XhAspectRatio>
      <XhAspectRatio ratio={16 / 9}>
        <img src="/images/image-cropper-landscape.svg" alt="清晨的山谷与湖泊" />
      </XhAspectRatio>
    </div>
  );
}
