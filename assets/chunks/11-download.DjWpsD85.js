var e=`<!-- 下载 | 旁边放一个下载按钮，点下去时按码此刻画出来的样子存成 SVG：底色与前景色一并写进文件，印刷、贴到别处都能扫 -->
<script setup lang="ts">
import { DownloadIcon } from "@xihan-ui/icons";
import { XhDownloadTrigger, XhIcon, XhMatrixCode } from "@xihan-ui/vue";
import { ref } from "vue";

const box = ref<HTMLElement | null>(null);

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
<\/script>

<template>
  <div style="display: grid; gap: var(--xh-space-3); justify-items: start">
    <div ref="box">
      <XhMatrixCode value="https://ui.xihanfun.com" />
    </div>
    <XhDownloadTrigger :data="() => svgOf(box!)" file-name="xihan-ui.svg" mime-type="image/svg+xml">
      <XhIcon :icon="DownloadIcon" /> 下载 SVG
    </XhDownloadTrigger>
  </div>
</template>
`;export{e as default};