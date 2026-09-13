/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 缩放与旋转 | 使用内置滑块调整视图
import type { ReactNode } from "react";
import {
  XhImageCropperCropArea,
  XhImageCropperCropHandle,
  XhImageCropperImage,
  XhImageCropperRoot,
  XhImageCropperRotateSlider,
  XhImageCropperViewport,
  XhImageCropperZoomSlider,
} from "@xihan-ui/react";

const handles = ["nw", "ne", "se", "sw"] as const;

export default function Demo(): ReactNode {
  return (
    <XhImageCropperRoot
      src="/images/image-cropper-landscape.svg"
      alt="山谷与湖泊风景图"
      defaultValue={{ x: 96, y: 64, width: 448, height: 280 }}
      defaultZoom={1.25}
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
      <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", alignItems: "center", gap: "8px 12px", paddingBlockStart: "12px" }}>
        <label htmlFor="cropper-zoom">缩放</label>
        <XhImageCropperZoomSlider id="cropper-zoom" />
        <label htmlFor="cropper-rotation">旋转</label>
        <XhImageCropperRotateSlider id="cropper-rotation" />
      </div>
    </XhImageCropperRoot>
  );
}
