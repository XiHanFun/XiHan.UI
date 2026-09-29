const t=`<!-- 全屏水印 | 固定铺满整个视口，压在页面一切内容之上 -->
<xh-button id="watermark-fullscreen-toggle" variant="outline">
  <button data-xh-part="root">铺上全屏水印</button>
</xh-button>
<xh-watermark id="watermark-fullscreen" fullscreen text="XiHan · 内部资料" hidden>
  <div data-xh-part="root"></div>
</xh-watermark>

<script type="module">
  const toggle = document.getElementById("watermark-fullscreen-toggle");
  const watermark = document.getElementById("watermark-fullscreen");
  toggle.addEventListener("click", () => {
    watermark.hidden = !watermark.hidden;
    toggle.querySelector("button").textContent = watermark.hidden ? "铺上全屏水印" : "撤下全屏水印";
  });
<\/script>
`;export{t as default};
