// 点击查看大图 | 写上 preview，图片就是一颗打开大图预览的按钮：点击或聚焦后按 Enter / Space 打开，预览层里可以缩放、旋转与翻转，关上后焦点回到图片
import type { CSSProperties, ReactNode } from "react";
import { XhImageFallback, XhImageImage, XhImageRoot } from "@xihan-ui/react";

const boxStyle = {
  "--xh-image-w": "200px",
  "--xh-image-ratio": "3 / 2",
} as CSSProperties;

export default function Demo(): ReactNode {
  return (
    <XhImageRoot
      src="/images/image-cropper-landscape.svg"
      alt="清晨的山谷与湖泊"
      preview
      style={boxStyle}
    >
      <XhImageImage />
      <XhImageFallback>加载中</XhImageFallback>
    </XhImageRoot>
  );
}
