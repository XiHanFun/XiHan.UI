const t=`<!-- 精确输入 | 输入色值或使用屏幕取色 -->
<xh-color-picker id="color-picker-inputs" default-value="#3b82f6">
  <div data-xh-part="root">
    <label data-xh-part="label">品牌色</label>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="swatch"></span>
        <span data-xh-part="value-text"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="saturation-area">
          <div data-xh-part="area-thumb"></div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px">
          <button data-xh-part="eye-dropper-trigger">
            <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.5 4.5a2.4 2.4 0 0 0-3.4 0L12.6 8L16 11.4L19.5 7.9a2.4 2.4 0 0 0 0-3.4Z"/><path d="M11.6 9L15 12.4"/><path d="M3.5 20.5L4.5 19.5H7.5L16 11"/><path d="M4.5 19.5V16.5L12.6 8.4"/></svg>
          </button>
          <div data-xh-part="hue-slider" style="flex: 1">
            <div data-xh-part="control">
              <div data-xh-part="track"></div>
              <div data-xh-part="thumb"></div>
            </div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 6px">
          <input data-xh-part="channel-input" channel="hex" />
          <input data-xh-part="channel-input" channel="r" />
          <input data-xh-part="channel-input" channel="g" />
          <input data-xh-part="channel-input" channel="b" />
        </div>
      </div>
    </div>
  </div>
</xh-color-picker>

<script type="module">
  document.getElementById("color-picker-inputs").translations = {
    eyeDropperTrigger: "从屏幕上取色",
  };
<\/script>
`;export{t as default};
