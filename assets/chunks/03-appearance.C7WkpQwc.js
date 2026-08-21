const n=`<!-- 厚度与颜色 | height 数字按像素、字符串按任意 CSS 长度；color 只改进度段的底色 -->
<xh-loading-bar id="loading-bar-appearance" height="6" color="#f97316">
  <div data-xh-part="root">
    <div data-xh-part="track">
      <div data-xh-part="range"></div>
    </div>
  </div>
</xh-loading-bar>

<div
  id="loading-bar-appearance-actions"
  style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px"
>
  <xh-button variant="solid" data-loading="on">
    <button data-xh-part="root">开始加载</button>
  </xh-button>
  <xh-button variant="outline" data-loading="off">
    <button data-xh-part="root">结束加载</button>
  </xh-button>
  <span>6px 厚的橙色条子，仍然贴在视口顶边</span>
</div>

<script type="module">
  const bar = document.getElementById("loading-bar-appearance");
  const actions = document.getElementById("loading-bar-appearance-actions");
  for (const button of actions.querySelectorAll("[data-loading]")) {
    button.addEventListener("click", () => {
      bar.loading = button.dataset.loading === "on";
    });
  }
<\/script>
`;export{n as default};
