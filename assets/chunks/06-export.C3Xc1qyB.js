const e=`// 导出裁切结果 | 出图不归组件管：拿 getCropRect() 的矩形喂给 cropToCanvas，画出来的是一张新画布
import type { ImageCropperRect } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { cropToCanvas } from "@xihan-ui/headless";
import {
  XhImageCropperCropArea,
  XhImageCropperCropHandle,
  XhImageCropperImage,
  XhImageCropperRoot,
  XhImageCropperViewport,
} from "@xihan-ui/react";
import { useRef } from "react";

const photo
  = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='320'%3E%3Crect width='480' height='320' fill='%23c7d2fe'/%3E%3Ccircle cx='150' cy='120' r='72' fill='%23f9a8d4'/%3E%3Crect x='250' y='160' width='180' height='120' rx='16' fill='%2334d399'/%3E%3C/svg%3E";

const handles = ["nw", "ne", "se", "sw"] as const;

export default function Demo(): ReactNode {
  const preview = useRef<HTMLDivElement | null>(null);

  function exportCrop(rect: ImageCropperRect): void {
    const image = document.querySelector<HTMLImageElement>(
      "#cropper-export img[data-part=\\"image\\"]",
    );
    if (!image || !preview.current)
      return;
    // 出图只在点确认时做一次：拖动途中每帧都出图会把主线程占满
    const canvas = cropToCanvas(image, rect, { width: 160 });
    if (canvas)
      preview.current.replaceChildren(canvas);
  }

  return (
    <>
      <XhImageCropperRoot
        id="cropper-export"
        src={photo}
        alt="示例图片"
        minWidth={40}
        style={{ inlineSize: "360px" }}
      >
        {({ getCropRect }) => (
          <>
            <XhImageCropperViewport>
              <XhImageCropperImage />
              <XhImageCropperCropArea>
                {handles.map(position => (
                  <XhImageCropperCropHandle key={position} position={position} />
                ))}
              </XhImageCropperCropArea>
            </XhImageCropperViewport>
            <button type="button" onClick={() => exportCrop(getCropRect())}>导出这一块</button>
          </>
        )}
      </XhImageCropperRoot>
      <div ref={preview} style={{ minBlockSize: "40px" }} />
    </>
  );
}
`;export{e as default};
