const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 拖动裁切区域或调整把手
import type { ReactNode } from "react";
import {
  XhImageCropperCropArea,
  XhImageCropperCropHandle,
  XhImageCropperGrid,
  XhImageCropperImage,
  XhImageCropperRoot,
  XhImageCropperViewport,
} from "@xihan-ui/react";

const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;

export default function Demo(): ReactNode {
  return (
    <XhImageCropperRoot
      src="/images/image-cropper-landscape.svg"
      alt="山谷与湖泊风景图"
      defaultValue={{ x: 96, y: 64, width: 448, height: 280 }}
      minWidth={40}
      minHeight={40}
      style={{ inlineSize: "min(100%, 420px)" }}
    >
      <XhImageCropperViewport>
        <XhImageCropperImage />
        <XhImageCropperCropArea>
          <XhImageCropperGrid />
          {handles.map(position => (
            <XhImageCropperCropHandle key={position} position={position} />
          ))}
        </XhImageCropperCropArea>
      </XhImageCropperViewport>
    </XhImageCropperRoot>
  );
}
`;export{e as default};
