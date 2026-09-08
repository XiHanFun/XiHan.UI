const n=`<!-- 边缘渐隐 | variant="fade" 让还滚得动的那一侧把内容淡出，滚到头即收；带宽跟着 size 走 -->
<xh-scroll-area id="scroll-area-fade" variant="fade" size="lg">
  <div data-xh-part="root" style="block-size: 180px; inline-size: 100%; max-inline-size: 320px">
    <div data-xh-part="viewport">
      <div data-xh-part="content" style="padding: 8px 12px"></div>
    </div>
    <div data-xh-part="scrollbar" orientation="vertical">
      <div data-xh-part="track">
        <div data-xh-part="thumb"></div>
      </div>
    </div>
  </div>
</xh-scroll-area>

<script type="module">
  // 18 行，纵向溢出，两端各铺一道渐隐带
  const content = document
    .getElementById("scroll-area-fade")
    .querySelector('[data-xh-part="content"]');
  for (let i = 1; i <= 18; i++) {
    const line = document.createElement("p");
    line.style.cssText = "margin: 0; line-height: 28px";
    line.textContent = \`第 \${i} 行内容\`;
    content.append(line);
  }
<\/script>
`;export{n as default};
