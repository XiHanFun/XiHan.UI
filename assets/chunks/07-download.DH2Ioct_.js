const e=`// 下载 | 旁边放一个下载按钮，点下去时按码此刻画出来的样子存成 SVG：底色与前景色一并写进文件
import type { ReactNode } from "react";
import { DownloadIcon } from "@xihan-ui/icons";
import { XhBarCode, XhDownloadTrigger, XhIcon } from "@xihan-ui/react";
import { useRef } from "react";

// 按码此刻画出来的样子存成 SVG：皮肤给的底色与前景色写进文件，离开页面也照样能扫
function svgOf(box: HTMLElement): Blob {
  const svg = box.querySelector("svg")!;
  const style = getComputedStyle(svg);
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  copy.setAttribute("width", String(svg.viewBox.baseVal.width));
  copy.setAttribute("height", String(svg.viewBox.baseVal.height));
  copy.setAttribute("fill", style.color);
  const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  background.setAttribute("width", "100%");
  background.setAttribute("height", "100%");
  background.setAttribute("fill", style.backgroundColor);
  copy.prepend(background);
  return new Blob([new XMLSerializer().serializeToString(copy)], { type: "image/svg+xml" });
}

export default function Demo(): ReactNode {
  const box = useRef<HTMLDivElement>(null);
  return (
    <div style={{ display: "grid", gap: "var(--xh-space-3)", justifyItems: "start" }}>
      <div ref={box}>
        <XhBarCode value="XH-2026-0915" />
      </div>
      <XhDownloadTrigger data={() => svgOf(box.current!)} fileName="xh-2026-0915.svg" mimeType="image/svg+xml">
        <XhIcon icon={DownloadIcon} />
        {" "}
        下载 SVG
      </XhDownloadTrigger>
    </div>
  );
}
`;export{e as default};
