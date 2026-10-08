var e=`<!-- 下载 | 旁边放一个下载按钮，点下去时按码此刻画出来的样子存成 SVG：底色与前景色一并写进文件 -->
<div style="display: grid; gap: var(--xh-space-3); justify-items: start">
  <xh-bar-code id="bar-code-download" value="XH-2026-0915">
    <svg data-xh-part="root"></svg>
  </xh-bar-code>
  <xh-download-trigger id="bar-code-download-download" file-name="xh-2026-0915.svg" mime-type="image/svg+xml">
    <button data-xh-part="root">
      <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10L12 15L17 10"/><path d="M12 3V15"/></svg>
      下载 SVG
    </button>
  </xh-download-trigger>
</div>

<script type="module">
  const code = document.getElementById("bar-code-download");
  // 按码此刻画出来的样子存成 SVG：皮肤给的底色与前景色写进文件，离开页面也照样能扫
  function svgOf(box) {
    const svg = box.querySelector("svg");
    const style = getComputedStyle(svg);
    const copy = svg.cloneNode(true);
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

  // 内容在点下去那一刻才生成：码换了值，下载的也跟着换
  document.getElementById("bar-code-download-download").data = () => svgOf(code);
<\/script>
`;export{e as default};