const o=`// 缩放与旋转 | 两者同时作用在图片与裁切框上，看得更清楚；裁切矩形与源图像素的对应关系一点不变
import type { ReactNode } from "react";
import {
  XhImageCropperCropArea,
  XhImageCropperCropHandle,
  XhImageCropperImage,
  XhImageCropperRoot,
  XhImageCropperViewport,
} from "@xihan-ui/react";
import { useState } from "react";

const photo
  = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='320'%3E%3Crect width='480' height='320' fill='%23c7d2fe'/%3E%3Ccircle cx='150' cy='120' r='72' fill='%23f9a8d4'/%3E%3Crect x='250' y='160' width='180' height='120' rx='16' fill='%2334d399'/%3E%3C/svg%3E";

const handles = ["nw", "ne", "se", "sw"] as const;

export default function Demo(): ReactNode {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  return (
    <>
      <XhImageCropperRoot
        zoom={zoom}
        onZoomChange={details => setZoom(details.zoom)}
        src={photo}
        alt="示例图片"
        rotation={rotation}
        minWidth={40}
        style={{ inlineSize: "360px" }}
      >
        <XhImageCropperViewport>
          <XhImageCropperImage />
          <XhImageCropperCropArea>
            {handles.map(position => (
              <XhImageCropperCropHandle key={position} position={position} />
            ))}
          </XhImageCropperCropArea>
        </XhImageCropperViewport>
      </XhImageCropperRoot>
      <button type="button" onClick={() => setZoom(Math.min(zoom * 1.25, 4))}>放大</button>
      <button type="button" onClick={() => setZoom(Math.max(zoom / 1.25, 1))}>缩小</button>
      <button type="button" onClick={() => setRotation((rotation + 90) % 360)}>旋转 90°</button>
      <span>{\`倍率 \${zoom.toFixed(2)} · 角度 \${rotation}°\`}</span>
    </>
  );
}
`;export{o as default};
