const e=`<!-- 基础用法 | 一条滑杆只推颜色的一路，默认是色相：值是整个颜色串，轨道画的是这一路从头走到尾的颜色 -->
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 320px">
  <xh-color-slider id="color-slider-basic" default-value="#3b82f6" name="accent">
    <div data-xh-part="root">
      <label data-xh-part="label">色相</label>
      <div data-xh-part="control">
        <div data-xh-part="track"></div>
        <div data-xh-part="thumb">
          <input data-xh-part="hidden-input" />
        </div>
      </div>
    </div>
  </xh-color-slider>
  <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px">
    <xh-color-swatch id="color-slider-basic-swatch" value="#3b82f6"><span data-xh-part="root"></span></xh-color-swatch>
    <code id="color-slider-basic-value">#3b82f6</code>
  </span>
</div>

<script type="module">
  // 色块与文字跟着值走
  const slider = document.getElementById("color-slider-basic");
  const swatch = document.getElementById("color-slider-basic-swatch");
  const readout = document.getElementById("color-slider-basic-value");
  slider.addEventListener("value-change", (event) => {
    swatch.value = event.detail.value;
    readout.textContent = event.detail.value;
  });
<\/script>
`;export{e as default};
