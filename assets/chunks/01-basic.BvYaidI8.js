const a=`<!-- 基础用法 | 必备部件是 trigger / content / area / area-thumb，缺一个组件就不工作 -->
<xh-color-picker default-value="#00a98e">
  <div data-xh-part="root">
    <button data-xh-part="trigger">
      <span data-xh-part="swatch"></span>
      <span data-xh-part="value-text"></span>
    </button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="area">
          <div data-xh-part="area-thumb"></div>
        </div>
        <div data-xh-part="channel-slider" channel="hue">
          <div data-xh-part="channel-slider-track"></div>
          <div data-xh-part="channel-slider-thumb"></div>
        </div>
      </div>
    </div>
  </div>
</xh-color-picker>
`;export{a as default};
