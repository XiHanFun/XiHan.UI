// 懒加载 | 写上 lazy，图片进入视口附近才开始取，交给浏览器原生的 loading="lazy"；取到之前照常显示占位与回退内容
import type { CSSProperties, ReactNode } from "react";
import { XhImageFallback, XhImageImage, XhImageRoot } from "@xihan-ui/react";

const shots = [
  { src: "/images/image-cropper-landscape.svg", alt: "清晨的山谷与湖泊" },
  { src: "/images/demo-avatar.svg", alt: "抽象头像" },
  { src: "/images/image-cropper-landscape.svg", alt: "湖面与远山" },
];

const boxStyle = {
  "--xh-image-ratio": "3 / 2",
  "flex": "none",
} as CSSProperties;

export default function Demo(): ReactNode {
  return (
    <div
      data-xh-scroll=""
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        inlineSize: "260px",
        blockSize: "200px",
        overflowY: "auto",
        padding: "12px",
        border: "var(--xh-stroke-thin) solid var(--xh-border-default)",
        borderRadius: "var(--xh-shape-surface)",
      }}
    >
      {shots.map(shot => (
        <XhImageRoot key={shot.alt} src={shot.src} alt={shot.alt} lazy style={boxStyle}>
          <XhImageImage />
          <XhImageFallback>加载中</XhImageFallback>
        </XhImageRoot>
      ))}
    </div>
  );
}
