const t=`<!-- 竖排 | orientation 只改视觉排布，四个方向键与 Home/End 照样都能走 -->
<xh-segmented orientation="vertical" default-value="cozy">
  <div data-xh-part="root" aria-label="行高">
    <span data-xh-part="indicator"></span>
    <button data-xh-part="item" value="compact">
      <span data-xh-part="item-text">紧凑</span>
    </button>
    <button data-xh-part="item" value="cozy">
      <span data-xh-part="item-text">适中</span>
    </button>
    <button data-xh-part="item" value="comfortable">
      <span data-xh-part="item-text">宽松</span>
    </button>
    <input data-xh-part="hidden-input" />
  </div>
</xh-segmented>
`;export{t as default};
