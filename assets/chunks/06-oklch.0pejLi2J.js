var e=`<!-- oklch 写法 | format="oklch" 让值串与主题令牌同一色空间，取到的颜色可以直接写回令牌；工作色在 sRGB 内，超出 sRGB 的 oklch 值按通道夹回 -->
<xh-color-picker default-value="oklch(62.31% 0.188 259.81)" format="oklch">
  <div data-xh-part="root">
    <label data-xh-part="label">主题主色</label>
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
        <div data-xh-part="hue-slider">
          <div data-xh-part="control">
            <div data-xh-part="track"></div>
            <div data-xh-part="thumb"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-color-picker>
`;export{e as default};