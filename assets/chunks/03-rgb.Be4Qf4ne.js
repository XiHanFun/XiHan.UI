const a=`<!-- 红绿蓝与写法 | 调节 RGB 三通道使用 0-255；format 决定写回的写法，这里按 rgba() 输出 -->
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 320px">
  <xh-color-slider class="color-slider-rgb" channel="red" format="rgba" size="sm">
    <div data-xh-part="root">
      <label data-xh-part="label">红</label>
      <div data-xh-part="control">
        <div data-xh-part="track"></div>
        <div data-xh-part="thumb"><span data-xh-part="value-text"></span></div>
      </div>
    </div>
  </xh-color-slider>
  <xh-color-slider class="color-slider-rgb" channel="green" format="rgba" size="sm">
    <div data-xh-part="root">
      <label data-xh-part="label">绿</label>
      <div data-xh-part="control">
        <div data-xh-part="track"></div>
        <div data-xh-part="thumb"><span data-xh-part="value-text"></span></div>
      </div>
    </div>
  </xh-color-slider>
  <xh-color-slider class="color-slider-rgb" channel="blue" format="rgba" size="sm">
    <div data-xh-part="root">
      <label data-xh-part="label">蓝</label>
      <div data-xh-part="control">
        <div data-xh-part="track"></div>
        <div data-xh-part="thumb"><span data-xh-part="value-text"></span></div>
      </div>
    </div>
  </xh-color-slider>
  <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px">
    <xh-color-swatch id="color-slider-rgb-swatch" value="rgba(59, 130, 246, 1)" size="lg"><span data-xh-part="root"></span></xh-color-swatch>
    <code id="color-slider-rgb-value">rgba(59, 130, 246, 1)</code>
  </span>
</div>

<script type="module">
  const sliders = [...document.querySelectorAll(".color-slider-rgb")];
  const swatch = document.getElementById("color-slider-rgb-swatch");
  const readout = document.getElementById("color-slider-rgb-value");
  function apply(next) {
    for (const slider of sliders) slider.value = next;
    swatch.value = next;
    readout.textContent = next;
  }
  apply("rgba(59, 130, 246, 1)");
  for (const slider of sliders)
    slider.addEventListener("value-change", (event) => apply(event.detail.value));
<\/script>
`;export{a as default};
