const n=`<!-- 基础用法 | 值恒是数组，单滑块即长度 1；方向键走一格 step，PageUp 与 PageDown 走 largeStep，Home 与 End 贴到端点 -->
<xh-slider
  id="slider-basic"
  default-value="40"
  min="0"
  max="100"
  step="1"
  large-step="10"
  name="volume"
>
  <div data-xh-part="root" style="inline-size: 320px">
    <label data-xh-part="label">
      音量：<span id="slider-basic-value">40</span>
    </label>
    <div data-xh-part="control">
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
      <div data-xh-part="thumb">
        <input data-xh-part="hidden-input" />
      </div>
    </div>
  </div>
</xh-slider>

<script type="module">
  // 标签里的数字跟着值走
  const slider = document.getElementById("slider-basic");
  const readout = document.getElementById("slider-basic-value");
  slider.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0];
  });
<\/script>
`;export{n as default};
