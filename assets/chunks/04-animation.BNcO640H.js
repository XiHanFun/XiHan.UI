const e=`<!-- 动效 | 在微光、呼吸和静止三档之间选择 -->
<div style="display: flex; flex-wrap: wrap; gap: 20px">
  <xh-skeleton animation="shimmer">
    <div data-xh-part="root" style="inline-size: 140px">
      <span>shimmer</span>
      <div data-xh-part="item" shape="rect" style="--xh-skeleton-rect-block-size: 64px"></div>
      <div data-xh-part="item" style="inline-size: 70%"></div>
    </div>
  </xh-skeleton>
  <xh-skeleton animation="pulse">
    <div data-xh-part="root" style="inline-size: 140px">
      <span>pulse</span>
      <div data-xh-part="item" shape="rect" style="--xh-skeleton-rect-block-size: 64px"></div>
      <div data-xh-part="item" style="inline-size: 70%"></div>
    </div>
  </xh-skeleton>
  <xh-skeleton animation="none">
    <div data-xh-part="root" style="inline-size: 140px">
      <span>none</span>
      <div data-xh-part="item" shape="rect" style="--xh-skeleton-rect-block-size: 64px"></div>
      <div data-xh-part="item" style="inline-size: 70%"></div>
    </div>
  </xh-skeleton>
</div>
`;export{e as default};
