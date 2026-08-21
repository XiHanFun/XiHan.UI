const n=`<!-- 基础用法 | root 要有确定高度，视口才量得出溢出；滚动走的是浏览器原生通路，组件只画滚动条 -->
<xh-scroll-area id="scroll-area-basic">
  <div data-xh-part="root" style="block-size: 180px; inline-size: 100%; max-inline-size: 420px">
    <div data-xh-part="viewport">
      <div data-xh-part="content" style="padding: 8px 12px"></div>
    </div>
    <div data-xh-part="scrollbar" orientation="vertical">
      <div data-xh-part="thumb"></div>
    </div>
  </div>
</xh-scroll-area>

<script type="module">
  // 30 行内容填进内容层
  const content = document
    .getElementById("scroll-area-basic")
    .querySelector('[data-xh-part="content"]');
  for (let i = 1; i <= 30; i++) {
    const line = document.createElement("p");
    line.style.cssText = "margin: 0; line-height: 24px";
    line.textContent = \`第 \${i} 行内容\`;
    content.append(line);
  }
<\/script>
`;export{n as default};
