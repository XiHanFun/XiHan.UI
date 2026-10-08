var e=`// 导出裁切结果 | toCanvas 按所见出图：裁切矩形、旋转、翻转与圆形外形一并生效
import type { ReactNode } from "react";
import {
  XhButton,
  XhImageCropperCropArea,
  XhImageCropperCropHandle,
  XhImageCropperImage,
  XhImageCropperRoot,
  XhImageCropperRotateSlider,
  XhImageCropperViewport,
} from "@xihan-ui/react";
import { useState } from "react";

const handles = ["nw", "ne", "se", "sw"] as const;

export default function Demo(): ReactNode {
  const [avatar, setAvatar] = useState("");

  return (
    <XhImageCropperRoot
      src="/images/image-cropper-landscape.svg"
      alt="山谷与湖泊风景图"
      shape="round"
      aspectRatio={1}
      defaultValue={{ x: 160, y: 50, width: 320, height: 320 }}
      defaultRotation={90}
      minWidth={48}
      style={{ inlineSize: "min(100%, 420px)" }}
    >
      {({ toCanvas }) => (
        <>
          <XhImageCropperViewport>
            <XhImageCropperImage />
            <XhImageCropperCropArea>
              {handles.map(position => (
                <XhImageCropperCropHandle key={position} position={position} />
              ))}
            </XhImageCropperCropArea>
          </XhImageCropperViewport>
          <XhImageCropperRotateSlider aria-label="旋转" />
          <div style={{ display: "flex", gap: "var(--xh-space-3)", alignItems: "center", paddingBlockStart: "var(--xh-space-3)" }}>
            {/* 在确认时出图一次，不要在每次拖动时出图 */}
            <XhButton onClick={() => setAvatar(toCanvas({ width: 96 })?.toDataURL("image/png") ?? "")}>导出头像</XhButton>
            {avatar && <img src={avatar} alt="导出的头像" width={48} height={48} />}
          </div>
        </>
      )}
    </XhImageCropperRoot>
  );
}
`;export{e as default};