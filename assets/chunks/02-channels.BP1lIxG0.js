const a=`<!-- 通道并排 | 几条共用同一个值、各调节自己的通道；开启 alpha 使调节色相时透明度不丢失，即组成一个 HSV 调色面板 -->
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 320px">
  <!-- 四条共用一个值；alpha 显式开着，推色相 / 饱和度 / 明度时透明度那一位才留得住 -->
  <xh-color-slider class="color-slider-channels" channel="hue" alpha size="sm">
    <div data-xh-part="root">
      <label data-xh-part="label">色相</label>
      <div data-xh-part="control">
        <div data-xh-part="track"></div>
        <div data-xh-part="thumb"><span data-xh-part="value-text"></span></div>
      </div>
    </div>
  </xh-color-slider>
  <xh-color-slider class="color-slider-channels" channel="saturation" alpha size="sm">
    <div data-xh-part="root">
      <label data-xh-part="label">饱和度</label>
      <div data-xh-part="control">
        <div data-xh-part="track"></div>
        <div data-xh-part="thumb"><span data-xh-part="value-text"></span></div>
      </div>
    </div>
  </xh-color-slider>
  <xh-color-slider class="color-slider-channels" channel="brightness" alpha size="sm">
    <div data-xh-part="root">
      <label data-xh-part="label">明度</label>
      <div data-xh-part="control">
        <div data-xh-part="track"></div>
        <div data-xh-part="thumb"><span data-xh-part="value-text"></span></div>
      </div>
    </div>
  </xh-color-slider>
  <xh-color-slider class="color-slider-channels" channel="alpha" alpha size="sm">
    <div data-xh-part="root">
      <label data-xh-part="label">透明度</label>
      <div data-xh-part="control">
        <div data-xh-part="track"></div>
        <div data-xh-part="thumb"><span data-xh-part="value-text"></span></div>
      </div>
    </div>
  </xh-color-slider>
  <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px">
    <xh-color-swatch id="color-slider-channels-swatch" value="#3b82f680" size="lg"><span data-xh-part="root"></span></xh-color-swatch>
    <code id="color-slider-channels-value">#3b82f680</code>
  </span>
</div>

<script type="module">
  // 值由这段脚本持有，四条滑杆都受控于它：一条推动，其余三条跟着换轨道
  const sliders = [...document.querySelectorAll(".color-slider-channels")];
  const swatch = document.getElementById("color-slider-channels-swatch");
  const readout = document.getElementById("color-slider-channels-value");
  function apply(next) {
    for (const slider of sliders) slider.value = next;
    swatch.value = next;
    readout.textContent = next;
  }
  apply("#3b82f680");
  for (const slider of sliders)
    slider.addEventListener("value-change", (event) => apply(event.detail.value));
<\/script>
`;export{a as default};
