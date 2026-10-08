var e=`// 翻转 | 两颗开关钮各管一条轴，图片与裁切框一起镜像；aria-pressed 报这条轴翻没翻
import type { ReactNode } from "react";
import {
  XhImageCropperCropArea,
  XhImageCropperCropHandle,
  XhImageCropperFlipTrigger,
  XhImageCropperImage,
  XhImageCropperRoot,
  XhImageCropperViewport,
} from "@xihan-ui/react";

const handles = ["nw", "ne", "se", "sw"] as const;

export default function Demo(): ReactNode {
  return (
    <XhImageCropperRoot
      src="/images/image-cropper-landscape.svg"
      alt="山谷与湖泊风景图"
      defaultValue={{ x: 96, y: 64, width: 448, height: 280 }}
      minWidth={40}
      style={{ inlineSize: "min(100%, 420px)" }}
    >
      <XhImageCropperViewport>
        <XhImageCropperImage />
        <XhImageCropperCropArea>
          {handles.map(position => (
            <XhImageCropperCropHandle key={position} position={position} />
          ))}
        </XhImageCropperCropArea>
      </XhImageCropperViewport>
      <div style={{ display: "flex", gap: "var(--xh-space-2)", paddingBlockStart: "var(--xh-space-3)" }}>
        <XhImageCropperFlipTrigger axis="horizontal">左右翻转</XhImageCropperFlipTrigger>
        <XhImageCropperFlipTrigger axis="vertical">上下翻转</XhImageCropperFlipTrigger>
      </div>
    </XhImageCropperRoot>
  );
}
`;export{e as default};