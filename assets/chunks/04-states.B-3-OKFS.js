const a=`<!-- 竖直与状态 | orientation 竖排时渐变自下而上；禁用时标签换禁用前景、颜色带压暗，只读保留 Tab 位但不可调节 -->
<div style="display: flex; align-items: flex-start; gap: 32px">
  <xh-color-slider default-value="#f59e0b" channel="brightness" orientation="vertical">
    <div data-xh-part="root">
      <label data-xh-part="label">明度</label>
      <div data-xh-part="control">
        <div data-xh-part="track"></div>
        <div data-xh-part="thumb"></div>
      </div>
    </div>
  </xh-color-slider>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 240px">
    <xh-color-slider default-value="#f59e0b" disabled>
      <div data-xh-part="root">
        <label data-xh-part="label">禁用</label>
        <div data-xh-part="control">
          <div data-xh-part="track"></div>
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-color-slider>
    <xh-color-slider default-value="#f59e0b" read-only>
      <div data-xh-part="root">
        <label data-xh-part="label">只读</label>
        <div data-xh-part="control">
          <div data-xh-part="track"></div>
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-color-slider>
    <xh-color-slider default-value="#f59e0b" invalid size="lg">
      <div data-xh-part="root">
        <label data-xh-part="label">无效（大号）</label>
        <div data-xh-part="control">
          <div data-xh-part="track"></div>
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-color-slider>
  </div>
</div>
`;export{a as default};
