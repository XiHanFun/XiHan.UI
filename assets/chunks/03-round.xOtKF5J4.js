const e=`// 圆形裁切 | shape 只改遮罩与描边的样子，裁切矩形还是那个矩形；配 1:1 比例即头像裁切
import type { ReactNode } from "react";
import {
  XhImageCropperCropArea,
  XhImageCropperCropHandle,
  XhImageCropperImage,
  XhImageCropperRoot,
  XhImageCropperViewport,
} from "@xihan-ui/react";

const photo
  = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='320'%3E%3Crect width='480' height='320' fill='%23c7d2fe'/%3E%3Ccircle cx='150' cy='120' r='72' fill='%23f9a8d4'/%3E%3Crect x='250' y='160' width='180' height='120' rx='16' fill='%2334d399'/%3E%3C/svg%3E";

const handles = ["nw", "ne", "se", "sw"] as const;

export default function Demo(): ReactNode {
  return (
    <XhImageCropperRoot
      src={photo}
      alt="示例图片"
      shape="round"
      aspectRatio={1}
      minWidth={48}
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
  );
}
`;export{e as default};
