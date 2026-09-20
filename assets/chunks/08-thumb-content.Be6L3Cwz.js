const n=`<!-- 滑块中的内容 | thumb 是一个普通容器，放置什么由作者决定；容纳空间依靠 --xh-slider-thumb-size 撑开直径 -->
<xh-slider id="slider-thumb-content" default-value="45" step="5">
  <div
    data-xh-part="root"
    style="inline-size: 320px; --xh-slider-thumb-size: 34px"
  >
    <label data-xh-part="label">完成度</label>
    <div data-xh-part="control">
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
      <div data-xh-part="thumb">
        <span
          id="slider-thumb-content-badge"
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            block-size: 100%;
            font-size: 11px;
            color: var(--xh-fg-on-brand);
          "
        >
          45%
        </span>
        <input data-xh-part="hidden-input" />
      </div>
    </div>
  </div>
</xh-slider>

<script type="module">
  // 滑块里的数字跟着值走
  const slider = document.getElementById("slider-thumb-content");
  const badge = document.getElementById("slider-thumb-content-badge");
  slider.addEventListener("value-change", (event) => {
    badge.textContent = \`\${event.detail.value[0]}%\`;
  });
<\/script>
`;export{n as default};
