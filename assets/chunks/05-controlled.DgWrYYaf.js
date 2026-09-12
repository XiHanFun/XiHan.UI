const e=`// 受控 | 传了 value 就由宿主说了算：组件只发变更意图，写回去之后框才动
import type { ImageCropperRect } from "@xihan-ui/headless";
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
  const [rect, setRect] = useState<ImageCropperRect>({ x: 60, y: 40, width: 240, height: 180 });

  return (
    <>
      <XhImageCropperRoot
        value={rect}
        onValueChange={details => setRect(details.value)}
        src={photo}
        alt="示例图片"
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
      <span>
        {\`裁切矩形：\${rect.x},\${rect.y} · \${rect.width}×\${rect.height}\`}
      </span>
      <button
        type="button"
        onClick={() => setRect({ x: 60, y: 40, width: 240, height: 180 })}
      >
        复位
      </button>
    </>
  );
}
`;export{e as default};
